Package.describe({
  name: 'hackprinceton:accounts-jwt',
  version: '0.1.0',
  summary: 'A JSON web tokens-based login approach, implementing email and SMS magic liinks.',
  git: 'https://github.com/hackprinceton/meteor-accounts-jwt',
});

Npm.depends({ jsonwebtoken: '8.1.0' });

Package.onUse((api) => {
  api.versionsFrom('METEOR@1.5.2.2');
  api.use('accounts-base');
  api.use('underscore');
  api.use('random');
  api.use('check');

  api.addFiles('jwt_login_client.js', ['client']);
  api.addFiles('jwt_login_server.js', ['server']);
  api.export('JWTLogin', ['server', 'client']);
});

Package.onTest((api) => {
  api.use('tinytest');
  api.use('hackprinceton:accounts-jwt');
  api.use('random');
  api.use('accounts-password');
  api.addFiles('jwt_login_tests.js', ['client', 'server']);
});
