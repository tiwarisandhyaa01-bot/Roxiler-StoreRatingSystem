const storeService = require("./store.service");

const getStores = async (req, res) => {
  try {
    const stores = await storeService.getStores(req.user.userId, req.query);

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

const submitRating = async (req, res) => {
  try {
    const rating = Number(req.body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    const result = await storeService.submitRating(
      req.user.userId,
      req.params.storeId,
      rating
    );

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Submit rating error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit rating.",
    });
  }
};

const updateRating = async (req, res) => {
  try {
    const rating = Number(req.body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    const result = await storeService.updateRating(
      req.user.userId,
      req.params.storeId,
      rating
    );

    return res.status(200).json({
      success: true,
      message: "Rating updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Update rating error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update rating.",
    });
  }
};

module.exports = {
  getStores,
  submitRating,
  updateRating,
};
