const Joi = require('joi');

const register = Joi.object({
  name:     Joi.string().trim().min(2).max(100).required(),
  email:    Joi.string().email().lowercase().required(),
  phone:    Joi.string().pattern(/^\d{10}$/).required().messages({ 'string.pattern.base': 'Phone must be 10 digits' }),
  password: Joi.string().min(6).max(128).required(),
});

const login = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const verifyOtp = Joi.object({
  userId: Joi.string().uuid().required(),
  otp:    Joi.string().length(6).pattern(/^\d+$/).required(),
});

const resendOtp = Joi.object({
  userId: Joi.string().uuid().required(),
});

const forgotPassword = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const resetPassword = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  otp:      Joi.string().length(6).pattern(/^\d+$/).required(),
  password: Joi.string().min(6).max(128).required(),
});

module.exports = { register, login, verifyOtp, resendOtp, forgotPassword, resetPassword };
