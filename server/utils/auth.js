const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  // TODO: we only need the input parameter 'req'
  // authMiddleware: function (req, res, next) {
  authMiddleware: function ( { req } ) {
    // allows token to be sent via  req.query or headers
    let token = req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      // TODO: this should return req not throwing error
      return req;
      // return res.status(400).json({ message: 'You have no token!' });
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
      // TODO: we will return req at the end of this function when encountering error in  deciphering token
      // return res.status(400).json({ message: 'invalid token!' });
    }

    // TODO: we will return req instead of send to next endpoint
    // send to next endpoint
    // next();
    return req;
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
