const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Product = new Schema({
    product_name: {
        type: String,
        required: true,
        unique: true
    },
    original_price: {
        type: Number,
        required: true
    },
    sale_price: {
        type: Number,
        required: true
    },
    product_images: {
        type: Array
    },
    likedby: {
        type: Array
    },
    likes: {
        type: Number,
        default: 0
    },
    category: {
        type: String
    },
    product_type: {
        type: String
    },
    description: {
        type: String
    },
    number_in_stock: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("Product", Product)