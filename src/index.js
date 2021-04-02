import { GraphQLServer, PubSub } from 'graphql-yoga';
import jwt from 'jsonwebtoken';
import { rule, shield, and, or, not } from 'graphql-shield';
import Amplify, { Auth } from 'aws-amplify';
import { config } from './config';
import { AuthenticationError } from "apollo-server-core";
import { jwkToPem } from 'jwk-to-pem';
import { formatError } from "apollo-errors";

import permissions from './auth/permissions';
import db from './db';
import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import User from './resolvers/User';
import Post from './resolvers/Post';
import Comment from './resolvers/Comment';
import Subscription from './resolvers/Subscription';

// Configure AWS Amplify
Amplify.configure({
    Auth: {
      region: config.cognito.REGION,
      userPoolId: config.cognito.USER_POOL_ID,
      userPoolWebClientId: config.cognito.USER_POOL_WEB_CLIENT_ID,
      authenticaitonFlowType: config.cognito.AUTHENTICATION_FLOW_TYPE,
    }
});

// Subscriptions
const pubsub = new PubSub();

// Helper Detokenization Function 
function getClaims(req) {
    let token;
    const jwt = require('jsonwebtoken');
    const jwk = require('./jwks.json');
    const jwkToPem = require('jwk-to-pem');
    const pem = jwkToPem(jwk.keys[1]);

    console.log('authenticating..');
    console.log(req.request.headers.authorization);

    try {
        token = jwt.verify(req.request.headers.authorization, pem);
        return token;
    } catch(err) {
        console.log(err);
        return err;
    }
}

// Instanciating Server
const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: {
        Query,
        Mutation,
        Subscription,
        User,
        Post,
        Comment,
    },
    middlewares: [
        permissions
    ],
    context(req) {
        const token = getClaims(req);

        return {
            req,
            token,
            db,
            pubsub
        };
    },
    // formatError
});

// Options
const options = {
    formatError
};

server.start(options, () => {
    console.log('Server is now running!');
});