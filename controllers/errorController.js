const utilities = require('../utilities/')

const errorController = {}

errorController.triggerError = async function (req, res, next) {
    throw new Error('This is a test error.')
}

module.exports = errorController