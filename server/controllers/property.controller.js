const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs');
const Grid  = require('gridfs-stream');
const helpers = require('../providers/helper');
const propertyType = require('../models/propertyTypes');
const Property = require('../models/property');

// const gfs;
// const conn = mongoose.connection;
// conn.on('connected', () => { 
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection('imageMeta');
// });

const propertyTypeList = async (req, res) => {
    try {
        const result = await propertyType.find({ is_active: true });
        res.status(200).json(result);
    } catch (err) {
        res.status(400).send(err);
    }
}
const addPropertyType = (req, res) => {
    var proptyp = new propertyType();

    proptyp.title = req.body.title;
    proptyp.type = req.body.type;
    proptyp.createdOn = Date.now();

    proptyp.save((err, result) => {
        if (err)
            res.status(400).send(err);
        else
            res.status(200).json({ message: 'Property type added successfully', id: result._id });
    });
}
const addNewProperty = async (req, res) => {
    let imgs = [];      
    try{
        if(req.files && req.files.length)
            req.files.forEach(ele => imgs.push(ele.originalname || `image-${Date.now()}`) )
        //Creating slug for the listing 
        var slug  = await helpers.slugGenerator(req.body.title, 'title', 'property');
        req.body.slug = slug;
        req.body.type = req.body.Proptype;
        req.body.cornrPlot = req.body.cornrPlot ? true : false;
        req.body.images = imgs;      
        req.body.imgPath = 'properties';
        req.body.userId = req.user._id;
        if(!req.body.isSociety){
            req.body.flatNo = '';
            req.body.societyName = '';
        }            
        const prop = new Property(req.body);
        const result = await prop.save();

        if(result && result._id && result.slug)
            res.status(200).json({result, message: "Your property has been successfully posted"});                
        else throw new Error('Something Went Wrong');
    }
    catch(err){
        console.log({err});
        res.status(400).json({message: err.message});
    }
}
const getUserList = async (req, res) => {
    try {
        const result = await Property.find({ isActive: true, userId: req.params.userId })
            .populate('city', 'name')
            .populate('state', 'name')
            .populate('type', 'title');

        res.status(200).json(result);
    } catch (err) {
        res.status(400).send(err);
    }
}
const getSingleProperty = async (req, res) => {
    try{
        const gfs = req.gfs;
        var result  = await Property.findOne({ slug: req.params.propertySlug })
            .populate('city', 'name')
            .populate('state', 'name')
            .populate('type', 'title');
            
        var files = [];
        if(gfs && result && result.images.length){
            files = await gfs.files.find({ filename: { $in : result.images } }).toArray();
        }
        if(result) res.status(200).json({result, files});
        else throw new Error('Something Went Wrong');
    }
    catch(err){
        res.status(400).json({message: err.message});
    }
    
}
const getFullList = async (req, res) => {
    try {
        const result = await Property.find({ isActive: true })
            .populate('city', 'name')
            .populate('state', 'name')
            .populate('type', 'title')
            .populate('userId', 'name');

        res.status(200).json(result);
    } catch (err) {
        res.status(400).send(err);
    }
}

const markAsSold = async (req, res) => {
    try{
        const nextStatus = req.body.status || 'sold';
        if (!['available', 'sold', 'rented', 'expired'].includes(nextStatus)) {
            throw new Error('Invalid status value');
        }

        const query = { slug: req.params.propertySlug };
        if (!req.user.isAdmin) {
            query.userId = req.user._id;
        }

        const result = await Property.updateOne(query, { status: nextStatus });
        console.log({result});
        if(result && result.modifiedCount === 1) res.status(200).json({ result, message: "Property has been updated Successfully" });
        else throw new Error('Error in updating property');
    }
    catch(err){
        res.status(400).json({message: err.message});
    }
}
const filterProperties = async (req, res) => {
    var query = {};

    if (req.query.propertyFor)
        query['propertyFor'] = { $in: req.query.propertyFor.split(",") }
    if (req.query.type)
        query['type'] = { $in: req.query.type.split(",") }
    if (req.query.city)
        query['city'] = { $in: req.query.city.split(",") }
    if (req.query.userId)
        query['userId'] = req.query.userId
    if (req.query.notUserId)
        query['userId'] = { $ne: req.query.notUserId }
    if (req.query.status)
        query['status'] = { $in: req.query.status.split(",") }
    console.log({ query });
    try {
        const result = await Property.find(query)
            .populate('city', 'name')
            .populate('state', 'name')
            .populate('type', 'title')
            .populate('userId', 'name');

        res.status(200).json(result);
    } catch (err) {
        res.status(400).send(err);
    }
}

const testController = async (req, res) => {
    const testData = await Property.find({ updatedOn: { $gte : '2019-04-01' } })
    console.log({ testData });
    return res.send(testData);
}
const showGFSImage = (req, res) => {
    const gfs = req.gfs;
    if (!gfs) {
        return res.status(503).json({ err: 'File storage is not ready' });
    }

    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
        return res.status(404).json({
        err: 'No file exists'
        });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    } else {
        res.status(404).json({
        err: 'Not an image'
        });
    }
    }) 
}

module.exports = {
    propertyTypeList,
    addPropertyType,
    addNewProperty,
    getUserList,
    getSingleProperty,
    getFullList,
    markAsSold,
    filterProperties,
    testController,
    showGFSImage
}