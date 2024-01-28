const Item = require("../models/itemModel");
const mongoose = require("mongoose");

const getAllItems = async (req, res) => {
    try {
        let items = await Item.find();
        if (items.length === 0) {
            return res.status(400).json({ message: 'The list of items is empty' });
        }
        res.status(200).json({ items: items });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getItem = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No such item" });
        }
        const item = await Item.findById(id);
        if (!item) {
            res.status(404).json({ error: "No such item" });
        } else {
            res.status(200).json(item);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function isImage(url) {
    try {
        const response = await axios.head(url);
        const contentType = response.headers['content-type'];
        return contentType.startsWith('image/');
    } catch (error) {
        return false;
    }
};

const addItem = async (req, res) => {
    const { name, category, photo, price, description, quantity, shipping1, shipping2 } = req.body;
    try {
        if (!name || !category || !photo || !price || !description || !quantity) {
            return res.status(400).json({ message: 'Not enough information given' });
        }

        if (name.trim() === '' || category.trim() === '' || photo.trim() === '' || description.trim() === '') {
            return res.status(400).json({ message: 'Not enough information given' });
        }

        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!urlRegex.test(photo) || await isImage(photo)) {
            return res.status(400).json({ message: 'Given URL is not a photo URL' });
        }

        if (!shipping1 && !shipping2) {
            return res.status(400).json({ message: 'No shipping option' });
        }

        if (!shipping2) {
            return res.status(400).json({ message: 'Always must be true' });
        }

        if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
            return res.status(400).json({ message: 'Quantity and/or price must be positive numbers' });
        }

        const newItem = new Item({ name, category, photo, price, description, quantity, shipping1, shipping2 });
        await newItem.save();
        res.status(200).json({ message: "Saved successfully", item: newItem });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const editItem = async (req, res) => {
    const id = req.params.id;
    const { name, category, photo, price, description, quantity, shipping1, shipping2 } = req.body;
    try {
        if (!id) {
            return res.status(404).json({ message: 'No ID given' });
        }

        const existingItem = await Item.findById(id);
        if (!existingItem) {
            return res.status(404).json({ message: 'No item with the given ID' });
        }

        if (!name || !category || !photo || !price || !description || !quantity) {
            return res.status(400).json({ message: 'Not enough information given' });
        }

        if (name.trim() === '' || category.trim() === '' || photo.trim() === '' || description.trim() === '') {
            return res.status(400).json({ message: 'Not enough information given' });
        }

        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!urlRegex.test(photo) || await isImage(photo)) {
            return res.status(400).json({ message: 'Given URL is not a photo URL' });
        }

        if (!shipping1 && !shipping2) {
            return res.status(400).json({ message: 'No shipping option' });
        }

        if (!shipping2) {
            return res.status(400).json({ message: 'Always must be true' });
        }

        if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
            return res.status(400).json({ message: 'Quantity and/or price must be positive numbers' });
        }

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { name, category, photo, price, description, quantity, shipping1, shipping2 },
            { new: true }
        );

        res.status(200).json({ item: updatedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const deleteItem = async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such item" });
    }

    const item = await Item.findOneAndDelete({ _id: id });

    if (!item) {
        return res.status(400).json({ error: "No such item" });
    }

    res.status(200).json(item);
};

module.exports = { getAllItems, getItem, addItem, deleteItem, editItem };
