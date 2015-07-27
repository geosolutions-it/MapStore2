var path = require("path");

module.exports = {
    entry:  path.join(__dirname, "web", "examples" ,"viewer", "app"),
    output: {
    	path: path.join(__dirname, "web", "dist"),
        publicPath: "/dist/",
        filename: "viewer.js"
    },
    resolve: {
    	extensions: ["",".js",".jsx"]
    },
    module: {
        loaders: [
            { test: /\.jsx$/, loader: "babel-loader" }
        ]
    },
    devServer: {
    },
    devtool: "eval",
    debug: true
};