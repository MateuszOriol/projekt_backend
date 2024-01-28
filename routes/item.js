const express = require("express");

const {
    getAllItems,
    getItem,
    addItem,
    deleteItem,
    editItem
} = require("../controllers/itemController");

const router = express.Router();

router.get('/all', getAllItems);
router.get('/byId/:id', getItem);
router.post('/add', addItem);
router.delete('/delete/:id', deleteItem);
router.put('/edit/:id', editItem); 

module.exports = router;