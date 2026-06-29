const Trip = require("../models/trips");

// Simple in-memory cache with TTL
class TripCache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  set(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  clear() {
    this.cache.clear();
  }
}

const tripCache = new TripCache();

// Retrieve all trips sorted by start date (cached)
const tripsList = async (req, res) => {
  try {
    const cacheKey = "all_trips";
    const cached = tripCache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const trips = await Trip.find({}).sort({ start: 1 }).lean();
    tripCache.set(cacheKey, trips);
    return res.status(200).json(trips);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving trips", error: err.message });
  }
};

// Binary search for trip by code (assumes sorted array by code)
const binarySearchByCode = (trips, code) => {
  let left = 0;
  let right = trips.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midCode = trips[mid].code.toUpperCase();
    const searchCode = code.toUpperCase();

    if (midCode === searchCode) {
      return trips[mid];
    } else if (midCode < searchCode) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return null;
};

// Get trip by code with binary search optimization
const getTripByCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: "Code parameter required" });
    }

    const trips = await Trip.find({}).sort({ code: 1 }).lean();
    const trip = binarySearchByCode(trips, code);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    return res.status(200).json(trip);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving trip", error: err.message });
  }
};

// Filter trips by multiple criteria using predicate functions
const filterTrips = async (req, res) => {
  try {
    const { minPrice, maxPrice, startAfter, startBefore, resort } = req.query;

    let query = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.perPerson = {};
      if (minPrice !== undefined) query.perPerson.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.perPerson.$lte = Number(maxPrice);
    }

    if (startAfter || startBefore) {
      query.start = {};
      if (startAfter) query.start.$gte = new Date(startAfter);
      if (startBefore) query.start.$lte = new Date(startBefore);
    }

    if (resort) {
      query.resort = { $regex: resort, $options: "i" };
    }

    const trips = await Trip.find(query).sort({ start: 1 }).lean();
    return res.status(200).json(trips);
  } catch (err) {
    return res.status(500).json({ message: "Error filtering trips", error: err.message });
  }
};

// Group trips by resort and aggregate statistics
const groupByResort = async (req, res) => {
  try {
    const resorts = await Trip.aggregate([
      {
        $group: {
          _id: "$resort",
          count: { $sum: 1 },
          avgPrice: { $avg: "$perPerson" },
          minPrice: { $min: "$perPerson" },
          maxPrice: { $max: "$perPerson" },
          trips: { $push: { name: "$name", code: "$code" } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json(resorts);
  } catch (err) {
    return res.status(500).json({ message: "Error grouping trips", error: err.message });
  }
};

// Find trips within a date range (interval search)
const getTripsByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: "Start and end date parameters required" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > endDate) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }

    const trips = await Trip.find({
      start: { $gte: startDate, $lte: endDate }
    }).sort({ start: 1 }).lean();

    return res.status(200).json({
      dateRange: { start, end },
      count: trips.length,
      trips
    });
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving trips by date range", error: err.message });
  }
};

// Clear cache (useful for testing and updates)
const clearCache = (req, res) => {
  tripCache.clear();
  return res.status(200).json({ message: "Cache cleared successfully" });
};

module.exports = {
  tripsList,
  getTripByCode,
  filterTrips,
  groupByResort,
  getTripsByDateRange,
  clearCache
};
