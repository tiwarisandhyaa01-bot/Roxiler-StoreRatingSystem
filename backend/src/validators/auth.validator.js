const validateRegistration = ({ name, email, address, password }) => {
  const errors = {};

  if (!name || name.trim().length < 20 || name.trim().length > 60) {
    errors.name = "Name must be between 20 and 60 characters.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please provide a valid email address.";
  }

  if (!address || address.trim().length > 400) {
    errors.address = "Address must not exceed 400 characters.";
  }

  if (
    !password ||
    password.length < 8 ||
    password.length > 16 ||
    !/[A-Z]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    errors.password =
      "Password must be 8-16 characters and contain at least one uppercase letter and one special character.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateRegistration,
};