const crypto = require('crypto');

/**
 * Verify GitHub webhook signature using HMAC SHA256
 * @param {Buffer} rawBody - raw request body buffer
 * @param {string} signatureHeader - value of x-hub-signature-256 header
 * @param {string} secret - webhook secret
 * @returns {boolean}
 */
function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !rawBody) return false;

  const expectedPrefix = 'sha256=';
  if (!signatureHeader.startsWith(expectedPrefix)) return false;

  const received = signatureHeader.slice(expectedPrefix.length);

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');

  try {
    const bufReceived = Buffer.from(received, 'hex');
    const bufDigest = Buffer.from(digest, 'hex');
    if (bufReceived.length !== bufDigest.length) return false;
    return crypto.timingSafeEqual(bufReceived, bufDigest);
  } catch (err) {
    return false;
  }
}

module.exports = { verifySignature };
