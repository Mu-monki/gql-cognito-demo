import { rule, shield, and, or, not, CustomError } from 'graphql-shield';
import roles from './roles';
import { NotAuthorizedError, InvalidTokenError, NoTokenError } from './errors';
import jwt from 'jsonwebtoken';
import { jwkToPem } from 'jwk-to-pem';

// Rules
const isAuthenticated = rule()(async (parent, args, ctx, info) => {  
    console.log('checking if authenticated..');

    let authenticationResult = await authenticate(ctx.req);

    if(authenticationResult !== null) {
        return true;
    } else {
        throw new InvalidTokenError();
    }
});

const isAdmin = rule()(async (parent, args, ctx, info) => {
    console.log('checking if user is admin');

    if(ctx.token['cognito:groups'].includes(roles.admin)) {
        return true;
    } else {
        throw new NotAuthorizedError();
    }

});

const isRosterManager = rule()(async (parent, args, ctx, info) => {
    console.log('checking if user is roster manager');
    if(ctx.token['cognito:groups'].includes(roles.rosterManager)) {
        return true;
    } else {
        console.log('NOT ROSTER MANAGER');
        throw new NotAuthorizedError();
    }
});

const isTeamLeader = rule()(async (parent, args, ctx, info) => {
    console.log('checking if user is team lead');
    return ctx.token['cognito:groups'].includes(roles.teamLeader);
});

const isSupportWorker = rule()(async (parent, args, ctx, info) => {
    console.log('checking if user is support worker');
    return ctx.token['cognito:groups'].includes(roles.supportWorker);
});


async function authenticate(req) {
    let token;
    const jwt = require('jsonwebtoken');
    const jwk = require('../jwks.json');
    const jwkToPem = require('jwk-to-pem');
    const pem = jwkToPem(jwk.keys[1]);

    try {
        token = jwt.verify(req.request.headers.authorization, pem);
        console.log('authentication success');
    } catch(err) {
        return new AuthenticationError('Not Authorized');
    }

    // Authentication Logic Here

    return token;
}

export { isAuthenticated, isAdmin, isTeamLeader, isRosterManager, isSupportWorker };