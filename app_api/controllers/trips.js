const mongoose = require("mongoose");
const Trip = mongoose.model("Trip");

const sendJSONResponse = (res, status, content) => {
  res.status(status).json(content);
};

const CACHE_TTL_MS = 5 * 60 * 1000;

class TripCache {
  constructor(ttlMs = CACHE_TTL_MS) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  set(key, value) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs
    });

    return value;
  }

  get(key) {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  clear() {
    this.store.clear();
  }
}

const tripCache = new TripCache();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const binarySearchByCode = (trips, targetCode) => {
  let low = 0;
  let high = trips.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const currentCode = String(trips[mid].code || "").toUpperCase();

    if (currentCode === targetCode) {
      return trips[mid];
    }

    if (currentCode < targetCode) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return null;
};

// GET /api/trips
const tripsList = async (req, res) => {
  try {
    const cacheKey = "trips:list";
    const cachedTrips = tripCache.get(cacheKey);

    if (cachedTrips) {
      return sendJSONResponse(res, 200, cachedTrips);
    }

    const trips = await Trip.find().sort({ start: 1, code: 1 }).exec();
    tripCache.set(cacheKey, trips);
    return sendJSONResponse(res, 200, trips);
  } catch (err) {
    return sendJSONResponse(res, 500, { message: "Error retrieving trips", error: err.message });
  }
};

// GET /api/trips/code/:code
const getTripByCode = async (req, res) => {
  const code = String(req.params.code || "").trim().toUpperCase();

  if (!code) {
    return sendJSONResponse(res, 400, { message: "Trip code is required" });
  }

  try {
    const trips = await Trip.find().sort({ code: 1 }).exec();
    const trip = binarySearchByCode(trips, code);

    if (!trip) {
      return sendJSONResponse(res, 404, { message: "Trip not found" });
    }

    return sendJSONResponse(res, 200, trip);
  } catch (err) {
    return sendJSONResponse(res, 500, { message: "Error retrieving trip by code", error: err.message });
  }
};

// GET /api/trips/filter/search
const filterTrips = async (req, res) => {
  try {
    const query = {};
    const minPrice = parseNumber(req.query.minPrice);
    const maxPrice = parseNumber(req.query.maxPrice);
    const startAfter = parseDate(req.query.startAfter);
    const startBefore = parseDate(req.query.startBefore);
    const resort = String(req.query.resort || "").trim();

    if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
      return sendJSONResponse(res, 400, { message: "Price filters must be valid numbers" });
    }

    if (minPrice !== null || maxPrice !== null) {
      query.perPerson = {};

      if (minPrice !== null) {
        query.perPerson.$gte = minPrice;
      }

      if (maxPrice !== null) {
        query.perPerson.$lte = maxPrice;
      }

      if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
        return sendJSONResponse(res, 400, { message: "minPrice must be less than or equal to maxPrice" });
      }
    }

    if (startAfter === null && req.query.startAfter) {
      return sendJSONResponse(res, 400, { message: "startAfter must be a valid date" });
    }

    if (startBefore === null && req.query.startBefore) {
      return sendJSONResponse(res, 400, { message: "startBefore must be a valid date" });
    }

    if (startAfter || startBefore) {
      query.start = {};

      if (startAfter) {
        query.start.$gte = startAfter;
      }

      if (startBefore) {
        query.start.$lte = startBefore;
      }

      if (startAfter && startBefore && startAfter > startBefore) {
        return sendJSONResponse(res, 400, { message: "startAfter must be earlier than or equal to startBefore" });
      }
    }

    if (resort) {
      query.resort = { $regex: escapeRegExp(resort), $options: "i" };
    }

    const trips = await Trip.find(query).sort({ start: 1, code: 1 }).exec();
    return sendJSONResponse(res, 200, trips);
  } catch (err) {
    return sendJSONResponse(res, 500, { message: "Error filtering trips", error: err.message });
  }
};

// GET /api/trips/group/resorts
const groupByResort = async (req, res) => {
  try {
    const grouped = await Trip.aggregate([
      {
        $group: {
          _id: "$resort",
          count: { $sum: 1 },
          avgPrice: { $avg: "$perPerson" },
          minPrice: { $min: "$perPerson" },
          maxPrice: { $max: "$perPerson" },
          trips: {
            $push: {
              name: "$name",
              code: "$code",
              start: "$start"
            }
          }
        }
      },
      {
        $sort: { count: -1, _id: 1 }
      }
    ]).exec();

    const results = grouped.map((entry) => ({
      resort: entry._id,
      count: entry.count,
      avgPrice: entry.avgPrice,
      minPrice: entry.minPrice,
      maxPrice: entry.maxPrice,
      trips: entry.trips
    }));

    return sendJSONResponse(res, 200, results);
  } catch (err) {
    return sendJSONResponse(res, 500, { message: "Error grouping trips by resort", error: err.message });
  }
};

