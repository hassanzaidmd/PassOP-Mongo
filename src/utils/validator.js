const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpRegex = /^\d{6}$/;

const isFilled = (value) => typeof value === "string" && value.trim().length > 0;

const requireField = (label, value) => {
  if (!isFilled(value)) {
    return `${label} is required.`;
  }
  return null;
};

const validateEmail = (email) => {
  const required = requireField("Email", email);
  if (required) return required;
  if (!emailRegex.test(email.trim())) {
    return "Invalid email format.";
  }
  return null;
};

const validateUsername = (username) => {
  const required = requireField("Username", username);
  if (required) return required;
  if (username.trim().length < 3) {
    return "Username must be at least 3 characters.";
  }
  return null;
};

const validatePassword = (password) => {
  const required = requireField("Password", password);
  if (required) return required;
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
};

const validateSite = (site) => {
  const required = requireField("Site", site);
  if (required) return required;
  if (site.trim().length < 3) {
    return "Site must be at least 3 characters.";
  }
  return null;
};

const validateOtp = (otp) => {
  const required = requireField("OTP", otp);
  if (required) return required;
  if (!otpRegex.test(String(otp).trim())) {
    return "OTP must be a 6-digit code.";
  }
  return null;
};

const validateRole = (role) => {
  if (role !== "user" && role !== "admin") {
    return "Role must be user or admin.";
  }
  return null;
};

export const validateLogin = ({ email, password }) => validateEmail(email) || validatePassword(password);

export const validateRegister = ({ username, email, password }) =>
  validateUsername(username) || validateEmail(email) || validatePassword(password);

export const validateForgotPassword = ({ email }) => validateEmail(email);

export const validateResetPassword = ({ password }) => validatePassword(password);

export const validateVerifyOtp = ({ email, otp }) => validateEmail(email) || validateOtp(otp);

export const validateVerify2FA = ({ userId, code }) => {
  const required = requireField("User ID", userId);
  if (required) return required;
  return validateOtp(code);
};

export const validatePasswordEntry = ({ site, username, password }) =>
  validateSite(site) || validateUsername(username) || validatePassword(password);

export const validateAdminCreateUser = ({ username, email, password, role }) =>
  validateUsername(username) || validateEmail(email) || validatePassword(password) || validateRole(role);
