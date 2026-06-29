const index = (req, res) => {
  res.render("index", { title: "Travlr" });
};

const news = (req, res) => {
  res.render("news", { title: "Travel News - Travlr" });
};

const rooms = (req, res) => {
  res.render("rooms", { title: "Rooms - Travlr" });
};

const dives = (req, res) => {
  res.render("dives", { title: "Dive Sites - Travlr" });
};

const foods = (req, res) => {
  res.render("foods", { title: "Dining - Travlr" });
};

const meals = (req, res) => {
  res.render("meals", { title: "Meals - Travlr" });
};

const about = (req, res) => {
  res.render("about", { title: "About - Travlr" });
};

const contact = (req, res) => {
  res.render("contact", { title: "Contact - Travlr" });
};

module.exports = { index, news, rooms, dives, foods, meals, about, contact };
