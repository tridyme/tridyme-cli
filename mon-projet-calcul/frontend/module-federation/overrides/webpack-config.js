const { ModuleFederationPlugin } = require('webpack').container;

const webpackConfigPath = '../../node_modules/react-scripts/config/webpack.config';
const webpackConfig = require(webpackConfigPath);

const override = (config) => {
  config.plugins.push(new ModuleFederationPlugin(require('../../modulefederation.config.js')));
  config.module.rules.push({
    test: /\.scss$/,
    use: [
      { loader: 'style-loader' },
      {
        loader: 'css-loader', options: {
          sourceMap: true, modules: true,
          localIdentName: '[local]_[hash:base64:5]'
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          config: {
            path: 'postcss.config.js'
          }
        }
      },
      {
        loader: 'sass-loader', options: { sourceMap: true }
      }
    ]
  })
  config.output.publicPath = 'auto';

  return config;
};

require.cache[require.resolve(webpackConfigPath)].exports = (env) => override(webpackConfig(env));

module.exports = require(webpackConfigPath);
