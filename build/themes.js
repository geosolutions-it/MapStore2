const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var path = require("path");
const glob = require('glob');
const extractThemesPlugin = new MiniCssExtractPlugin({
    filename: '[name].css'
});


const themeEntries = (() => {
    const globPath = path.join(__dirname, "..", "web", "client", "themes", "*");
    var files = glob.sync(globPath, {mark: true});
    return files.filter((f) => f.lastIndexOf('/') === f.length - 1).reduce((res, curr) => {
        var finalRes = res || {};
        var themeName = path.basename(curr, path.extname(curr));
        finalRes["themes/" + themeName] = path.join(__dirname, "..", "web", "client", "themes", `${themeName}`, "theme.less");
        return finalRes;
    }, {});

})();
module.exports = {
    themeEntries,
    extractThemesPlugin
};
