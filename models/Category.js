const mongoose = require("mongoose");
const CategorySchema = new mongoose.Schema({
    category_name: { type: String, required: true },
})

const CategoryModel = mongoose.model("Categories", CategorySchema);

module.exports = CategoryModel