const adminService = require("./admin.service");

const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics.",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, address, and role are required.",
      });
    }

    const nameLength = name.trim().length;
    const addressLength = address.trim().length;

    if (nameLength < 20 || nameLength > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 20 and 60 characters.",
      });
    }

    if (addressLength > 400) {
      return res.status(400).json({
        success: false,
        message: "Address must not exceed 400 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8-16 characters and contain at least one uppercase letter and one special character.",
      });
    }

    const user = await adminService.createUser({
      name,
      email,
      password,
      address,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create user.",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await adminService.getUsers(req.query);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user details error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch user details.",
    });
  }
};
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.trim().length < 20 || name.trim().length > 60) {
      return res.status(400).json({
        success: false,
        message: "Store name must be between 20 and 60 characters.",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid store email address.",
      });
    }

    if (!address || address.trim().length > 400) {
      return res.status(400).json({
        success: false,
        message: "Store address must not exceed 400 characters.",
      });
    }

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Store Owner is required.",
      });
    }

    const store = await adminService.createStore({
      name,
      email,
      address,
      ownerId,
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully.",
      data: store,
    });
  } catch (error) {
    console.error("Create store error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create store.",
    });
  }
};

const getStores = async (req, res) => {
  try {
    const stores = await adminService.getStores(req.query);

    return res.status(200).json({
      success: true,
      data: stores,
    });
  } catch (error) {
    console.error("Get stores error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch stores.",
    });
  }
};
const getStoreById = async (req, res) => {
  try {
    const store = await adminService.getStoreById(req.params.id);

    return res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error("Get store details error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch store details.",
    });
  }
};
module.exports = {
  getDashboardStats,
  createUser,
  getUsers,
  getUserById,
  createStore,
  getStores,
  getStoreById,
};







