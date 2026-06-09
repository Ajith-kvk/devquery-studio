const CryptoJS = require('crypto-js');

const SECRET = process.env.ENCRYPTION_KEY;

// Encrypt an object before saving to DB
// e.g. { uri: "mongodb+srv://..." } becomes a long encrypted string
function encrypt(data) {
  const str = JSON.stringify(data);
  return CryptoJS.AES.encrypt(str, SECRET).toString();
}

// Decrypt back to the original object
function decrypt(cipherText) {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
  const str = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(str);
}

module.exports = { encrypt, decrypt };