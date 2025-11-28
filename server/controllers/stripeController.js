const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');

const SHIPPING_ZONES = {
    DOMESTIC: ['GB'],
    ANGLOSPHERE: ['US', 'GB', 'CA', 'AU'],
    MAJOR_INTL: ['US', 'GB', 'CA', 'AU', 'NZ', 'FR', 'DE', 'JP'],
    EU: ['GB', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'],
};

const createCheckoutSession = async (req, res) => {
    try {
        const { items } = req.body; 

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Invalid or empty items array" });
        }

        const lineItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findOne({ id: item.id });
            
            if (!product) throw new Error(`Product ${item.id} not found`);

            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                throw new Error("Invalid quantity");
            }

            return {
                price_data: {
                    currency: 'gbp',
                    product_data: { name: product.name },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: item.quantity,
            };
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: { allowed_countries: SHIPPING_ZONES.DOMESTIC }, // Can be any of the above defined zones
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/shop/display/success.html`, 
            cancel_url: `${process.env.CLIENT_URL}/shop/display/cancel.html`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: "An error occurred while processing payment." });
    }
};

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // req.body here must be the RAW buffer, handled by route config
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        try {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const newOrder = new Order({
                stripeSessionId: session.id,
                customerName: session.customer_details.name,
                customerEmail: session.customer_details.email,
                amountTotal: session.amount_total / 100,
                shippingAddress: session.customer_details.address,
                paymentStatus: session.payment_status,
                items: lineItems.data
            });
            await newOrder.save();
        } catch (error) {
            console.error("Error saving order:", error);
        }
    }
    res.send();
};

module.exports = { createCheckoutSession, handleWebhook };