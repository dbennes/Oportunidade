const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../config/config');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const propertyController = require('../controllers/property.controller');

// Create storage engine
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxSize,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    return cb(null, true);
  },
});

// GridFsStorage setup
let gfs;

mongoose.connection.once('open', () => {
  gfs = new mongoose.mongo.GridFsStorage(mongoose.connection.db, {
    bucketName: 'imageMeta'
  });
});

router.use((req, res, next) => {
  req.gfs = gfs;
  next();
})

// Property type dropdown
router.get('/type', propertyController.propertyTypeList);
router.post('/type', requireAuth, requireAdmin, propertyController.addPropertyType);

//Property
router.post('/new', requireAuth, upload.array("propImages"), propertyController.addNewProperty);
router.get('/list/:userId', propertyController.getUserList);
router.get('/list/', propertyController.getFullList);
router.get('/single/:propertySlug', propertyController.getSingleProperty);
router.get('/showGFSImage/:filename', propertyController.showGFSImage); // To view image in front-end
router.post('/markAsSold/:propertySlug', requireAuth, propertyController.markAsSold);

//Properties filter
router.get('/filter', propertyController.filterProperties);

module.exports = router;