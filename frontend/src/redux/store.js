// ../redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import otpReducer from './otpSlice'; // Import the default export

const store = configureStore({
  reducer: {
    otp: otpReducer, // Use the default export here
  }
});
console.log(store);

export default store;
