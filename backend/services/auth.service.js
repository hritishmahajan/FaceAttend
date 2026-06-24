const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const UserRepository = require('../repositories/user.repository');
const OtpRepository = require('../repositories/otp.repository');
const EmailService = require('./email.service');
const { AppError } = require('../middleware/errorHandler');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

async function issueOtp(userId, email) {
  const otp = generateOtp();
  OtpRepository.create({
    id: uuidv4(),
    userId,
    otp,
    expiresAt: new Date(Date.now() + config.otp.ttlMs).toISOString(),
  });
  await EmailService.sendOtp(email, otp);
  return otp;
}

async function register({ name, email, phone, password }) {
  const existing = UserRepository.findByEmailOrPhone(email, phone);
  if (existing) throw new AppError('Email or phone already registered', 409);

  const hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  UserRepository.create({ id, name, email, phone, password: hash });

  const otp = await issueOtp(id, email);
  return { userId: id, ...(config.env !== 'production' && { otp }) };
}

async function login({ email, password }) {
  const user = UserRepository.findByEmail(email);
  if (!user) throw new AppError('Invalid credentials', 401);

  if (!user.is_verified) {
    throw new AppError('Account not verified', 403, { userId: user.id });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const otp = await issueOtp(user.id, user.email);
  return { userId: user.id, ...(config.env !== 'production' && { otp }) };
}

function verifyOtp({ userId, otp }) {
  const record = OtpRepository.findActiveForUser(userId);
  if (!record || record.otp !== otp) throw new AppError('Invalid or expired OTP', 400);

  OtpRepository.markUsed(record.id);
  UserRepository.markVerified(userId);

  const user = UserRepository.publicFields(userId);
  return { token: signToken(user), user };
}

async function resendOtp(userId) {
  const user = UserRepository.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const otp = await issueOtp(userId, user.email);
  return { ...(config.env !== 'production' && { otp }) };
}

module.exports = { register, login, verifyOtp, resendOtp };
