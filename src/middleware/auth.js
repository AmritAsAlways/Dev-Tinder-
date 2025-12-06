const AdminAuth = (req, res, next) => {
  const token = "xyzafala";
  const isAuthorized = token === "xyz";
  if (isAuthorized) {
    next();
  } else {
    res.status(401).send("Unauthorized Request");
  }
};

const UserAuth = (req, res, next) => {
  const token = "xyzafala";
  const isAuthorized = token === "xyz";
  if (isAuthorized) {
    next();
  } else {
    res.status(401).send("Unauthorized Request");
  }
};

module.exports = {
  AdminAuth,
  UserAuth,
};
