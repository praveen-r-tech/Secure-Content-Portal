const { auth } = require('express-oauth2-jwt-bearer');

const domain = process.env.AUTH0_DOMAIN;
const audience = process.env.AUTH0_AUDIENCE;

let jwtCheck;
if (domain && audience) {
  // Validates the Authorization header on every protected request:
  // JWT signature (via Auth0 JWKS), issuer, and expected audience.
  jwtCheck = auth({
    audience,
    issuerBaseURL: `https://${domain}`,
  });
} else {
  // Config guard: never let a request through when Auth0 is unconfigured.
  // Returns an explicit error instead of crashing on the library assertion.
  jwtCheck = (req, res) => {
    res.status(500).json({
      message: 'Auth0 is not configured. Set AUTH0_DOMAIN and AUTH0_AUDIENCE in server/.env',
    });
  };
}

module.exports = { jwtCheck };