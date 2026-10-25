function register(req, res) {
  const { name, email, password } = req.body;
  const user = { name, email, password };
  global.user_id = user;
  global.users.push(user);
  res.status(201).json({ name: name, email: email });
}

function logon(req, res) {
  const { email, password } = req.body;
  const user = global.users.find((user) => user.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (user.password !== password) {
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
