const mongoose = require('mongoose');
var state_model = require('../models/state');
var city_model = require('../models/city');
var users = require('../models/users');

// STATES
const getStateList = async (req, res) => {
    try {
        const data = await state_model.find({ is_active: true });
        res.status(200).send(data);
    } catch (err) {
        res.status(400).send(err);
    }
}
const addState = (req, res) => {
    var state = new state_model();
    state.name = req.body.name;

    state.save((err) => {
        if(err)
            res.send(err);
        res.json({ message: 'State added successfully' });
    })
}

//CITIES
const getAllCities = async (req, res) => {
    try {
        const data = await city_model.find({ is_active: true }).populate('state_id', 'name');
        res.status(200).json(data);
    } catch (err) {
        res.status(400).send(err);
    }
}
const getCityList = async (req, res) => {
    try {
        const data = await city_model.find({ state_id: req.params.state_id, is_active: true }).populate('state_id', 'name');
        res.status(200).json(data);
    } catch (err) {
        res.status(400).send(err);
    }
}
const addCity = async (req, res) => {
    try{
        var city = new city_model(req.body);
        const result = await city.save();
        console.log({result});
        if(result) res.status(200).json({ message: 'City added successfully' });
        else throw new Error('Something Went Wrong');
    }
    catch(err){
        res.status(400).json({message: err.message});
    }
}
const removeCity = async (req, res) => {
    try {
        const result = await city_model.deleteOne({_id: req.params.cityId });
        res.status(200).json({ message: 'City removed successfully', data: result });
    } catch (err) {
        res.status(400).send(err);
    }
}
//checkemailAvailability
const checkemailAvailability = async (req, res) => {
    var email = req.params.email;

    try {
        const result = await users.find({email: email});
        res.status(200).json({  response: !!(result && result.length) });
    } catch (err) {
        res.status(400).send(err);
    }
}

module.exports = {
    getStateList,
    addState,
    getAllCities,
    getCityList,
    addCity,
    removeCity,
    checkemailAvailability,
}