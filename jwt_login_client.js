import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

const loginWithJWT = function (options, callback) {
  check(options, { token: String });
  const { token } = options;

  Accounts.callLoginMethod({
    methodArguments: [{
      jwt: token,
    }],
    userCallback: callback,
  });
};

Accounts.registerClientLoginFunction('jwt', loginWithJWT);
Meteor.loginWithJWT = (...args) => Accounts.applyLoginFunction('jwt', args);
