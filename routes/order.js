const router = require("express").Router()
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
dotenv.config();
const UserModel = require("../models/User")


const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) {
                return res.status(403).json("Token is not Valid")
            }
            req.user = user;
            next();
        })
    }
    else {
        res.status(401).json("You are not authenticated")
    }
}

router.post('/place-order', verify, async (req, res) => {
    if (req.user.id === req.body.userId) {
        try {
            const { userId } = req.body;

            const user = await UserModel.findById(userId).populate('cart.product');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (user.cart.length === 0) {
                return res.status(400).json({ error: 'Cart is empty' });
            }

            const orderItems = user.cart.map(item => ({
                product: item.product,
                quantity: item.quantity
            }));

            const totalPrice = user.cart.reduce((total, item) => {
                const product = item.product;
                const productPrice = product.price || 0;
                return total + productPrice * item.quantity;
            }, 0);

            user.orders.push({ items: orderItems, totalPrice });
            user.cart = [];
            await user.save();

            res.status(201).json({ message: 'Order placed successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(403).json("Denied Access")
    }
});


router.get('/order-history', verify, async (req, res) => {
    if (req.user.id === req.body.userId) {
        try {
            const userId = req.body.userId;

            const user = await UserModel.findById(userId).populate('orders.items.product');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const orderHistory = user.orders;

            res.status(200).json({ orderHistory });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(403).json("Denied Access")
    }

});

router.get('/order-details', verify, async (req, res) => {
    if (req.user.id === req.body.userId) {
        try {
            const userId = req.body.userId;
            const orderId = req.body.orderId;

            const user = await UserModel.findById(userId).populate('orders.items.product');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const order = user.orders.find(order => order._id.toString() === orderId);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.status(200).json({ order });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(403).json("Denied Access")
    }
});

module.exports = router;