const { dependencies } = require('./package.json');

const { REACT_APP_APPLICATION_ID } = process.env;

module.exports = {
  name: `ID${REACT_APP_APPLICATION_ID}`,
  exposes: {
    './App': './src/App',
  },
  filename: 'remoteEntry.js',
  shared: {
    /*     ...dependencies, */
    react: {
      singleton: true,
      requiredVersion: dependencies['react'],
    },
    'react-dom': {
      singleton: true,
      requiredVersion: dependencies['react-dom'],
    },
    '@material-ui/core': {
      singleton: true,
      requiredVersion: dependencies['@material-ui/core'],
    },
    '@material-ui/styles': {
      singleton: true,
      requiredVersion: dependencies['@material-ui/styles'],
    },
  },
};
