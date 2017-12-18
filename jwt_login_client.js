import { Accounts } from 'meteor/accounts-base';

// Login with JSON web token
Accounts.loginWithJWT = function (token, callback) {
  Accounts.callLoginMethod({
    methodArguments: [{
      jwt: token,
    }],
    userCallback: callback,
  });
};
