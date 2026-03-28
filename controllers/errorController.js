const errorController = {}

errorController.triggerError = async function (req, res, next) {
    throw new Error('This is a test error.')
    error.status = 500
    throw error
}

module.exports = errorController