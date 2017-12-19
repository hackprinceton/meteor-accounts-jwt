Package.describe({
  name: 'hackprinceton:accounts-jwt',
  version: '0.1.0',
  summary: 'A JSON web tokens-based login approach, implementing email and SMS magic liinks.',
  git: 'https://github.com/hackprinceton/meteor-accounts-jwt',
});

Npm.depends({ jsonwebtoken: '8.1.0' });

Package.onUse((api) => {
  api.versionsFrom('1.5.2');
  api.use('ecmascript');
  api.use('accounts-base');
  api.use('underscore');
  api.use('random');
  api.use('check');

  api.mainModule('jwt_login_server.js', 'server');
  api.mainModule('jwt_login_client.js', 'client');
});

Package.onTest((api) => {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('hackprinceton:accounts-jwt');
  api.use('random');
  api.use('accounts-password');
  api.addFiles('jwt_login_tests.js', ['client', 'server']);
});
