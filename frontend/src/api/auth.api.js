import client from './client';

export const AuthApi = {
  register: body => client.post('/auth/register', body),
  login:    body => client.post('/auth/login', body),
  verifyOtp: body => client.post('/auth/verify-otp', body),
  resendOtp: body => client.post('/auth/resend-otp', body),
};
