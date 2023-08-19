const router = require("express").Router()
const CategoryModel = require("../models/Category")
const ProductModel = require("../models/Product")


router.post("/createCategory", async (req, res) => {
    try {
        const { category_name } = req.body;

        // Check if the category already exists
        const existingCategory = await CategoryModel.findOne({ category_name });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const newCategory = new CategoryModel({ category_name });
        await newCategory.save();
        res.status(201).json({ message: 'Category created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})


router.get("/getCategories", async (req, res) => {
    try {
        const categories = await CategoryModel.find({}, 'category_name');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error Fetching Categories' });
    }
})


router.post("/createProduct", async (req, res) => {
    const newProduct = new ProductModel({
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        availability: req.body.availability,
        category_id: req.body.category_id
    })
    try {
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct)
    } catch (err) {
        res.status(500).json(err)
    }
})

router.put("/editProduct/:id", async (req, res) => {
    try {
        const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.delete("/deleteProduct/:id", async (req, res) => {
    try {
        await ProductModel.findByIdAndDelete(req.params.id);
        res.status(200).json("Product Deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});


router.get('/products/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const products = await ProductModel.find({ category_id: categoryId });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/product/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product Not found' })
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({ message: 'Error Fetching Product Details' })
    }
})

module.exports = router;