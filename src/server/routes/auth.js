let express = require('express');
let msal = require('@azure/msal-node');
const acjDB = require('../database');

let {
    msalConfig,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI
} = require('../authConfig');

const router = express.Router();
const msalInstance = new msal.ConfidentialClientApplication(msalConfig);
const cryptoProvider = new msal.CryptoProvider();

/**
 * Prepares the auth code request parameters and initiates the first leg of auth code flow
 * @param req: Express request object
 * @param res: Express response object
 * @param next: Express next function
 * @param authCodeUrlRequestParams: parameters for requesting an auth code url
 * @param authCodeRequestParams: parameters for requesting tokens using auth code
 */
async function redirectToAuthCodeUrl(req, res, next, authCodeUrlRequestParams, authCodeRequestParams) {

    // Generate PKCE Codes before starting the authorization flow
    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

    // Set generated PKCE codes and method as session vars
    req.session.pkceCodes = {
        challengeMethod: 'S256',
        verifier: verifier,
        challenge: challenge,
    };

    req.session.authCodeUrlRequest = {
        redirectUri: REDIRECT_URI,
        responseMode: 'form_post', // recommended for confidential clients
        codeChallenge: req.session.pkceCodes.challenge,
        codeChallengeMethod: req.session.pkceCodes.challengeMethod,
        ...authCodeUrlRequestParams,
    };

    req.session.authCodeRequest = {
        redirectUri: REDIRECT_URI,
        code: "",
        ...authCodeRequestParams,
    };

    // Get url to sign user in and consent to scopes needed for application
    try {
        const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(req.session.authCodeUrlRequest);
        res.redirect(authCodeUrlResponse);
    } catch (error) {
        next(error);
    }
};

router.get('/signin', async function (req, res, next) {

    // create a GUID for csrf
    req.session.csrfToken = cryptoProvider.createNewGuid();

    const state = cryptoProvider.base64Encode(
        JSON.stringify({
            csrfToken: req.session.csrfToken,
            redirectTo: '/'
        })
    );

    const authCodeUrlRequestParams = {
        state: state,
        scopes: [],
    };

    const authCodeRequestParams = {
        scopes: [],
    };
    // trigger the first leg of auth code flow
    return redirectToAuthCodeUrl(req, res, next, authCodeUrlRequestParams, authCodeRequestParams)
});

router.post('/redirect', async function (req, res, next) {
    if (req.body.state) {
        const state = JSON.parse(cryptoProvider.base64Decode(req.body.state));
        // check if csrfToken matches
        if (state.csrfToken === req.session.csrfToken) {
            req.session.authCodeRequest.code = req.body.code; // authZ code
            req.session.authCodeRequest.codeVerifier = req.session.pkceCodes.verifier // PKCE Code Verifier

            try {
                const tokenResponse = await msalInstance.acquireTokenByCode(req.session.authCodeRequest);
                req.session.accessToken = tokenResponse.accessToken;
                req.session.idToken = tokenResponse.idToken;
                req.session.account = tokenResponse.account;
                req.session.isAuthenticated = true;
                //CHECK IF NEW USER
                const db = acjDB.openDbConn();
                const usr = await acjDB.getAcjUserFromUsername(db, req.session.account?.username);
                //check if student or not
                const role = req.session.account?.username.search("@student") !== -1 ? 0 : 1;
                if(!usr){
                    await acjDB.insertUser(db,req.session.account?.username, role);
                }
                // Teacher's are the only users able to create activities
                req.session.isTeacher = role === 1;
                //req.session.isTeacher = 1;
                acjDB.closeDbConn(db);
                res.redirect(state.redirectTo);
            } catch (error) {
                console.log(error);
                next(error);
            }
        } else {
            next(new Error('csrf token does not match'));
        }
    } else {
        next(new Error('state is missing'));
    }
});

router.get('/signout', function (req, res) {
    const logoutUri = `${msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;

    req.session.destroy(() => {
        res.redirect(logoutUri);
    });
});

module.exports = router;