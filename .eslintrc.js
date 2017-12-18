module.exports = {
  extends: [
    'airbnb-base',
    'plugin:meteor/recommended',
  ],
  plugins: [
    'import',
    'meteor',
  ],
  env: {
    meteor: true,
    node: true,
    browser: true,
    jasmine: true,
  },
  globals: {
    ga: false,
    fbq: false,
    moment: false,
    twttr: false,
  },
  rules: { // Overrides the following:
    'no-underscore-dangle': 0,                 // purely a preference, will allow
    'no-param-reassign': [1, { props: false }], // allow parameter property reassignment
    'no-plusplus': 0,                          // allow unary increment/decrement
    'no-console': 1,                           // allow the console (but be sure to remove console in production)
    'max-len': 1,                              // warn, but don't throw error
    'global-require': 0,                       // needed for conditional imports
    'func-names': 0,
    'import/no-extraneous-dependencies': 0,    // better if somehow can make exception for meteor
    'import/no-absolute-path': 0,              // better for clarity's sake
    'import/extensions': 0,
    'import/no-unresolved': 0,                 // not working correctly
    'import/prefer-default-export': 0,         // unnecessary
    'meteor/template-names': 0,                // to support multiple naming conventions for now
    'meteor/audit-argument-checks': 0,         // we're not using meteor's check package
    'meteor/no-session': 1,                    // only warn about Session
    'meteor/eventmap-params': [2, {            // prefer consistent naming
      eventParamName: 'evt',
      templateInstanceParamName: 'tpl',
    }],
  },
};
