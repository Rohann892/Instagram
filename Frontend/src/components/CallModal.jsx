import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetCall, setCallStatus, setIncomingCall } from "@/redux/callSlice";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneMissed,
} from "lucide-react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const CallModal = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  const { user } = useSelector((store) => store.auth);
  const { incomingCall, outgoingCall, callStatus } = useSelector(
    (store) => store.call
  );

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const isCallActive = callStatus === "active";
  const isRinging = callStatus === "ringing";
  const isVisible = incomingCall !== null || outgoingCall !== null;

  const callType =
    incomingCall?.callType || outgoingCall?.callType || "video";

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    pendingCandidatesRef.current = [];
    setIsMuted(false);
    setIsVideoOff(false);
  }, []);

  const endCallAndReset = useCallback(
    (targetId) => {
      if (socket && targetId) {
        socket.emit("endCall", { targetId });
      }
      cleanup();
      dispatch(resetCall());
    },
    [socket, cleanup, dispatch]
  );

  // ─── Create peer connection ───────────────────────────────────────────────
  const createPeerConnection = useCallback(
    (targetId) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("ice-candidate", {
            targetId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "closed"
        ) {
          cleanup();
          dispatch(resetCall());
        }
      };

      return pc;
    },
    [socket, cleanup, dispatch]
  );

  // ─── Get local media ─────────────────────────────────────────────────────
  const getLocalStream = useCallback(async (type) => {
    const constraints =
      type === "audio"
        ? { audio: true, video: false }
        : { audio: true, video: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  // ─── Caller: start call ───────────────────────────────────────────────────
  useEffect(() => {
    if (!outgoingCall || !socket) return;

    const startCall = async () => {
      try {
        const stream = await getLocalStream(callType);
        const pc = createPeerConnection(outgoingCall.receiverId);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        peerConnectionRef.current = pc;

        // Send ring signal
        socket.emit("initiateCall", {
          receiverId: outgoingCall.receiverId,
          callerId: user._id,
          callerName: user.username,
          callerAvatar: user.profileImage,
          callType,
        });

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-offer", {
          receiverId: outgoingCall.receiverId,
          offer,
        });
      } catch (err) {
        console.error("Error starting call:", err);
        dispatch(resetCall());
      }
    };

    startCall();
  }, [outgoingCall]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Socket event listeners ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Caller: receiver accepted → set remote description
    const handleCallAccepted = async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        // Flush pending ICE candidates
        for (const c of pendingCandidatesRef.current) {
          await peerConnectionRef.current.addIceCandidate(c);
        }
        pendingCandidatesRef.current = [];
        dispatch(setCallStatus("active"));
      }
    };

    // Caller: receiver rejected
    const handleCallRejected = () => {
      cleanup();
      dispatch(resetCall());
    };

    // Receiver: got offer from caller
    const handleOffer = async ({ offer, callerId }) => {
      // Wait until user accepts before processing offer
      // Store offer for use in accept handler
      socket._pendingOffer = { offer, callerId };
    };

    // ICE candidate from peer
    const handleIceCandidate = async ({ candidate }) => {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        pendingCandidatesRef.current.push(new RTCIceCandidate(candidate));
      }
    };

    // Other party ended the call
    const handleCallEnded = () => {
      cleanup();
      dispatch(resetCall());
    };

    socket.on("callAccepted", handleCallAccepted);
    socket.on("callRejected", handleCallRejected);
    socket.on("webrtc-offer", handleOffer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callRejected", handleCallRejected);
      socket.off("webrtc-offer", handleOffer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket, cleanup, dispatch]);

  // ─── Receiver: accept call ────────────────────────────────────────────────
  const acceptCall = async () => {
    if (!socket || !incomingCall) return;
    try {
      const stream = await getLocalStream(callType);
      const pc = createPeerConnection(incomingCall.callerId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      peerConnectionRef.current = pc;

      // Get the stored offer
      const { offer, callerId } = socket._pendingOffer || {};
      if (offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Flush any early ICE candidates
        for (const c of pendingCandidatesRef.current) {
          await pc.addIceCandidate(c);
        }
        pendingCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("callAccepted", { callerId, answer });
        socket._pendingOffer = null;
        dispatch(setCallStatus("active"));
      }
    } catch (err) {
      console.error("Error accepting call:", err);
      dispatch(resetCall());
    }
  };

  // ─── Receiver: reject call ────────────────────────────────────────────────
  const rejectCall = () => {
    if (socket && incomingCall) {
      socket.emit("callRejected", { callerId: incomingCall.callerId });
    }
    socket._pendingOffer = null;
    dispatch(resetCall());
  };

  // ─── Controls ─────────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  };

  const handleEndCall = () => {
    const targetId = incomingCall?.callerId || outgoingCall?.receiverId;
    endCallAndReset(targetId);
  };

  if (!isVisible) return null;

  const displayName =
    incomingCall?.callerName || outgoingCall?.receiverName || "User";
  const displayAvatar =
    incomingCall?.callerAvatar || outgoingCall?.receiverAvatar;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Remote video (fullscreen background when active) */}
      {isCallActive && callType === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.9,
          }}
        />
      )}

      {/* Overlay gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.8) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.4)",
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(255,255,255,0.15)",
          }}
        >
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              {displayName[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Name */}
        <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          {displayName}
        </p>

        {/* Status */}
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            margin: 0,
            letterSpacing: "0.05em",
          }}
        >
          {isRinging && incomingCall
            ? `Incoming ${callType} call…`
            : isRinging && outgoingCall
            ? `Calling…`
            : isCallActive
            ? `${callType === "video" ? "Video" : "Audio"} call in progress`
            : ""}
        </p>
      </div>

      {/* Local video PiP */}
      {isCallActive && callType === "video" && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute",
            bottom: 120,
            right: 24,
            width: 120,
            height: 160,
            borderRadius: 12,
            objectFit: "cover",
            border: "2px solid rgba(255,255,255,0.3)",
            zIndex: 20,
            background: "#000",
            transform: "scaleX(-1)",
          }}
        />
      )}

      {/* Audio-only: hidden video elements */}
      {callType === "audio" && (
        <>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ display: "none" }} />
          <video ref={remoteVideoRef} autoPlay playsInline style={{ display: "none" }} />
        </>
      )}

      {/* Call Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          display: "flex",
          gap: 24,
          zIndex: 20,
          alignItems: "center",
        }}
      >
        {/* ── Incoming ring: Accept / Reject ── */}
        {isRinging && incomingCall && (
          <>
            <button
              onClick={rejectCall}
              title="Decline"
              style={controlBtnStyle("#ef4444")}
            >
              <PhoneMissed size={26} />
            </button>
            <button
              onClick={acceptCall}
              title="Accept"
              style={controlBtnStyle("#22c55e")}
            >
              <Phone size={26} />
            </button>
          </>
        )}

        {/* ── Active call controls ── */}
        {isCallActive && (
          <>
            {callType === "video" && (
              <button
                onClick={toggleVideo}
                title={isVideoOff ? "Turn camera on" : "Turn camera off"}
                style={controlBtnStyle(
                  isVideoOff ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)"
                )}
              >
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
            )}
            <button
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
              style={controlBtnStyle(
                isMuted ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)"
              )}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <button
              onClick={handleEndCall}
              title="End call"
              style={controlBtnStyle("#ef4444")}
            >
              <PhoneOff size={26} />
            </button>
          </>
        )}

        {/* ── Outgoing ringing: Cancel ── */}
        {isRinging && outgoingCall && (
          <button
            onClick={handleEndCall}
            title="Cancel call"
            style={controlBtnStyle("#ef4444")}
          >
            <PhoneOff size={26} />
          </button>
        )}
      </div>
    </div>
  );
};

const controlBtnStyle = (bg) => ({
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: bg,
  border: "none",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  transition: "transform 0.15s ease, opacity 0.15s ease",
});

export default CallModal;
