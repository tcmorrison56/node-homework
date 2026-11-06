const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const { userSchema } = require("../validation/userSchema");
const pool = require("../db/pg-pool");

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
async function register(req, res, next) {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation failed", details: error.details });
  }

  let result = null;
  value.hashed_password = await hashPassword(value.password);

  try {
    result = await pool.query(
      `INSERT INTO users (name, email, hashed_password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email`,
      [value.name, value.email, value.hashed_password],
    );
  } catch (e) {
    if (e.code === "23505") {
      return res
        .status(400)
        .json({ message: "This email is already registered." });
    }
    return next(e);
  }

  const user = result.rows[0];

  global.user_id = user.id;
  res.status(201).json({ name: user.name, email: user.email });
}

async function logon(req, res) {
  if (!req.body) req.body = {};
  const { email, password } = req.body;
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  const goodCredentials =
    result.rows.length &&
    (await comparePassword(password, result.rows[0].hashed_password));
  if (!goodCredentials) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  global.user_id = result.rows[0].id;
  res
    .status(200)
    .json({ name: result.rows[0].name, email: result.rows[0].email });
}

function logoff(req, res) {
  global.user_id = null;
  res.status(200).json({ message: "Logged out successfully" });
}

module.exports = { register, logon, logoff };
