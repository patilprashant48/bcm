const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    user_type: {
        type: String,
        enum: ["ADMIN", "BUSINESS", "INVESTOR"],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
        default: "ACTIVE"
    },
    requires_password_update: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

/**
 * ✅ HARD LOCK – prevents overwrite in ALL cases
 */
const User =
    mongoose.models.User ||
    mongoose.model("User", UserSchema);

module.exports = User;
