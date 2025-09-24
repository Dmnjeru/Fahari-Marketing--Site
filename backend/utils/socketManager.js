import { Server } from "socket.io";
import logger from "../config/logger.js";

let io;

/**
 * @desc Initialize Socket.IO for Fahari Yoghurt website
 * @param {Object} server - Express HTTP server instance
 */
export const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000", // Frontend URL
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000, // Disconnect inactive sockets after 1 minute
  });

  logger.info("⚡ Real-time Socket.IO server initialized");

  io.on("connection", (socket) => {
    logger.info(`✅ New visitor connected: ${socket.id}`);

    /**
     * @event promo:new
     * @desc Notify all users when a new promotion is added
     */
    socket.on("promo:new", (promo) => {
      io.emit("promo:update", promo);
      logger.info(`🎉 New promo broadcasted: ${promo.title}`);
    });

    /**
     * @event product:new
     * @desc Notify all users when a new product is added
     */
    socket.on("product:new", (product) => {
      io.emit("product:update", product);
      logger.info(`🛒 New product broadcasted: ${product.name}`);
    });

    /**
     * @event blog:new
     * @desc Notify all visitors when a new blog is published
     */
    socket.on("blog:new", (blog) => {
      io.emit("blog:update", blog);
      logger.info(`📰 New blog broadcasted: ${blog.title}`);
    });

    /**
     * @event disconnect
     * @desc Handle visitor disconnect
     */
    socket.on("disconnect", () => {
      logger.info(`❌ Visitor disconnected: ${socket.id}`);
    });
  });
};

/**
 * @desc Get Socket.IO instance safely
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet!");
  }
  return io;
};
