const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Notification = new Schema({
    message: {
        type: String,
        required: true
    },
    announcedDate: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model("Notification", Notification)