require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const itemRoutes = require("./routes/item");
const opinionRoutes = require("./routes/opinions");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/user", userRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/opinions", opinionRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        "Connected to database & listening on port:",
        process.env.PORT
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });
