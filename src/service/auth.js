import Amplify, { Auth } from 'aws-amplify';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { config } from '../config';

// Configure AWS Amplify
Amplify.configure({
    Auth: {
      region: config.cognito.REGION,
      userPoolId: config.cognito.USER_POOL_ID,
      userPoolWebClientId: config.cognito.USER_POOL_WEB_CLIENT_ID,
      authenticaitonFlowType: config.cognito.AUTHENTICATION_FLOW_TYPE,
    }
});



export class AuthService {

    static async getUserDetails() {
        return await Auth.currentAuthenticatedUser();
    }
    
    static async getCurrentSession() {
        const session = await this.getCurrentToken();
    
        // Decode data from generated tokens
        const sessionData = session.getIdToken().decodePayload();
    
        console.log(session);
        console.log(sessionData);
    
        return sessionData;
    }
    
    static async getCurrentToken() {
        const session = await Auth.currentSession();
    
        return session;
    }

    static async signUp(email, password, attributes) {
        try {
            const { user } = await Auth.signUp({
                username: email,
                password,
                attributes: {
                    attributes
                }
            });
            console.log(user);
        } catch (error) {
            console.log('error signing up:', error);
        }
    }

    static async confirmSignUp(email, code) {
        // Confirmation of Email
        try {
            await Auth.confirmSignUp(email, code)
                .then(data => {
                    if(data) {
                        console.log('account confirmation success', data);
                    }
                });
        } catch (error) {
            console.log('error confirming sign up', error);
        }
    }

    static async createCognitoUser(email, tempPassword, args) {
        // Creates AWS Cognito User
        try {
            console.log('data', { email, tempPassword });
            const { user } = await Auth.signUp({
                username: email,
                password: tempPassword,
            });

            console.log('created cognito user!', user);
            return user;
        } catch (error) {
            console.log('cognito error signing up:', error);
        }
    }

    static async disableCognitoUser(email) {

        // AWS JS SDK Cognito Identity Provider Configuration
        const cognitoIdentityProvider = new CognitoIdentityProvider({
            region: config.cognito.REGION,
        });

        // Disables AWS Cognito User
        const params = { 
            UserPoolId: config.cognito.USER_POOL_ID,
            Username: email
        };


        const data = await cognitoIdentityProvider.adminDisableUser(params)
                    .then((result) => {
                        console.log('user disabled', result);
                        return result;
                    })
                    .catch((err) => {
                        console.log('error disabling', err);
                    })
        if(data) {
            return true;
        } else {
            return false;
        }
    }

    static async deleteCognitoUser(email) {
        // AWS JS SDK Cognito Identity Provider Configuration
        const cognitoIdentityProvider = new CognitoIdentityProvider({
            region: config.cognito.REGION,
        });

        // Deletes AWS Cognito User
        const params = {
            UserPoolId: config.cognito.USER_POOL_ID,
            Username: email
        };
        
        const data = await cognitoIdentityProvider.adminDeleteUser(params)
                .then((result) => {
                    console.log('user deleted', result);
                    return result;
                })
                .catch((err) => {
                    console.log('error deleted', err);
                });
                
        if(data) {
            return true;
        } else {
            return false;
        }
    }

    static async setCognitoGroup(email, role) {
        let isSuccessful = false;

        // AWS JS SDK Cognito Identity Provider Configuration
        const cognitoIdentityProvider = new CognitoIdentityProvider({
            region: config.cognito.REGION,
        });

        // Deletes AWS Cognito User
        const params = {
            GroupName: role,
            UserPoolId: config.cognito.USER_POOL_ID,
            Username: email,
        };

        cognitoIdentityProvider.adminAddUserToGroup(params,
            function(err, data) {
                if(err) {
                    console.log('setting cognito group failed', err);
                } else {
                    isSuccessful = true;
                    console.log('user set to group', data);
                }
            });
        
        return isSuccessful;
    }
}