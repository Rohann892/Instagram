import { createSlice } from "@reduxjs/toolkit";

const callSlice = createSlice({
  name: "call",
  initialState: {
    incomingCall: null,   // { callerId, callerName, callerAvatar, callType }
    outgoingCall: null,   // { receiverId, receiverName, receiverAvatar, callType }
    callStatus: "idle",   // 'idle' | 'ringing' | 'active' | 'ended'
  },
  reducers: {
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    setOutgoingCall: (state, action) => {
      state.outgoingCall = action.payload;
    },
    setCallStatus: (state, action) => {
      state.callStatus = action.payload;
    },
    resetCall: (state) => {
      state.incomingCall = null;
      state.outgoingCall = null;
      state.callStatus = "idle";
    },
  },
});

export const { setIncomingCall, setOutgoingCall, setCallStatus, resetCall } =
  callSlice.actions;
export default callSlice.reducer;
