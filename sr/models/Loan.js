const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Loan = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sales",
        required: true
    }],
    amount: {
        type: Number,
        required: true
    },
    givenDate: {
        type: String,
        required: true
    },
    tillDate: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "not paid"
    }
})

module.exports = mongoose.model("Loan", Loan)