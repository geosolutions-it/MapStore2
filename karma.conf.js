module.exports = function karmaConfig(config) {
  config.set({

    browsers: [ 'Chrome' ],

    singleRun: true,

    frameworks: [ 'mocha' ],

    files: [
      'tests.webpack.js'
    ],

    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'dots', 'coverage' ],

    junitReporter: {
      outputDir: './web/target',
      suite: ''
    },

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          { test: /\.jsx$/, loader: 'babel-loader' }
        ],
        postLoaders: [{
            test: /\.jsx$/,
            exclude: /(__tests__|node_modules|legacy)\//,
            loader: 'istanbul-instrumenter'
        }]
      }
    },

    webpackServer: {
      noInfo: true
    }

  });
};
