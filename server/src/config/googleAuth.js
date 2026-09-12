const { OAuth2Client } = require('google-auth-library');

// Verifies a Google ID token and returns the user payload.
async function verifyGoogleToken(idToken) {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const client = new OAuth2Client(clientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId ? [clientId] : undefined,
    });
    return ticket.getPayload();
  } catch (err) {
    console.error('Google token verification failed:', err.message);
    throw err;
  }
}

module.exports = { verifyGoogleToken };