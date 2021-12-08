import { useState } from 'react';
//import jwt from 'jwt-decode';
import "bootstrap/dist/css/bootstrap.min.css"
import axios from 'axios';
import * as CONSTANTS from '../containers/Constants';
import jwtDecode from "jwt-decode";

export default function useToken() {
  const getToken = () => {
    const tokenString = localStorage.getItem('token');
    const userToken = JSON.parse(tokenString);
    return userToken
  };

  const getUser = () => {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    return user;
  };

  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  const saveToken = async userToken => {
    localStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken.token);
    try {
      const user = await jwtDecode(userToken).username;
      console.log(user)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user);
    } catch (err) {

    }
  };

  const deleteToken = () => {
    localStorage.removeItem('token')
  }

  // const verifyToken = (token) => {
  //   console.log("token", token )
  //   if (!token) {
  //     return false;
  //   }
  //   try {
  //     let decodedToken = jwt(token);
  //     let dateNow = new Date();
  //     console.log("decoded", decodedToken)

  //     if (decodedToken.exp < new Date() / 1000) {
  //       return false;
  //     }
  //     return true;
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  const tokenExists = (token) => {
    axios.get(CONSTANTS.HOST + "/user", {
      headers: {
        "Authorization": "Bearer " + token.token
      }
    }).then(response => {
      console.log(response)
      return true;
    }).catch(error => {
      console.log(error)
      return false;
    })
  }

  return {
    token,
    user,
    setToken: saveToken,
    //checkVerifiedToken: verifyToken,
    tokenExists,
    removeToken: deleteToken
  }
}