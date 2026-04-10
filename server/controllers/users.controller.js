const mongoose = require('mongoose');
var users = require('../models/users');
var states = require('../models/state');

const getUserDetails = async (req, res) => {
    try {
        const result = await users.findOne({ _id: req.params.userId })
            .select('-password')
            .populate('city', 'name')
            .populate('state', 'name');

        res.status(200).send(result);
    } catch (err) {
        res.status(400).send(err);
    }
}

module.exports = { getUserDetails }