import { rule, shield, and, or, not } from 'graphql-shield';
import { isAuthenticated, isAdmin, isTeamLeader, isRosterManager, isSupportWorker } from './rules';

// Permissions
const permissions = shield({
    Query: {
        users: and(isAuthenticated),
        onlyForAdmin: and(isAuthenticated, isAdmin),
        onlyForTeamLeaders: and(isAuthenticated, isTeamLeader),
        onlyForRosterManagers: and(isAuthenticated, isRosterManager),
        onlyForSupportWorkers: and(isAuthenticated, isSupportWorker),
    },
    Mutation: {
        // createUser: and(isAuthenticated, isAdmin),
    },
    User: isAuthenticated,
});

export { permissions as default };