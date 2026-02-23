const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false, // Make email optional
            unique: true,
            sparse: true, // Allow multiple nulls/undefined for unique constraint
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true, // Make phone mandatory
            unique: true, // Make phone unique
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        role: {
            type: String,
            enum: ['admin', 'staff', 'user', 'stall_owner'],
            default: 'user',
        },
        stallId: {
            type: String, // Link to Stall.stallId
            required: false,
        },
        assignedStall: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stall',
            required: false,
        },
        status: {
            type: String,
            enum: ['active', 'disabled'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
