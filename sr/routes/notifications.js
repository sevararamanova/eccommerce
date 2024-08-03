const express = require("express");
const verify_admin = require("../middlewares/verify-admin");
const Notification = require("../models/Notification");

const notifications = express.Router();

notifications.get("/active", async (req, res) => {
    const notifications = await Notification.findOne({active: true});

    res.status(200).json({
        payload: notifications
    })
})

notifications.get("/all", async (req, res) => {
    const notifications = await Notification.find({});

    res.status(200).json({
        payload: notifications
    })
})

notifications.patch("/update", verify_admin, async (req, res) => {
    const notification = await Notification.findOneAndUpdate({active: true}, {active: false});

    res.status(200).json({
        payload: notification
    })
})

notifications.post("/create", verify_admin, async (req, res) => {
    const { message } = req.body
    const notification = await Notification.create({message});

    res.status(200).json({
        paload: notification
    })
})

notifications.delete("/delete/:id", verify_admin, async (req, res) => {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({
        payload: notification
    })
})

module.exports = notifications