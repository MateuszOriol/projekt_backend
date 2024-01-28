const Item = require("../models/itemModel");
const Opinion = require("../models/opinionModel");
const mongoose = require("mongoose");

const getOpinions = async (req, res) => {
    try {
        let opinions  = await Opinion.find({});
        if (opinions.length === 0) {
            return res.status(400).json({ message: 'The list of opinions is empty' });
        }
        res.status(200).json({ opinions: opinions });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getOpinionsByItemId = async (req, res) => {
    try {
      const opinions = await Opinion.find({ itemID: req.params.id });
      
      if (!opinions || opinions.length === 0) {
        return res.status(404).json({ message: "No opinions found for this item." });
      }
  
      res.json(opinions);
    } catch (error) {
      console.error("Error fetching opinions:", error);
      res.status(500).json({ message: "Error fetching opinions." });
    }
  };
  

const createOpinion = async (req, res) => {
  const { itemID, authorName, authorSurname, opinionText, ratingValue } =
    req.body;

  let emptyFields = [];

  if (!opinionText) {
    emptyFields.push("opinionText");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: `Opinion cannot be empty`, emptyFields });
  }

  if (typeof ratingValue !== "number" || ratingValue <= 0 || ratingValue > 5) {
    return res.status(400).json({ error: `Rating value is not valid` });
  }

  try {
    const opinion = await Opinion.create({
      itemID,
      authorName,
      authorSurname,
      opinionText,
      ratingValue,
    });

    const item = await Item.findById(itemID);
    if (!item) {
      return res.status(404).json({ error: `Item not found` });
    }
    item.ratingCount = item.ratingCount ? item.ratingCount + 1 : 1;
    item.ratingSum = item.ratingSum
      ? item.ratingSum + ratingValue
      : ratingValue;
    item.rating = item.ratingSum / item.ratingCount;
    await item.save();

    res.status(200).json(opinion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOpinion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such opinion" });
  }

  const opinion = await Opinion.findOneAndDelete({ _id: id });

  if (!opinion) {
    return res.status(400).json({ error: "No such opinion" });
  }

  res.status(200).json(opinion);
};

module.exports = {
  getOpinions,
  getOpinionsByItemId,
  createOpinion,
  deleteOpinion,
};