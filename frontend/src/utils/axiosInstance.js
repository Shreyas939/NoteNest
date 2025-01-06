import axios from "axios"
import { BASE_URL } from "./constants"


const axiosInstance = axios.create({
    baseURL:BASE_URL,
    timeout:10000,
    headers:{
        "Content-Type":"application/json",
    },
});

axiosInstance.interceptors.request.use(   // Attaches a function that will be executed before each HTTP request is sent.
    (config) => {
        const accessToken = localStorage.getItem("token");  // Retrieves the authentication token (JWT or access token) stored in the browser's localStorage.
        if (accessToken) {  // Ensures a token is available before adding it to the request header
            config.headers.Authorization = `Bearer ${accessToken}`;  // Adds the token to the Authorization header using the Bearer Token format:
        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    } 
);

export default axiosInstance

