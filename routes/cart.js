const router = require("express").Router();
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
dotenv.config();
const UserModel = require("../models/User")
const ProductModel = require("../models/Product")


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


router.post('/add-to-cart', verify, async (req, res) => {
    if (req.user.id === req.body.userId) {
        try {
            const { userId, productId, quantity } = req.body;

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const product = await ProductModel.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            const cartItemIndex = user.cart.findIndex(item => item.product.equals(productId));

            if (cartItemIndex !== -1) {
                return res.status(201).json({ message: 'Product Already in Cart' })
            } else {
                user.cart.push({ product: productId, quantity });
            }

            await user.save();

            res.status(201).json({ message: 'Product added to cart' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(403).json("Denied Access")
    }

});

router.get('/view-cart/', verify, async (req, res) => {
    if (req.user.id === req.body.userId) {
        try {
            const userId = req.body.userId;

            const user = await UserModel.findById(userId).populate('cart.product');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ cart: user.cart });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    else {
        res.status(403).json("Denied Access")
    }


});

router.put('/update-quantity', verify, async (req, res) => {
    if (req.user.id === req.body.userId) {
        try {
            const { userId, productId, quantity } = req.body;

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const cartItem = user.cart.find(item => item.product.equals(productId));
            if (!cartItem) {
                return res.status(404).json({ error: 'Product not found in cart' });
            }

            cartItem.quantity = quantity;
            await user.save();

            res.status(200).json({ message: 'Cart item updated' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(403).json("Denied Access")
    }

});

router.delete('/remove-from-cart', verify, async (req, res) => {
    if (req.user.id === req.body.userId) {
        try {
            const { userId, productId } = req.body;

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const cartItemIndex = user.cart.findIndex(item => item.product.equals(productId));
            if (cartItemIndex === -1) {
                return res.status(404).json({ error: 'Product not found in cart' });
            }

            user.cart.splice(cartItemIndex, 1);
            await user.save();

            res.status(200).json("Product removed from cart");
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(403).json("Denied Access")
    }
});

module.exports = router;