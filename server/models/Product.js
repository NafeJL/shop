const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    tags: [String],
    image: String,
    description: String
});

module.exports = mongoose.model('Product', productSchema);