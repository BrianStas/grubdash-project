const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const validatorFor = require("../utils/validatorFor");
const id=nextId();

function list(req, res) {
    res.json({ data: dishes });
  }

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id,
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
    console.log("read's res locals looks like this:", res.locals.dish)
    res.json({ data: res.locals.dish });
  }

  function update(req, res) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
  
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    foundDish.name = name;
    foundDish.description = description;
    foundDish.price = price;
    foundDish.image_url = image_url;
  
    res.json({ data: foundDish });
  }

function validateBodyAndParamsIdMatch(req, res, next) {
  let {id}= req.body.data;
  if(id && id !== req.params.dishId){
    next({
        status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${req.params.dishId}`
    })}
    else{
        next();
    }
}

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${req.params.dishId}`,
  });
}

function validateBodyExists(req, res, next){
    if(req.body.data){
        next();
    } else{
        next({
            message: 'request.body must include data',
            status: 400
        })
    }
}

function priceValidator(req, res, next){
    const { data: {  price } = {} } = req.body;

    if( typeof(price)==='number' && price > 0){
        console.log("passed:", price)
        next();
    }else{
    console.log("failed:", price)
    next({
        message: 'Dish must have a price that is an integer greater than 0',
        status: 400
    })}
}

module.exports = {
  create: [
    validateBodyExists, 
    validatorFor('name'),
    validatorFor('description'),
    validatorFor('price'),
    validatorFor('image_url'),
    priceValidator,
    create],
  list,
  read: [dishExists, read],
  update: [  
    dishExists, 
    validateBodyExists,
    validateBodyAndParamsIdMatch, 
    validatorFor('name'),
    validatorFor('description'),
    validatorFor('price'),
    validatorFor('image_url'),
    priceValidator,
    update],
  dishExists,
};
