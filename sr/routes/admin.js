const express = require("express");
const Admin = require("../models/Admin");
const validationResult = require('express-validator').validationResult;
const check = require('express-validator').check;
const verify_admin = require("../middlewares/verify-admin");
const User = require("../models/User");

const admin = express.Router();

admin.post("/add-admin", verify_admin, [check("username").trim().isLength({ min: 5}).withMessage("Username must be at least 5 characters").bail()], async (req, res) => {
    const errors = validationResult(req).array();
    if(errors && errors.length > 0){
        return res.status(400).json({
            errors
        })
    }
    const admin = await Admin.findOne({username: req.body.username});
    if(admin){
        return res.status(400).json({
            message: "This admin has already been promoted"
        })
    }

    const user = await User.findOne({username: req.body.username});

    if(user){
        const newadmin = await Admin.create({
            username: req.body.username,
            promotedBy: req.user.username
        })
    
        await User.findOneAndUpdate({username: req.body.username}, {
            role: "admin"
        })
        res.status(200).json({
            newadmin
        })
    }
    else{
        res.status(400).json({
            message: "User not found"
        })
    }
})

admin.get("/registered-users", verify_admin, async (req, res) => {
    try {
        const sortField = req.query.sortField || 'username'; // Default sort field
        const sortOrder = req.query.sortOrder === 'descend' ? -1 : 1; // Default sort order is ascending
        const page = parseInt(req.query.page) || 1; // Default page number
        const pageSize = parseInt(req.query.pageSize) || 10; // Default page size
        
        const skip = (page - 1) * pageSize; // Calculate the number of documents to skip
        
        const users = await User.find({ role: "user" })
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(pageSize);
        
        const totalUsers = await User.countDocuments({ role: "user" }); // Get total number of users
        const totalPages = Math.ceil(totalUsers / pageSize); // Calculate total pages

        res.status(200).json({
            payload: users,
            currentPage: page,
            totalPages: totalPages,
            total: totalUsers
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


admin.delete("/delete-user/:id", verify_admin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json({
            payload: user,
            message: "Successfully deleted user"
        })
    } catch (error) {
        res.status(500).json({
            payload: [],
            message: error.message
        })
    }
})


module.exports = admin