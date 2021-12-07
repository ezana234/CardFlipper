const { check, body } = require('express-validator');
const shortid = require("shortid");

const validateUsername = [
    check('username')
        .exists()
        .withMessage("'username' must be sent")
        .isString()
        .withMessage("'username' must be a string")
        .isLength({ min: 8 })
        .withMessage('Username Must Be at Least 8 Characters')
        .trim().escape()
]

const validateRoom = [
    check('roomID')
        .exists()
        .withMessage("'roomID' must be sent")
        .isLength({ min: 8 })
        .withMessage('roomID Must Be at Least 8 Characters')
        .isLength({ max: 14 })
        .withMessage('roomID Must Be at Most 14 Characters')
        .custom(value => {
            if (!shortid.isValid(value)) {
                throw new Error("Not a Valid Room ID")
            } else {
                return true;
            }
        })
        .withMessage("'roomID' isn't valid")
        .escape()
]

const validateMessage = [
    check('roomID')
        .exists()
        .withMessage("'roomID' must be sent")
        .isLength({ min: 8 })
        .withMessage('roomID Must Be at Least 8 Characters')
        .isLength({ max: 14 })
        .withMessage('roomID Must Be at Most 14 Characters')
        .custom(value => {
            if (!shortid.isValid(value)) {
                return false;
            } else {
                return true;
            }
        })
        .withMessage("'roomID' must be valid"),
    check('message')
        .exists()
        .withMessage("'message' must be sent")
]

const validatePoints = [
    check('points')
        .exists()
        .withMessage("'points' must be sent")
        .isArray()
        .withMessage("'points' must be an array")
        .custom(value => {
            if(value.length != 2) {
                return false;
            } else {
                return true;
            }
        })
        .withMessage("'points' length must be 2")
        .custom(value => {
            for(let i = 0; i < value.length; i++) {
                if(!Number.isInteger(value[i])) {
                    return false;
                }
            }
            return true;
        })
        .withMessage("'points' elements must be integers")
        .custom(value => {
            for(let i = 0; i < value.length; i++) {
                if(value[i] < 1 || value[i] > 52) {
                    return false;
                }
            }
            return true;
        })
        .withMessage("'points' elements must be greater than 0 and less than 53")
]

module.exports = {
    validateUsername,
    validateRoom,
    validateMessage,
    validatePoints
}