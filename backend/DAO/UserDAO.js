const mongoose = require('mongoose')
const userSchema = mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'User')


function InsertUser(username, token) {
    return new Promise((resolve, reject) => {
        User.create({usernname:username, token:token},function(err, result) {
            if (err) {
                return reject(err)
            } else {
                return resolve(result)
            }
        });
    });
}

function GetUserByToken(token){
    return new Promise((resolve, reject) => {
        User.findOne({token:token}, function(err, result) {
            if(err || !result) {
                return reject(err);
            } else {
                return resolve(result);
            }
        })
    })
}

module.exports = {
    InsertUser,
    GetUserByToken
}