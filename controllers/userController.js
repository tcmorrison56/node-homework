const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const { userSchema } = require("../validation/userSchema");

/* ------- HELPER FUNCTIONS ------- */
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/* ------- CONTROLLER FUNCTIONS ------- */
async function register(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: error.message });

  const { name, email, password } = value;
  const hashedPassword = await hashPassword(password);

  const user = {
    name,
    email,
    hashedPassword,
  };

  global.user_id = user;
  global.users.push(user);
  res.status(201).json({ name: user.name, email: user.email });
}

async function logon(req, res) {
  const { email, password } = req.body;
  const user = global.users.find((user) => user.email === email);
  const goodCredentials =
    user && (await comparePassword(password, user.hashedPassword));
  if (!goodCredentials) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  global.user_id = user;
  res.status(200).json({ name: user.name, email: user.email });
}

function logoff(req, res) {
  global.user_id = null;
  res.status(200).json({ message: "Logged out successfully" });
}

module.exports = { register, logon, logoff };
