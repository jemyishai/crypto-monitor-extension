const path = require('path');
const CopyPlugin = require('copy-webpack-plugin'); 

module.exports = {
  mode: 'production',
  devtool: false,  
  entry: {
    popup: './popup.js',
    background: './background.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
    publicPath: '/dist/',
    environment: {
      module: true
    },
    webassemblyModuleFilename: "[hash].wasm"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      },
      {
        test: /\.wasm$/,
        type: "webassembly/async",
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      react: path.resolve('./node_modules/react')
    }
  },
  experiments: {
    asyncWebAssembly: true
  }, plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: "dist/crypto_monitor.wasm",
          to: "crypto_monitor.wasm"
        }
      ],
    }),
  ],
};