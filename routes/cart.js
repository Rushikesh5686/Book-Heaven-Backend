const express = require("express");
const router = express.Router();
const user = require("../models/user");
const { authenticateToken } = require("./userAuth");
router.put("/add-to-cart", authenticateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers;

    if (!id || !bookid) {
      return res.status(400).json({ message: "User ID and Book ID are required in headers" });
    }

    // Ensure that the user exists
    const userdata = await user.findById(id);
    if (!userdata) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the book is already in favourites
    const isBookincart = userdata.cart.includes(bookid)

    if (isBookincart) {
      return res.status(200).json({ message: "Book is already in Cart" });
    }

    // Add the book to the favourites array
    await user.findByIdAndUpdate(id, { $push: { cart: bookid } });

    return res.status(200).json({ message: "Book is added to Cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/remove-to-cart/:bookid", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { bookid } = req.params;

    const userData = await user.findById(id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the book from the user's cart
    await user.findByIdAndUpdate(id, { $pull: { cart: bookid } });

    return res.status(200).json({ message: "Book removed from Cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/get-add-to-cartbyuser", authenticateToken, async (req, res) => {
  try {
           const { id } = req.headers;

        
        const userrawData = await user.findById(id).populate("cart");
        const userData=userrawData.toObject();
        if (!userData) {
          return res.status(404).json({ message: "User not found." });
        }
        //return res.status(200).json(userData.toObject().cart);
        return res.json({ status: "success", data: userData.cart});
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports=router