const jwt = require("jsonwebtoken");
const jwt_password = "thisisverikhatarnakpassword";

function auth(req, res, next) {
  const token = req.headers.token;
  const decodedData = jwt.verify(token, jwt_password);

  if (decodedData) {
    req.userId = decodedData.id;
    next();
  } else {
    res.status(200).json({
      message: "Invalid Credintials",
    });
  }
}

module.exports = {
  auth,
  jwt_password,
};
