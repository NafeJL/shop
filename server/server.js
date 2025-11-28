require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Routes & Controllers
const productRoutes = require('./routes/productRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { handleWebhook } = require('./controllers/stripeController');

const app = express();
const PORT = 5000;

// SECURITY HEADERS
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS said the 1930s child
app.use(cors({
    origin: [process.env.CLIENT_URL, 'https://vaexium.com']
}));

// WEBHOOK ROUTE (Must be before express.json else peril)
app.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

// Securitay bc otherwise we can't have nice things
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers // Learn wtf this means
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers // this too
});
app.use(limiter);

// MIDDLEWARE
app.use(express.json());

// This can go when we have better image hosting
app.use('/images', express.static(path.join(__dirname, 'public/images')));


// ROUTE MOUNTING
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api', stripeRoutes); 

// DATABASE & SERVER START
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.log('❌ Database Error:', err));