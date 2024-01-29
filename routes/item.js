const express = require("express");

const {
    getAllItems,
    getItem,
    addItem,
    deleteItem,
    editItem,
    getAllItemsWithAverageRating,
    getItemWithAverageRating
} = require("../controllers/itemController");

const router = express.Router();

router.get('/item/:id', getItemWithAverageRating);
router.get('/all-items', getAllItemsWithAverageRating);
router.get('/all', getAllItems);
router.get('/byId/:id', getItem);
router.post('/add', addItem);
router.delete('/delete/:id', deleteItem);
router.put('/edit/:id', editItem); 

module.exports = router;