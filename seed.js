const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Connect to DB (uses your db.js connection module)
require("./app_server/models/db");

// Load Trip model
const Trip = require("./app_server/models/trips");

async function seedTrips() {
  try {
    const tripsPath = path.join(__dirname, "data", "trips.json");
    const json = fs.readFileSync(tripsPath, "utf-8");
    const trips = JSON.parse(json);

    // Convert start to a Date object (Mongo expects Date type)
    const normalized = trips.map((t) => ({
      ...t,
      start: new Date(t.start)
    }));

    // Clear old trips then insert new ones
    await Trip.deleteMany({});
    await Trip.insertMany(normalized);

    console.log(`Seed complete: inserted ${normalized.length} trips.`);
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("DB connection closed.");
  }
}

seedTrips();
