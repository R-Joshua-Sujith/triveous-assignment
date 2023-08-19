const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
});

const orderSchema = new mongoose.Schema({
    items: [orderItemSchema],
    totalPrice: Number,
    createdAt: { type: Date, default: Date.now }
});


const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                },
                quantity: Number
            }
        ],
        orders: [orderSchema]
    }
)

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;