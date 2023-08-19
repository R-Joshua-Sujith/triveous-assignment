const mongoose = require("mongoose")
const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    availability: {
        type: Boolean, required: true, default: true
    },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories', required: true }
})

const ProductModel = mongoose.model("Product", ProductSchema)

module.exports = ProductModel;