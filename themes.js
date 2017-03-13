const ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require("path");
const glob = require('glob');
const extractThemesPlugin = new ExtractTextPlugin({
    filename: '[name].css',
    disable: process.env.NODE_ENV === "development"
});


const themeEntries = () => {
    const globPath = path.join(__dirname, "web", "client", "themes", "*");
    var files = glob.sync(globPath);
    return files.reduce((res, curr) => {
        var finalRes = res || {};
        finalRes["themes/" + path.basename(curr, path.extname(curr))] = `${curr}/theme.less`;
        return finalRes;
    }, {});

}();
module.exports = {
    themeEntries,
    extractThemesPlugin
};
