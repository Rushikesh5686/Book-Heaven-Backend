const express = require("express");
const router = express.Router();
const Book = require("../models/book");         // Import Book model
const User = require("../models/user");         // Import User model
const { authenticateToken } = require("./userAuth"); // Import token checker middleware

// ✅ Route: Add a book (Admin only)
router.post("/add-book", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "Admin") {
      return res.status(403).json({ message: "You are not allowed to perform this action" });
    }

    const { url, title, author, price, desc, language } = req.body;

    // Basic validation
    if (!url || !title || !author || !price || !desc || !language) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const book = new Book({
      url,
      title,
      author,
      price,
      desc,
      language,
    });

    await book.save();
    res.status(200).json({ message: "Book added successfully" });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});




// DELETE book by ID – Admin only
router.delete("/delete-book", async (req, res) => {
    try {
      const { bookid } = req.headers; // your user _id from header
     
  
    
  
      const deletedBook = await Book.findByIdAndDelete(bookid);
  
      if (!deletedBook) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      res.status(200).json({ message: "Book deleted successfully", deletedBook });
    } catch (err) {
        console.log(err)
      res.status(500).json({ message: "Internal server error" });
    }
  });


// UPDATE book by ID – Admin only
router.put("/update-book/:bookId", async (req, res) => {
    try {
      const { id } = req.headers;
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.role !== "Admin") {
        return res.status(403).json({ message: "You are not allowed to update books" });
      }
  
      const updatedBook = await Book.findByIdAndUpdate(
        req.params.bookId,
        {
          url: req.body.url,
          title: req.body.title,
          author: req.body.author,
          price: req.body.price,
          desc: req.body.desc
        },
        { new: true } // return updated document
      );
  
      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      res.status(200).json({ message: "Book updated successfully", updatedBook });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET all books – Admin or User
router.get("/get-all-books", async (req, res) => {
  try {
    const books = (await Book.find().sort({createdAt:-1})); // Fetch all books from the database

    if (books.length === 0) {
      return res.status(404).json({ message: "No books found" });
    }

    res.status(200).json({ books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/get-book-by-id/:id",async (req,res)=>{
  try{
    const { id } =req.params;
    const book=await Book.findById(id)
    return res.json({
      status:"Succes",
      data: book,
    })
  }
  catch (error){
    console.log(error)
    res.status(500).json({ message: "Internal server error" });
  }
 
})

router.get("/get-recent-books", async (req, res) => {
    try {
      const books = (await Book.find().sort({createdAt:-1}).limit(4)); // Fetch all books from the database
  
      if (books.length === 0) {
        return res.status(404).json({ message: "No books found" });
      }
  
      res.status(200).json({ books });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
 

  

module.exports = router;
