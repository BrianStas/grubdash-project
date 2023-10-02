const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId,
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function destroy(req, res) {
  const { dishId } = req.params;
  const index = dishes.findIndex((dish) => dish.id === Number(dishId));
  if (index > -1) {
    dishes.splice(index, 1);
  }
  res.sendStatus(204);
}

function hasText(req, res, next) {
  const { data: { text } = {} } = req.body;

  if (text) {
    return next();
  }
  next({ status: 400, message: "A 'text' property is required." });
}

function list(req, res) {
  res.json({ data: dishes });
}

function dishExists(req, res, next) {
  const dishId = Number(req.params.dishId);
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${req.params.dishId}`,
  });
}

function read(req, res) {
  const dishId = Number(req.params.dishId);
  const foundDish = dishes.find((dish) => (dish.id = dishId));
  res.json({ data: foundDish });
}

function update(req, res) {
  const dishId = Number(req.params.dishId);
  const foundDish = dishes.find((dish) => dish.id === dishId);

  const { data: { name, description, price, image_url } = {} } = req.body;

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

module.exports = {
  create: [hasText, create],
  list,
  read: [dishExists, read],
  update: [dishExists, hasText, update],
  delete: destroy,
  dishExists,
};
