module.exports = function karmaConfig(config) {
    var postLoaders = [];
    // postloader compiles the jsx
    // so is needed only for coverage test, not in continuostest
    // assume singleRun = false means you are debugging
    if (config.singleRun) {
        postLoaders.push({
            test: /\.jsx$/,
            exclude: /(__tests__|node_modules|legacy)\//,
            loader: 'istanbul-instrumenter'
        });
    }
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

    reporters: [ 'dots', 'coverage', 'coveralls' ],

    junitReporter: {
      outputDir: './web/target/karma-tests-results',
      suite: ''
    },

    coverageReporter: {
      dir: './coverage/',
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
        { type: 'lcovonly', subdir: '.' }
      ]
  },

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          { test: /\.jsx$/, loader: 'babel-loader' }
        ],
        postLoaders: postLoaders
      },
      resolve: {
          extensions: ['', '.js', '.json', '.jsx']
      }
    },

    webpackServer: {
      noInfo: true
    }

  });
};
