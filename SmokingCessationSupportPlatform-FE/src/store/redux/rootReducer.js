import { combineReducers } from '@reduxjs/toolkit'
import useReducer from '../redux/features/userSlice'

export const rootReducer = combineReducers({
    user: useReducer,
});