const mongoose = require('mongoose');
const DOMPurify = require('isomorphic-dompurify');

const orderSchema = new mongoose.Schema({
    stripeSessionId: { type: String, required: true, unique: true },
    customerName: String,
    customerEmail: String,
    amountTotal: Number,
    shippingAddress: Object,
    paymentStatus: String,
    items: Array,
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' },
});

orderSchema.pre('save', async function() {
    const order = this;

    // Sanitize customer name bc we don't trust these mofos
    if (order.isModified('customerName') && order.customerName) {
        order.customerName = DOMPurify.sanitize(order.customerName);
    }

    // Also sanitize shipping address
    if (order.isModified('shippingAddress') && order.shippingAddress) {
        
        const cleanAddress = { ...order.shippingAddress };

        if (cleanAddress.line1) cleanAddress.line1 = DOMPurify.sanitize(cleanAddress.line1);
        if (cleanAddress.line2) cleanAddress.line2 = DOMPurify.sanitize(cleanAddress.line2);
        if (cleanAddress.city)  cleanAddress.city  = DOMPurify.sanitize(cleanAddress.city);
        if (cleanAddress.state) cleanAddress.state = DOMPurify.sanitize(cleanAddress.state);
        
        order.shippingAddress = cleanAddress;
    }
});

module.exports = mongoose.model('Order', orderSchema);