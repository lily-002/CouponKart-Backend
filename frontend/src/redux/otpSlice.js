// ../redux/otpSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  emailOtp: '',
  mobileOtp: '',
  emailVerified: false,
  mobileVerified: false,
  error: null,
};

const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    setEmailOtp: (state, action) => {
      state.emailOtp = action.payload;
    },
    setMobileOtp: (state, action) => {
      state.mobileOtp = action.payload;
    },
    verifyEmailOtp: (state) => {
      state.emailVerified = true;
    },
    verifyMobileOtp: (state) => {
      state.mobileVerified = true;
    },
    setOtpError: (state, action) => {
      state.error = action.payload;
    },
    clearOtpState: () => initialState,
  },
});

export const {
  setEmailOtp,
  setMobileOtp,
  verifyEmailOtp,
  verifyMobileOtp,
  setOtpError,
  clearOtpState,
} = otpSlice.actions;

// Default export of the reducer
export default otpSlice.reducer;
