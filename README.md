# meteor-accounts-jwt

This enables logging in to Meteor's user account system with a JSON web token.
The JWT payload is tied to an e-mail address, which allows you to send a login
link that verifies a user's email address before the actual user document is 
created.

## Installation

`meteor add hackprinceton:accounts-jwt`

## Settings

## Usage

```javascript
import { JWTLogin } from 'meteor/hackprinceton:accounts-jwt';
```

Initialize this package by calling `JWTLogin.init()` on application startup.

```js
JWTLogin.init({
  "secret": "some-secret-string",
  "tokenOptions": { ... },  // see below
  "verifyOptions": { ... }  // see below
});
```

This package uses [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
for the actual JWT encoding / decoding. The `tokenOptions` in `settings.json`
should correspond to the options provided to `jwt.sign` while the
`verifyOptions` should correspond to the options provided to `jwt.verify`.

Call `JWTLogin.getToken(email)` to get a token for a given email address. You
can use this token to construct a special login link for emailing or whatever
else you want.

On the client, call `Meteor.loginWithJWT({ token: <the token> }, callback)` to
automatically log a user in with a given token. The callback receives an error
on failure and nothing on success. If the token is for an e-mail address not
associated with a user, the error returned will have its `error` property equal
to 404.

When creating a new user, you can pass the token like so to create a user 
with an automatically verified e-mail address:

```javascript
Accounts.createUser({ 
  email: email, 
  password: password, 
  jwt: token 
}, function(err) {
  // do something ...
});
```

If the email provided to `createUser` does not match the e-mail encoded by
the token, the e-mail provided by the token overrides the given e-mail.

## Testing

```sh
meteor test-packages ./
```
