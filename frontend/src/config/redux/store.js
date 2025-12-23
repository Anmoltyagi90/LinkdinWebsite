import { configureStore } from "@reduxjs/toolkit";
import authReducer from './ruducer/authReducer';
import postReducer from './ruducer/postReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer, 
    posts: postReducer
  }
});
