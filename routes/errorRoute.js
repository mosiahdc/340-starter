// Needed Resources
const express = require('express')
const router = new express.Router()
const utilities = require('../utilities/')
const errorController = require('../controllers/errorController')

// Route to build Login View
router.get('/error', utilities.handleErrors(errorController.triggerError))

module.exports = router