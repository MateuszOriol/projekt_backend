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

const averageRating = async (req, res) => {
  const { itemId } = req.query;

  try {
    if (!itemId) {
      return res.status(400).json({ message: 'No ID given' });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Faulty ID given' });
    }

    const averageRating = await Opinion.aggregate([
      { $match: { itemID: new mongoose.Types.ObjectId(itemId) } },
      { $group: { _id: null, average: { $avg: '$ratingValue' } } },
    ]);

    if (averageRating.length === 0) {
      return res.status(404).json({ error: 'No opinions found for the given itemId' });
    }

    res.status(200).json({ average: averageRating[0].average });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOpinionsByItemId = async (req, res) => {
  try {
    const itemId = req.params.id;
    const opinions = await Opinion.find({ itemID: itemId });
    
    if (!opinions || opinions.length === 0) {
      return res.status(404).json({ message: "No opinions found for this item." });
    }

    const averageRatingResult = await Opinion.aggregate([
      { $match: { itemID: new mongoose.Types.ObjectId(itemId) } },
      { $group: { _id: null, average: { $avg: '$ratingValue' } } },
    ]);

    const averageRating = averageRatingResult.length > 0 ? averageRatingResult[0].average : 0;

    res.json({ opinions, averageRating });
  } catch (error) {
    console.error("Error fetching opinions:", error);
    res.status(500).json({ message: "Error fetching opinions." });
  }
};

const createOpinion = async (req, res) => {
  const { itemID, authorName, authorSurname, opinionText, ratingValue } = req.body;

  if (!itemID || !authorName || !authorSurname || !opinionText) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (authorName.trim() === '' || authorSurname.trim() === '' || opinionText.trim() === '') {
    return res.status(400).json({ error: "Fields cannot be empty" });
  }

  if (typeof ratingValue !== "number" || !Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ error: "Rating value must be an integer between 1 and 5" });
  }

  try {
    const item = await Item.findById(itemID);
    if (!item) {
      return res.status(404).json({ error: `Item not found` });
    }

    const opinion = await Opinion.create({ itemID, authorName, authorSurname, opinionText, ratingValue });
    res.status(201).json(opinion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  

  const deleteOpinion = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid opinion ID" });
    }
  
    try {
      const opinion = await Opinion.findByIdAndDelete(id);
      if (!opinion) {
        return res.status(404).json({ error: "Opinion not found" });
      }
      res.status(200).json({ message: "Opinion deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = {
  getOpinions,
  getOpinionsByItemId,
  createOpinion,
  deleteOpinion,
};