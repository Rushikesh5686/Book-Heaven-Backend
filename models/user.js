const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
    },
    role: {
        type: String,
        default: 'User',
        enum: ["User", "Admin"],
    },
    favourites: [{
        type: mongoose.Types.ObjectId,
        ref: "books",
    }],
    cart: [{
        type: mongoose.Types.ObjectId,
        ref: "books",
    }],
    orders: [{
        type: mongoose.Types.ObjectId,
        ref: "order",
    }],
}, { timestamps: true });

// Hash the password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
