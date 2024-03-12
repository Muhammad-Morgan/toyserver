const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
img: String,
name: String,
price: Number,
category: String
})

const items = mongoose.model('item',itemSchema)

module.exports = items