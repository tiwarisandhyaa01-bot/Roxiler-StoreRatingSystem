const ownerService = require("./owner.service");

const getOwnerDashboard = async (req, res) => {
  try {
    const dashboard = await ownerService.getOwnerDashboard(req.user.userId);

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Get owner dashboard error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch owner dashboard.",
    });
  }
};

module.exports = {
  getOwnerDashboard,
};
