const express = require("express");
const router = express.Router();
const user = require("../models/user");
const { authenticateToken } = require("./userAuth");

// PUT: Add book to favourites
router.put("/add-book-to-favourite", authenticateToken, async (req, res) => {
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
    const isBookFavourite = userdata.favourites.some(
      (favId) => favId.toString() === bookid
    );

    if (isBookFavourite) {
      return res.status(200).json({ message: "Book is already in Favourite" });
    }

    // Add the book to the favourites array
    await user.findByIdAndUpdate(id, { $push: { favourites: bookid } });

    return res.status(200).json({ message: "Book is added to Favourite" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE: Remove book from favourites
router.put("/remove-book-from-favourite", authenticateToken, async (req, res) => {
  try {
    const { id, bookid } = req.headers;
    const userData = await user.findById(id);

    // Check if the book is in favourites before removing it
    const isBookFavourite = userData.favourites.includes(bookid);
    if (isBookFavourite) {
      await user.findByIdAndUpdate(id, { $pull: { favourites: bookid } });
    }

    return res.status(200).json({ message: "Book removed from Favourite" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET: Get all favourite books by user
router.get("/get-favourite-book-byuser", authenticateToken, async (req, res) => {
  try{
    const {id}=req.headers
    const userdata=await user.findById(id).populate("favourites")
    const favouritebooks=userdata.favourites
    return res.json({
      status: "Success",
      data: favouritebooks
    })

  }catch(error){
    console.log(error)
    return res.status(500).json({message:"An error Occured"})

  }
});


module.exports = router;
