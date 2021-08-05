import React, { useReducer } from "react";
import AuthContext from "./authContext";
import authReducer from "./authReducer";
import setAuthToken from "../../utills/setAuthToken";
import axios from "axios";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
} from "../types";

const AuthState = (props) => {
  const initialState = {
    // token is from localStorage in browser
    token: localStorage.getItem("token"),
    isAuthenticated: null,
    user: null,
    loading: true,
    error: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  //Actions

  //Load User - Check which user logged in and get user data
  const loadUser = async () => {
    // @todo - load token into global headers
    // check if token has been stored in localStorage
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
    try {
      const res = await axios.get("/api/auth");
      // res will contain user data
      dispatch({ type: USER_LOADED, payload: res.data });
    } catch (err) {
      dispatch({ type: AUTH_ERROR });
    }
  };

  //Register User
  //Register a user
  const register = async (formData) => {
    //define config in the req
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      // use axios to do API post request
      const res = await axios.post("/api/users", formData, config);
      //after api request, dispatch the action to reducer with response data(which would be json web token)
      dispatch({ type: REGISTER_SUCCESS, payload: res.data });
      // after successfully register the user, load the user and put the token into header
      loadUser();
    } catch (err) {
      // if error, the back end will send error response json data
      dispatch({ type: REGISTER_FAIL, payload: err.response.data.msg });
    }
  };

  //Login User
  const login = async (formData) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      // will return token object with user id value
      const res = await axios.post("/api/auth", formData, config);

      dispatch({ type: LOGIN_SUCCESS, payload: res.data });
      loadUser();
    } catch (err) {
      dispatch({ type: LOGIN_FAIL, payload: err.response.data.msg });
    }
  };
  //Log out
  const logout = () => dispatch({ type: LOGOUT });

  //Clear Errors
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });
  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        error: state.error,
        register,
        clearErrors,
        loadUser,
        login,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
