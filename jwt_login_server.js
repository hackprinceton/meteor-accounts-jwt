import jwt from 'jsonwebtoken';
import { Meteor } from 'meteor/meteor';
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

  if (!secret && Meteor.isDevelopment) {
    console.warn('accounts-jwt initialized again after already being initialized.');
    console.warn('This may lead to previously produced JWTs becoming invalid.');
  }

  secret = options.secret; // eslint-disable-line prefer-destructuring
  tokenOptions = _.defaults(options.tokenOptions || {}, {
    algorithm: 'HS512',
    expiresIn: '20m',
  });
  verifyOptions = _.defaults(options.verifyOptions || {}, {
    ignoreExpiration: false,
    algorithms: ['HS512'],
  });
};

/**
 * Generates a login token to be sent to the email address and verified.
 * @param {string} email the email address to be verified
 */
JWTLogin.getToken = (email) => {
  check(email, String);
  check(secret, String);
  return jwt.sign({ email }, secret, tokenOptions);
};

/**
 * Verifies a JWT. This function respects JWT expiry by default unless otherwise
 * specified in `verifyOptions` on initialization.
 * @param {string} token the token to be verified
 */
JWTLogin.verifyToken = (token) => {
  check(token, String);
  check(secret, String);
  return jwt.verify(token, secret, verifyOptions);
};

// Register a login handler
Accounts.registerLoginHandler('jwt', (options) => {
  const token = options.jwt;
  if (!_.isString(token)) {
    return undefined; // Don't handle
  }

  // Payload should be of form {email: email}
  let email;
  try {
    // eslint-disable-next-line prefer-destructuring
    email = JWTLogin.verifyToken(token).email;
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return { error: new Meteor.Error(400, 'invalid-token') };
    } else if (err.name === 'TokenExpiredError') {
      return { error: new Meteor.Error(400, 'expired-token') };
    }

    throw err;
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
  return { error: new Meteor.Error(404, 'user-not-found') };
});

// Override insertUserDoc to mark e-mails as verified on creation when
// the 'jwt' option is set
const oldInsertUserDoc = Accounts.insertUserDoc;
Accounts.insertUserDoc = function (...args) {
  const [options, user] = args;
  if (_.isString(options.jwt)) {
    let email;
    try {
      // eslint-disable-next-line prefer-destructuring
      email = JWTLogin.verifyToken(options.jwt).email;
    } catch (err) {
      // invalid token -> ignore
    }
    if (email) {
      // Replace emails var with verified address
      user.emails = [{
        address: email,
        verified: true,
      }];
    }
  }
  return oldInsertUserDoc.apply(Accounts, args);
};
