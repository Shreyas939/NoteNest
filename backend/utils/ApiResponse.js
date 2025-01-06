class ApiResponse{
    constructor(statusCode, data, message="Success",accessToken){
        this.statusCode = statusCode;
        this.data = data
        this.success = statusCode < 400
        this.message = message
        this.accessToken = accessToken
    }
}

export {ApiResponse}