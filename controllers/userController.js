const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const { userSchema } = require("../validation/userSchema");
const pool = require("../db/pg-pool");
const prisma = require("../db/prisma");

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

  let user = null;
  value.hashedPassword = await hashPassword(value.password);
  delete value.password;

  const { name, email, hashedPassword } = value;

  try {
    user = await prisma.user.create({
      data: { name, email, hashedPassword },
      select: { name: true, email: true, id: true },
    });
  } catch (err) {
    if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") {
      return res
        .status(400)
        .json({ message: "This email is already registered." });
    } else {
      return next(err);
    }
  }

  global.user_id = user.id;
  res.status(201).json({ name: user.name, email: user.email });
}

async function logon(req, res) {
  if (!req.body) req.body = {};
  let { email, password } = req.body;
  email = email.toLowerCase();
  // const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
  //   email,
  // ]);
  const user = await prisma.user.findUnique({ where: { email } });

  const goodCredentials =
    user && (await comparePassword(password, user.hashedPassword));
  if (!goodCredentials) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  global.user_id = user.id;
  res.status(200).json({ name: user.name, email: user.email });
}

function logoff(req, res) {
  global.user_id = null;
  res.status(200).json({ message: "Logged out successfully" });
}

module.exports = { register, logon, logoff };
