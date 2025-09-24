// backend/controllers/analyticsController.js
import User from "../models/User.js";
import Product from "../models/Product.js";

import Blog from "../models/Blog.js";
import Promo from "../models/Promo.js";
import logger from "../config/logger.js";

/**
 * @desc    Get overall dashboard statistics
 * @route   GET /api/analytics/overview
 * @access  Private (Admin)
 */
export const getDashboardOverview = async (req, res) => {
  try {
    // Run counts in parallel for performance
    const [totalUsers, totalProducts, totalOrders, totalBlogs, totalPromos] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Blog.countDocuments({ isPublished: true }),
        Promo.countDocuments(),
      ]);

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalBlogs,
        totalPromos,
      },
    });

    logger.info("✅ Dashboard overview fetched successfully");
  } catch (error) {
    logger.error(`❌ Dashboard overview error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
    });
  }
};

/**
 * @desc    Get top-selling products
 * @route   GET /api/analytics/top-products
 * @access  Private (Admin)
 */
export const getTopProducts = async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSales: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
    ]);

    const productIds = products.map((p) => p._id);

    // Populate product details
    const populatedProducts = await Product.find({ _id: { $in: productIds } })
      .select("name price images")
      .lean();

    // Merge sales count with product details
    const merged = populatedProducts.map((prod) => {
      const salesData = products.find(
        (p) => p._id.toString() === prod._id.toString()
      );
      return { ...prod, totalSales: salesData?.totalSales || 0 };
    });

    res.status(200).json({
      success: true,
      data: merged,
    });

    logger.info("✅ Top products fetched successfully");
  } catch (error) {
    logger.error(`❌ Top products error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
    });
  }
};

/**
 * @desc    Get most viewed blogs
 * @route   GET /api/analytics/top-blogs
 * @access  Private (Admin)
 */
export const getTopBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ views: -1 })
      .limit(5)
      .select("title views createdAt");

    res.status(200).json({
      success: true,
      data: blogs,
    });

    logger.info("✅ Top blogs fetched successfully");
  } catch (error) {
    logger.error(`❌ Top blogs error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top blogs",
    });
  }
};

/**
 * @desc    Get revenue & order stats by date range
 * @route   GET /api/analytics/stats?range=30
 * @access  Private (Admin)
 */
export const getRevenueStats = async (req, res) => {
  try {
    const range = Math.max(Number(req.query.range) || 30, 1); // fallback to 30 days min
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);

    const stats = await Order.aggregate([
      {
        $match: {
          status: "Completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });

    logger.info("✅ Revenue stats fetched successfully");
  } catch (error) {
    logger.error(`❌ Revenue stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue stats",
    });
  }
};
