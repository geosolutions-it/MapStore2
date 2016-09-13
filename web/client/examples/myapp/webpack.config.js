var path = require("path");

module.exports = {
    entry: {
        myapp: path.join(__dirname, "app")
    },
    output: {
      path: path.join(__dirname, "dist"),
        publicPath: "/dist/",
        filename: "myapp.js"
    },
    resolve: {
      extensions: ["", ".js", ".jsx"]
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, loader: "babel-loader", exclude: /node_modules/ }
        ]
    },
    devtool: 'inline-source-map',
    debug: true
};
