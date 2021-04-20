export const config = {
    cognito: {
        REGION: 'ap-southeast-1',
        USER_POOL_ID: 'ap-southeast-1_htdQa6JCp',
        USER_POOL_WEB_CLIENT_ID: '6b8sl7pg9tgepbcnpvh25l6q3q',
        AUTHENTICATION_FLOW_TYPE: 'USER_PASSWORD_AUTH',
        JWK_URL: 'https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_htdQa6JCp/.well-known/jwks.json'
    },
    accounts: {
        ACCOUNT_STATUS: {
            ACTIVE: 'Active',
            INACTIVE: 'Inactive',
            UNCONFIRMED: 'Unconfirmed',
            FORCE_PASSWORD_CHANGE: 'ForcePasswordChange',
        }
    },
    prisma: {
        TYPEDEFS: 'src/generated/prisma.graphql',
        ENDPOINT: 'http://localhost:4466',
        SECRET: '',

    }
};