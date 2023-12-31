const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const { BannerPlugin } = require('webpack')

module.exports = {
  entry: './src/index.js',
  target: 'node',
  mode: 'none',
  devtool: 'source-map',
  cache: {
    type: 'filesystem',
  },
  watchOptions: {
    ignored: /node_modules|dist|build|.gitignore|.upm/,
  },
  performance: false,
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        loader: 'json-loader',
        type: 'javascript/auto',
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
          'ts-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(js|.cjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.cjs', '.tsx'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'module',
    chunkFormat: 'module',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
          ecma: 'latest',
          parse: {
            ecma: 'latest',
          },
          compress: {
            drop_console: false,
          },
          output: {
            ecma: 'latest',
            comments: false,
            beautify: false,
          },
          mangle: {
            safari10: true,
          },
        },
      }),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, 'tsconfig.json'),
      },
    }),
    new BannerPlugin({
      raw: true,
      banner: `
        import { fileURLToPath } from 'url';
        import { dirname } from 'path';
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
      `,
    }),
  ],
}
