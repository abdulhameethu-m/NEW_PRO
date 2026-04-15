const mongoose = require("mongoose");

const ORDER_STATUS = ["Pending", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_STATUS = ["Pending", "Paid", "Failed", "Refunded"];

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      index: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    shippingFee: { type: Number, min: 0, default: 0 },
    taxAmount: { type: Number, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0, default: 0 },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "INR", "GBP"],
    },
    status: {
      type: String,
      enum: ORDER_STATUS,
      default: "Pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "Pending",
      index: true,
    },
    shippingAddress: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    timeline: [
      {
        status: { type: String, enum: ORDER_STATUS, required: true },
        note: { type: String, trim: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = {
  Order: mongoose.model("Order", orderSchema),
  ORDER_STATUS,
  PAYMENT_STATUS,
};
