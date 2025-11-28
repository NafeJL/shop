const Product = require('../models/Product');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const seedProducts = async (req, res) => {
    try {
        
        const count = await Product.countDocuments();
        if (count > 0) {
            return res.send("Database already has data! No changes made.");
        }

        const sampleProducts = [
            {
                id: 1,
                name: "Sleeping Fox Desk Ornament",
                price: 8.99,
                tags: ["Cute", "Toy"],
                image: "https://res.cloudinary.com/dibmkzl7u/image/upload/v1764283680/fox_ny37jf.jpg",
                description: "A high-quality 3D print of the Minecraft fox sleeping."
            },
            {
                id: 2,
                name: "Macrodata Refinement Desk Stand",
                price: 9.50,
                tags: ["Decor", "Home"],
                image: "https://res.cloudinary.com/dibmkzl7u/image/upload/v1764283948/Picture1_vyab5k.png",
                description: "desc."
            },
            {
                id: 3,
                name: "Peeking Cat Bookmark",
                price: 6.00,
                tags: ["Tech", "Custom"],
                image: "https://res.cloudinary.com/dibmkzl7u/image/upload/v1764283865/20250301_142603_tylhjq.jpg",
                description: "desc."
            }
        ];

        await Product.insertMany(sampleProducts);
        res.send("Database seeded with products.");
    } catch (error) {
        res.status(500).send("Error seeding database: " + error.message);
    }
};

module.exports = { getProducts, seedProducts, getProductById };