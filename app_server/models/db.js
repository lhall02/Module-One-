require("dotenv").config();
const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("MONGODB_URI is missing. Add it to your .env file.");
  process.exit(1);
}

mongoose.connect(dbURI);

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to", dbURI);
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("Mongoose disconnected through app termination");
    process.exit(0);
  });
});
