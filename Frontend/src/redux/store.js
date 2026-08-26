import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from './authSlice'
import postSlice from './postSlice'
import chatSlice from './chatSlice'
import socketSlice from './socketSlice'
import rtnSlice from './rtnSlice'
import callSlice from './callSlice'
import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const rootReducer = combineReducers({
    auth: authSlice,
    post: postSlice,
    chat: chatSlice,
    socketio: socketSlice,
    realTimeNotification: rtnSlice,
    call: callSlice,
})

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    blacklist: ['socketio', 'chat', 'realTimeNotification', 'call']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                    'socketio/setSocket',
                ],
                ignoredPaths: ['socketio.socket'],
            },
        }),
})

export default store;