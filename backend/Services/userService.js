const { GenerateJWT } = require("../Utils/Utils")
const {
    v4: uuidv4
} = require("uuid")
const userDAO = require("../DAO/UserDAO")

// The service to Login a user
function Login(username) {
    return new Promise(async (resolve, reject) => {
        strippedUsername = username.replace("#", "");
        newUsername = `${strippedUsername}#${uuidv4()}`;
        const token = GenerateJWT(newUsername);
        try {
            return resolve(await userDAO.InsertUser(newUsername, token));
        } catch(error) {
            return reject(error)
        }
    });
}

function getUserByToken(token) {
    return new Promise(async(resolve, reject) => {
        try {
            return resolve(await userDAO.GetUserByToken(token));
        } catch(error) {
            return reject(error);
        }
    })
}

module.exports = {
    Login,
    getUserByToken
}