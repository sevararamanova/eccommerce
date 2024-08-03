const express = require("express");
const User = require("../models/User");
const Sales = require("../models/Sales");
const Product = require("../models/Product");
const Loan = require("../models/Loan");
const timeformatter = require("../helpers/timeformatter");

const loans = express.Router();

loans.post("/create", async (req, res) => {
    const { user_id, ids, counts, tillDate } = req.body;

    const user = await User.findById(user_id);

    let sales = []

    try {
        for(let i = 0; i < ids.length; i++){
            const count = counts[i];
            const product = await Product.findByIdAndUpdate({ _id: ids[i]}, {
                $inc: {
                    number_in_stock: -count
                },
                
            },  { new: true });

            let sale;
            
            const everSold = await Sales.findOne({product: product._id, date: timeformatter(new Date())})

            if(everSold){
              sale =  await Sales.findByIdAndUpdate({ _id: everSold._id}, {
                $inc: {
                    quantity: count
                },
                $set: {
                    total: count > 0 ? everSold.total + product.sale_price * count : everSold.total + product.sale_price * +count,
                    profit: count > 0 ? 
                        everSold.profit + product.sale_price * count - product.original_price * count 
                        : 
                        everSold.profit + product.sale_price * +count - product.original_price * +count
                }
              },  { new: true }).populate("product");
              
            }
            else{
              sale = await Sales.create({
                    product: product,
                    quantity: count,
                    date: timeformatter(new Date()),
                    total: product.sale_price * count,
                    profit: product.sale_price * count - product.original_price * count
                })
            }
            sales.push(sale);
        }
    }catch(err) {
        console.log(err.message);
    }

    const loan = await Loan.create({
        user: user_id,
        products: sales,
        amount: sales.map(product => product.total).reduce((a, b) => a + b, 0),
        givenDate: timeformatter(new Date()),
        tillDate: timeformatter(new Date())
    })

    res.status(200).json({
        payload: loan,
        message: "Success"
    })
})

loans.get("/all", async (req, res) => {
    const loans = await Loan.find({}).populate("user").populate("products")
    res.status(200).json({
        payload: loans,
        total: loans.length
    })
})

loans.get("/notpaid", async (req, res) => {
    const loans = await Loan.find({status: "not paid"}).populate("user").populate("products")
    res.status(200).json({
        payload: loans
    })
})
loans.get("/paid", async (req, res) => {
    const loans = await Loan.find({status: "paid"}).populate("user").populate("products")
    res.status(200).json({
        payload: loans
    })
})

module.exports = loans