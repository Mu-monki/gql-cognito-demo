import { createError } from "apollo-errors";

const InvalidTokenError = createError('InvalidTokenError', {
    message: 'The token is invalid or has expired'
});

const NoTokenError = createError('NoTokenError', {
    message: 'No Token Recieved'
});

const NotAuthorizedError = createError('NotAuthorizedError', {
    message: 'User does not have sufficient permissions'
});

export { InvalidTokenError, NoTokenError, NotAuthorizedError };