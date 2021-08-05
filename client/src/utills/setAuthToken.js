//Check if a token is passed in, if yes, the put it into global header, if not then delete
import axios from 'axios';

const setAuthToken  = token  => {
    // store the token into default headers with value of 'x-auth-token'
    if(token){
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token']
    }
}

export default setAuthToken;