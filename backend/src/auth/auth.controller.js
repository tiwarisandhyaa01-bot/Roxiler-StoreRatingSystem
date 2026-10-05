const authService = require("./auth.service");
const { validateRegistration } = require("../validators/auth.validator");

const register = async (req, res) => {
  try {
    const { isValid, errors } = validateRegistration(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: result,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Login failed.",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (
      newPassword.length < 8 ||
      newPassword.length > 16 ||
      !/[A-Z]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be 8-16 characters and contain at least one uppercase letter and one special character.",
      });
    }

    const result = await authService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Password update failed.",
    });
  }
};

module.exports = {
  register,
  login,
  changePassword,
};