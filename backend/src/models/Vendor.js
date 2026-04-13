const mongoose = require("mongoose");

const VENDOR_STATUS = ["draft", "pending", "approved", "rejected"];

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Step 1
    companyName: { type: String, trim: true, maxlength: 160 },
    address: { type: String, trim: true, maxlength: 500 },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Step 2
    gstNumber: { type: String, trim: true, maxlength: 30 },
    noGst: { type: Boolean, default: false },
    documents: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number },
      },
    ],

    // Step 3
    bankDetails: {
      accountNumber: { type: String, trim: true, maxlength: 40 },
      IFSC: { type: String, trim: true, maxlength: 20 },
      holderName: { type: String, trim: true, maxlength: 160 },
    },

    // Step 4
    shopName: { type: String, trim: true, maxlength: 160 },
    shopImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number },
      },
    ],

    stepCompleted: { type: Number, default: 0, min: 0, max: 4, index: true },
    status: { type: String, enum: VENDOR_STATUS, default: "draft", index: true },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = {
  Vendor: mongoose.model("Vendor", vendorSchema),
  VENDOR_STATUS,
};

