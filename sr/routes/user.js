const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const verify_user = require("../middlewares/verify-user");
const bcrypt = require("bcrypt");

const user = express.Router();

user.post("/", async (req, res) => {
    const {username, photo_url, first_name, password} = req.body;
    let user = await User.findOne({username: username});
    const role = () => {
        if(username === "ibrohim_jalalov"){
            return "admin"
        }
        else{
            return "user"
        }
    }

    if(!user){
        user = await User.create({
            username: username,
            photo_url: photo_url,
            first_name: first_name,
            password: bcrypt.hashSync(password, 10),
            role: role()
        })
    }
    else{
        return res.status(400).json({
            message: "User already exists"
        })
    }
    
    jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 90), user: {username: user.username, role: user.role, _id: user._id} }, process.env.TOKEN_SECRET_KEY, function(err, token) {
            if(err) throw err;
            res.status(200).json({
                payload: {
                    user,
                    token
                }
            });
     })
})

user.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({username: username});

    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }
    if(!bcrypt.compareSync(password, user.password)){
        return res.status(403).json({
            message: "Wrong password or username"
        })
    }
    jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 90), user: {username: user.username, role: user.role, _id: user._id} }, process.env.TOKEN_SECRET_KEY, function(err, token) {
        if(err) throw err;
        res.status(200).json({
            payload: {
                user,
                token
            }
        });
    })
})

user.get("/profile", verify_user, async (req, res) => {
    const username = req.user.username;
    const user = await User.findOne({username: username});
    res.status(200).json({
        payload: user
    })
})

user.get("/profile/liked-products", verify_user, async (req, res) => {
    const username = req.user.username;
    const user = await User.findOne({username: username});
    const liked = user.liked;
    const products = await Product.find({ _id: { $in: liked } });
    res.status(200).json({
        payload: products
    })
})

module.exports = user;