import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { JWTLogin } from 'meteor/hackprinceton:accounts-jwt';

// Auto-set something for our secret
if (Meteor.isServer) {
  JWTLogin.init({
    secret: Random.secret(),
  });
}

// Meteor methods for testing server code
if (Meteor.isServer) {
  Meteor.methods({
    // Get a token for a given email
    'jwtlogin/getToken': function (email) {
      return { token: JWTLogin.getToken(email) };
    },

    // Get a token for a new user altogether
    'jwtlogin/getTokenForNewUser': function () {
      const email = `e${Random.id(17)}@example.com`;
      const userId = Accounts.createUser({ email, password: 'pass' });
      return {
        userId,
        email,
        token: JWTLogin.getToken(email),
      };
    },
  });
}

// All tests start with client
if (Meteor.isClient) {
  Tinytest.addAsync(
    'Should be able to login to existing user with token',
    (test, done) => {
      Meteor.call('jwtlogin/getTokenForNewUser', (err, res) => {
        if (err) { throw err; }
        if (res) {
          Meteor.loginWithJWT({ token: res.token }, (err) => {
            if (err) { throw err; }

            // No error -> make sure we're logged in
            test.equal(Meteor.userId(), res.userId);

            // Make sure email is set currently
            const user = Meteor.user();
            test.equal(user.emails[0].address, res.email);
            test.equal(user.emails[0].verified, true);
            done();
          });
        }
      });
    },
  );

  Tinytest.addAsync(
    'Login for non-existent user should throw error',
    (test, done) => {
      const email = `e${Random.id(17)}@example.com`;
      Meteor.call('jwtlogin/getToken', email, (err, res) => {
        if (err) { throw err; }
        if (res) {
          Meteor.loginWithJWT({ token: res.token }, (err) => {
            test.isTrue(err);
            test.equal(err.error, 404);
            test.equal(err.reason, 'user-not-found');
            done();
          });
        }
      });
    },
  );

  Tinytest.addAsync(
    'Creating user with jwt option mark email as verified',
    (test, done) => {
      const email = `e${Random.id(17)}@example.com`;
      Meteor.call('jwtlogin/getToken', email, (err, res) => {
        if (err) { throw err; }
        if (res) {
          // NB: The email in the JWT should override the e-mail given
          Accounts.createUser(
            {
              email: 'whatever@example.com',
              password: 'pass',
              jwt: res.token,
            },
            (err) => {
              if (err) { throw err; }

              // Make sure email is verified
              const user = Meteor.user();
              test.equal(user.emails[0].address, email);
              test.equal(user.emails[0].verified, true);
              done();
            },
          );
        }
      });
    },
  );

  Tinytest.addAsync(
    'Creating user with inalid jwt option should not verify',
    (test, done) => {
      const email = `e${Random.id(17)}@example.com`;
      Meteor.call('jwtlogin/getToken', email, (err, res) => {
        if (err) { throw err; }
        if (res) {
          Accounts.createUser(
            {
              email,
              password: 'pass',
              jwt: 'gibberish',
            },
            (err) => {
              if (err) { throw err; }

              // Make sure email is not verified
              const user = Meteor.user();
              test.equal(user.emails[0].address, email);
              test.equal(user.emails[0].verified, false);
              done();
            },
          );
        }
      });
    },
  );
}
