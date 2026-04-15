const { Order } = require("../models/Order");

class OrderRepository {
  async list({
    page = 1,
    limit = 20,
    status,
    search,
    sortBy = "createdAt",
    sortOrder = -1,
  } = {}) {
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "name email phone")
        .populate("sellerId", "companyName")
        .populate("items.productId", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async countDocuments(query = {}) {
    return await Order.countDocuments(query);
  }

  async sumRevenue() {
    const [result] = await Order.aggregate([
      { $match: { status: { $in: ["Shipped", "Delivered"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    return result?.totalRevenue || 0;
  }

  async findById(id) {
    return await Order.findById(id)
      .populate("userId", "name email phone")
      .populate("sellerId", "companyName")
      .populate("items.productId", "name slug")
      .exec();
  }

  async updateStatus(id, status) {
    const update = {
      $set: {
        status,
        ...(status === "Delivered" ? { deliveredAt: new Date() } : {}),
      },
      $push: {
        timeline: {
          status,
          changedAt: new Date(),
        },
      },
    };

    return await Order.findByIdAndUpdate(id, update, { new: true })
      .populate("userId", "name email phone")
      .populate("sellerId", "companyName")
      .populate("items.productId", "name slug")
      .exec();
  }

  async getMonthlyRevenue(limit = 6) {
    return await Order.aggregate([
      { $match: { status: { $in: ["Shipped", "Delivered"] } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          label: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          revenue: 1,
          orders: 1,
        },
      },
      { $sort: { label: 1 } },
    ]);
  }
}

module.exports = new OrderRepository();
