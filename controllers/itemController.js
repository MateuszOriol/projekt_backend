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
        if (!name || !category || !photo || !price || !description || quantity == null || quantity === '' || shipping1 === undefined || !shipping2) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        if(!urlRegex.test(photo) || await isImage(photo)){
          return res.status(400).json({ message: 'Given url is not photo url' });
        }

        if (name.trim() === '' || category.trim() === '' || photo.trim() === '' || description.trim() === '') {
            return res.status(400).json({ message: 'Fields cannot be just spaces' });
        }

        if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity < 0 || !Number.isInteger(quantity)) {
            return res.status(400).json({ message: 'Invalid quantity or price' });
        }

        const newItem = new Item({ name, category, photo, price, description, quantity, shipping1, shipping2 });
        await newItem.save();
        res.status(201).json({ message: "Item added successfully", item: newItem });
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

        if (!name || !category || !photo || !price || !description || quantity == null || quantity === '' || shipping1 === undefined || !shipping2) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        if(!urlRegex.test(photo) || await isImage(photo)){
          return res.status(400).json({ message: 'Given url is not photo url' });
        }

        if (name.trim() === '' || category.trim() === '' || photo.trim() === '' || description.trim() === '') {
            return res.status(400).json({ message: 'Fields cannot be just spaces' });
        }

        if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity < 0 || !Number.isInteger(quantity)) {
            return res.status(400).json({ message: 'Invalid quantity or price' });
        }

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { name, category, photo, price, description, quantity, shipping1, shipping2 },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const deleteItem = (req, res) => {
    return new Promise((resolve, reject) => {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            reject("No such item");
        } else {
            Item.findOneAndDelete({ _id: id })
                .then(item => {
                    if (!item) {
                        reject("No such item");
                    } else {
                        resolve(item);
                    }
                })
                .catch(err => reject(err));
        }
    })
    .then(item => res.status(200).json(item))
    .catch(err => res.status(404).json({ error: err }));
};


const getAllItemsWithAverageRating = async (req, res) => {
    try {
        const itemsWithRatings = await Item.aggregate([
            {
                $lookup: {
                    from: "opinions",
                    localField: "_id",
                    foreignField: "itemID",
                    as: "ratings"
                }
            },
            {
                $addFields: {
                    averageRating: { $ifNull: [{ $avg: "$ratings.ratingValue" }, 0] }
                }
            },
            {
                $project: {
                    ratings: 0
                }
            }
        ]);

        res.status(200).json({ items: itemsWithRatings });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

  
  const getItemWithAverageRating = async (req, res) => {
    try {
      const itemId = req.params.id;
  
      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
      }
  
      const itemWithRating = await Item.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(itemId) }
        },
        {
          $lookup: {
            from: "opinions",
            localField: "_id",
            foreignField: "itemID",
            as: "opinions"
          }
        },
        {
          $addFields: {
            averageRating: {
              $ifNull: [{ $avg: "$opinions.ratingValue" }, 0]
            }
          }
        },
        {
          $project: {
            opinions: 0
          }
        }
      ]);
  
      if (itemWithRating.length === 0) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      res.status(200).json(itemWithRating[0]);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

module.exports = { getAllItems, getItem, addItem, deleteItem, editItem , getAllItemsWithAverageRating, getItemWithAverageRating};
