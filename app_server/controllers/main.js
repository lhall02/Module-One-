const index = (req, res) => {
  res.render("index", { title: "Travlr" });
};

module.exports = { index };
