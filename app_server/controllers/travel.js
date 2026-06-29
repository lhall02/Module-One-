const travel = async (req, res) => {
  try {
    const response = await fetch("http://localhost:3000/api/trips");
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

module.exports = { travel };
