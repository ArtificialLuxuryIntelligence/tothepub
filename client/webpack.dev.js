const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const Dotenv = require('dotenv-webpack');

const webpack = require('webpack');

module.exports = {
  // mode: 'development',

  entry: {
    main: './src/index.js',
    admin: './src/admin/admin.js',
  },
  devServer: {
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'entry',
                sourceMaps: true,
              },
            ],
          ],
        },
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(sc|c)ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },

          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ], //use postcss-loader?
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new Dotenv(),
    new HtmlWebpackPlugin({
      template: './src/admin/admin.html',
      inject: true,
      chunks: ['admin'],
      filename: './admin/index.html',
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: true,
      chunks: ['main'],
      filename: 'index.html',
    }),
  ],
};