// GET /api/trips/range/dates
const getTripsByDateRange = async (req, res) => {
  const startDate = parseDate(req.query.start);
  const endDate = parseDate(req.query.end);

  if (!req.query.start || !req.query.end) {
    return sendJSONResponse(res, 400, { message: "Both start and end dates are required" });
  }

  if (!startDate || !endDate) {
    return sendJSONResponse(res, 400, { message: "Start and end must be valid dates" });
  }

  if (startDate > endDate) {
    return sendJSONResponse(res, 400, { message: "Start date must be earlier than or equal to end date" });
  }

  try {
    const trips = await Trip.find({
      start: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .sort({ start: 1, code: 1 })
      .exec();

    return sendJSONResponse(res, 200, {
      range: {
        start: startDate,
        end: endDate
      },
      count: trips.length,
      trips
    });
  } catch (err) {
    return sendJSONResponse(res, 500, { message: "Error retrieving trips by date range", error: err.message });
  }
};

// GET /api/trips/:tripId
const tripsFindById = async (req, res) => {
  const { tripId } = req.params;

  if (!mongoose.isValidObjectId(tripId)) {
    return sendJSONResponse(res, 400, { message: "Invalid tripId format" });
  }

  try {
    const trip = await Trip.findById(tripId).exec();

    if (!trip) {
      return sendJSONResponse(res, 404, { message: "Trip not found" });
    }

    return sendJSONResponse(res, 200, trip);
  } catch (err) {
    return sendJSONResponse(res, 500, { message: "Error retrieving trip", error: err.message });
  }
};

// POST /api/trips
const tripsAddTrip = async (req, res) => {
  try {
    const requiredFields = ["name", "code", "length", "start", "resort", "perPerson", "image", "description"];
    const missing = requiredFields.filter((f) => !req.body[f]);

    if (missing.length) {
      return sendJSONResponse(res, 400, { message: "Missing required fields", missing });
    }

    const newTrip = await Trip.create({
      name: req.body.name,
      code: req.body.code,
      length: req.body.length,
      start: req.body.start,
      resort: req.body.resort,
      perPerson: req.body.perPerson,
      image: req.body.image,
      description: req.body.description
    });

    tripCache.clear();

    return sendJSONResponse(res, 201, newTrip);
  } catch (err) {
    return sendJSONResponse(res, 500, { message: "Error creating trip", error: err.message });
  }
};

// PUT /api/trips/:tripId
const tripsUpdateTrip = async (req, res) => {
  const { tripId } = req.params;

  if (!mongoose.isValidObjectId(tripId)) {
    return sendJSONResponse(res, 400, { message: "Invalid tripId format" });
  }

  try {
    const trip = await Trip.findById(tripId).exec();

    if (!trip) {
      return sendJSONResponse(res, 404, { message: "Trip not found" });
    }

    const fields = ["name", "code", "length", "start", "resort", "perPerson", "image", "description"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) trip[f] = req.body[f];
    });

    const updated = await trip.save();
    tripCache.clear();
    return sendJSONResponse(res, 200, updated);
  } catch (err) {
    return sendJSONResponse(res, 500, { message: "Error updating trip", error: err.message });
  }
};

// DELETE /api/trips/:tripId
const tripsDeleteTrip = async (req, res) => {
  const { tripId } = req.params;

  if (!mongoose.isValidObjectId(tripId)) {
    return sendJSONResponse(res, 400, { message: "Invalid tripId format" });
  }

  try {
    const deleted = await Trip.findByIdAndDelete(tripId).exec();

    if (!deleted) {
      return sendJSONResponse(res, 404, { message: "Trip not found" });
    }

    tripCache.clear();

    return sendJSONResponse(res, 200, { message: "Trip deleted" });
  } catch (err) {
    return sendJSONResponse(res, 500, { message: "Error deleting trip", error: err.message });
  }
};

// DELETE /api/trips/cache/clear
const clearCache = async (req, res) => {
  tripCache.clear();
  return sendJSONResponse(res, 200, { message: "Trip cache cleared" });
};

module.exports = {
  tripsList,
  getTripByCode,
  filterTrips,
  groupByResort,
  getTripsByDateRange,
  tripsFindById,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsDeleteTrip,
  clearCache
};