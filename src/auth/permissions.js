import { rule, shield, and, or, not } from 'graphql-shield';
import { isAuthenticated, isAdmin, isTeamLeader, isRosterManager, isSupportWorker, isGuest } from './rules';

// Permissions
const permissions = shield({
    Query: {
        users: isAuthenticated,

        // Queries for testing service authorization
        onlyForAdmin: and(isAuthenticated, isAdmin),
        onlyForTeamLeaders: and(isAuthenticated, isTeamLeader),
        onlyForRosterManagers: and(isAuthenticated, isRosterManager),
        onlyForSupportWorkers: and(isAuthenticated, isSupportWorker),
    },
    Mutation: {
        createUser: isAdmin,
        disableUser: isAdmin,
        deleteUser: isAdmin,
        confirmSignup: isGuest,
        setCognitoGroup: isAdmin,
    },
    User: isGuest,
});

export { permissions as default };