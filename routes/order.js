const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Book = require("../models/book");
const user = require("../models/user");
const { authenticateToken } = require("./userAuth");
const Order=require("../models/order")
router.post("/place-order", authenticateToken, async (req, res) => {
  try {
    const userId = req.headers.id;
    const { bookIds } = req.body;

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ message: "No books provided" });
    }

    // 1. Create the order
    const newOrder = await Order.create({
      user: userId,
      books: bookIds,
    });

    // 2. Push order ID into user’s orders
    await user.findByIdAndUpdate(
      userId,
      { $push: { orders: newOrder._id } },
      { new: true }
    );

    // 3. ❗️Clear the user's cart (assuming you store cart in user model)
    await user.findByIdAndUpdate(
      userId,
      { $set: { cart: [] } } // this clears the user's cart
    );

    return res.status(201).json({
      status: "Success",
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Failed to place order" });
  }
});





router.get("/get-order-history", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;

    const userData = await user.findById(id).populate({
      path: "orders", // corrected: was "order"
      populate: { path: "books" },
    });

    const orderData = userData.orders.reverse(); // assuming `orders` is an array

    return res.json({
      status: "Success",
      data: orderData,
    });
  } catch (error) {
    return res.status(500).json({ message: "An error Occurred" }); // fixed
  }
});
router.get("/get-all-order-history", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        // 🛡️ Safe user lookup
        let user = null;
        if (order.user) {
          user = await User.findById(order.user).select("-password").lean();
        }

        // 🛡️ Safe books lookup
        const booksInfo = await Promise.all(
          (order.books || []).map(async (bookId) => {
            const book = await Book.findById(bookId).lean();
            return book;
          })
        );

        return {
          ...order,
          user: user || null,
          books: booksInfo,
        };
      })
    );

    return res.json({
      status: "Success",
      data: updatedOrders,
    });
  } catch (error) {
    console.error("Error in /get-all-order-history:", error.message);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.put("/update-status/:id",authenticateToken,async(req,res)=>{
    try{
     const {id}=req.params
     await Order.findByIdAndUpdate(id,{status:req.body.status})
     return res.json({
        status:"Success",
        message: "Status Updated successfully"
     })
    }catch{
        return res.status(500).json({message:"An error Occured"})

    }
})

module.exports=router