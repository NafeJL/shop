const Order = require('../models/Order');

const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments();

        res.json({
            success: true,
            data: orders,
            pagination: {
                current_page: page,
                limit: limit,
                total_orders: total,
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

const shipOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: 'Shipped' },
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
};

module.exports = { getAllOrders, shipOrder };