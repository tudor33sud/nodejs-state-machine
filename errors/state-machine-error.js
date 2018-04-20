const required = (paramName) => { throw new Error(`Parameter ${paramName} missing`) };
module.exports = class StateMachineError extends Error {
    constructor(message, errorCode = required('errorCode')) {
        super(message);
        this.errorCode = errorCode;
    }
}