function register(req, res) {
  const { name, email, password } = req.body;
  const user = { name, email, password };
  global.user_id = user;
  global.users.push(user);
  res.status(201).json({ name: name, email: email });
}

function logon(req, res) {
    const {email, password} = req.body;
    global.users.forEach((user) => {
        if(user.email === email && user.password ===password) {
            global.user_id = user;
            res.status(200).json({name: user.name, email:user.email});
        }
        if(user.email === email && user.password !== password) {
            res.status(401)
        }
        if(user.password === password && user.email !== email) {
            res.status(401)
        }
        if(user.email !== email && user.password !== password) {
            res.status(401)
        }
    })
}

function logoff(req, res) {
    global.user_id = null;
    res.status(200);
}

module.exports = { register, logon, logoff };
