const getApiBaseUrl = (req) => `${req.protocol}://${req.get("host")}/api/trips`;

const travel = async (req, res) => {
  try {
    const response = await fetch(getApiBaseUrl(req));
    if (!response.ok) {
      return res.render("travel", { title: "Travlr", trips: [] });
    }

    const trips = await response.json();
    return res.render("travel", { title: "Travlr", trips });
  } catch (err) {
    console.error(err);
    return res.render("travel", { title: "Travlr", trips: [] });
  }
};

const travelDetail = async (req, res) => {
  const code = String(req.params.code || "").trim().toUpperCase();

  if (!code) {
    return res.status(400).render("trip-detail", {
      title: "Trip Not Found - Travlr",
      trip: null,
      message: "A trip code is required."
    });
  }

  try {
    const response = await fetch(`${getApiBaseUrl(req)}/code/${encodeURIComponent(code)}`);

    if (response.status === 404) {
      return res.status(404).render("trip-detail", {
        title: "Trip Not Found - Travlr",
        trip: null,
        message: "We could not find a trip with that code."
      });
    }

    if (!response.ok) {
      return res.status(response.status).render("trip-detail", {
        title: "Trip Details - Travlr",
        trip: null,
        message: "Trip details are not available right now."
      });
    }

    const trip = await response.json();
    return res.render("trip-detail", { title: `${trip.name} - Travlr`, trip });
  } catch (err) {
    console.error(err);
    return res.status(500).render("trip-detail", {
      title: "Trip Details - Travlr",
      trip: null,
      message: "Trip details are not available right now."
    });
  }
};

module.exports = { travel, travelDetail };
