import Amplify, { Auth } from 'aws-amplify';
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
        try {
            await Auth.confirmSignUp(email, code);
        } catch (error) {
            console.log('error confirming sign up', error);
        }
    }
}