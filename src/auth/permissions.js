import { rule, shield, and, or, not } from 'graphql-shield';
import { isAuthenticated, isAdmin, isTeamLeader, isRosterManager, isSupportWorker, isGuest } from './rules';

// Permissions
const permissions = shield({
    Query: {
        users: and(isAuthenticated),

        // Queries for testing service authorization
        onlyForAdmin: and(isAuthenticated, isAdmin),
        onlyForTeamLeaders: and(isAuthenticated, isTeamLeader),
        onlyForRosterManagers: and(isAuthenticated, isRosterManager),
        onlyForSupportWorkers: and(isAuthenticated, isSupportWorker),
    },
    Mutation: {
        createUser: and(isAuthenticated, isAdmin),
        disableUser: and(isGuest),
        deleteUser: and(isGuest),
        confirmSignup: and(isGuest),
    },
    User: isAuthenticated,
});

export { permissions as default };