const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
const validatorFor = require('../utils/validatorFor.js');
const id=nextId();

function validateBodyExists(req, res, next) {
    if (req.body.data) {
      next();
    } else {
      next({
        message: 'request.body must include data',
        status: 400
      })
    }
  }

function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    const newOrder = {
      id,
      deliverTo,
      mobileNumber,
      dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  }
  
  function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    if (index > -1) {
      orders.splice(index, 1);
    }
    res.sendStatus(204);
  }
  
  function list(req, res) {
    res.json({ data: orders });
  }
  
  function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      return next();
    }
    next({
      status: 404,
      message: `Order id not found: ${req.params.orderId}`,
    });
  }
  
  function read(req, res) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => (order.id = orderId));
    res.json({ data: foundOrder });
  }
  
  function update(req, res) {
    const orderId = req.params.dishId;
    const foundOrder = orders.find((order) => order.id === orderId);
  
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
    foundOrder.deliverTo = deliverTo;
    foundOrder.mobileNumber = mobileNumber;
    foundOrder.status = status;
    foundOrder.dishes = dishes;
  
    res.json({ data: foundOrder });
  }

  function dishValidator(req, res, next){
    const {data: {dishes} }= req.body;
    if(dishes && dishes.length>0){
        next();
    }else{
        next({
            message: 'Order must include at least one dish',
            status: 400
        })
    }
  }

  function quantityValidator(req, res, next){
    const {data:{dishes}}= req.body;
    const badQuantity = dishes.find((dish)=>typeof(dish.quantity)!=='number' || dish.quantity<=0);
    if(badQuantity){
        const index = dishes.findIndex((dish) => dish.id === badQuantity.id);
        next({message:`Dish ${index} must have a quantity that is an integer greater than 0`,
    status: 400})
    }
    next();
  }
  
  module.exports = {
    list,
    create: [
      validateBodyExists,
      validatorFor('deliverTo'),
      validatorFor('mobileNumber'),
      validatorFor('dishes'),
      dishValidator,
      quantityValidator,
      create
    ],
    read: [orderExists, read],
    update: [
      orderExists,
      validateBodyExists,
      validatorFor('deliverTo'),
      validatorFor('mobileNumber'),
      validatorFor('status'),
      validatorFor('dishes'),
      dishValidator,
      quantityValidator,
      update
    ],
    delete: [orderExists, destroy]
  }
