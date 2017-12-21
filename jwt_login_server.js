import jwt from 'jsonwebtoken';
import { _ } from 'meteor/underscore';
import { Match, check } from 'meteor/check';

export const JWTLogin = {};

/** The secret used for HMAC signing. */
let secret;

/** The options used during signing. */
let tokenOptions;

/** The options ued for verification. */
let verifyOptions;

/**
 * Initialize the login mechanism. 
 * @param {Object} options A key with options `secret`, `tokenOptions`, and `verifyOptions`.
 *                         `secret` is mndatory and refers to the signing secret used.
 *                         `tokenOptions` are options used during signing. `verifyOptions` are
 *                         the options used during verification.
 */
JWTLogin.init = (options) => {
  check(options, {
    secret: String,
    tokenOptions: Match.Maybe({}),
    verifyOptions: Match.Maybe({}),
  });

  secret = options.secret; // eslint-disable-line prefer-destructuring
  tokenOptions = _.defaults(options.tokenOptions || {}, {
    expiresIn: 48 * 60,
  });
  verifyOptions = _.defaults(options.verifyOptions || {}, {
    ignoreExpiration: false,
  });
};

// Get token to verify e-mail address
JWTLogin.getToken = function (email) {
  check(email, String);
  check(secret, String);
  return jwt.sign({ email }, secret, tokenOptions);
};

// Verify a token
JWTLogin.verifyToken = function (token) {
  check(token, String);
  check(secret, String);
  return jwt.verify(token, secret, verifyOptions);
};

// Register a login handler
Accounts.registerLoginHandler('jwt_login', (options) => {
  if (!_.isString(options.jwt)) {
    return undefined; // Don't handle
  }

  // Payload should be of form {email: email}
  let email;
  try {
    email = JWTLogin.verifyToken(options.jwt).email;
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return { error: new Meteor.Error(400, 'invalid-token') };
    } else if (err.name === 'TokenExpiredError') {
      return { error: new Meteor.Error(400, 'expired-token') };
    }

    throw err; // Unknown error
  }

  if (!_.isString(email)) {
    return { error: new Meteor.Error(400, 'invalid-token') };
  }

  // Find the actual user object
  const user = Meteor.users.findOne({
    'emails.address': email,
  });

  // Existing user => verify user if necessary
  if (user) {
    const emailObj = _.findWhere(user.emails, { address: email });
    if (!emailObj.verified) {
      Meteor.users.update({
        _id: user._id,
        'emails.address': email,
      }, {
        $set: {
          'emails.$.verified': true,
        },
      });
    }

    // Return login result for this user
    return {
      userId: user._id,
    };
  }

  // Else no user. Throw error so client knows to init user creation
  return {
    error: new Meteor.Error(404, 'user-not-found'),
  };
});

// Override insertUserDoc to mark e-mails as verified on creation when
// the 'jwt' option is set
const oldInsertUserDoc = Accounts.insertUserDoc;
Accounts.insertUserDoc = function (options, user) {
  if (_.isString(options.jwt)) {
    let email;
    try {
      email = JWTLogin.verifyToken(options.jwt).email;
    } catch (err) {
      // Invalid token -> ignore
    }
    if (email) {
      // Replace emails var with verified address
      user.emails = [{
        address: email,
        verified: true,
      }];
    }
  }
  return oldInsertUserDoc.apply(Accounts, arguments);
};
