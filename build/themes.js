const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const extractThemesPlugin = new MiniCssExtractPlugin({
    filename: '[name].css'
});

const { readdirSync } = require("fs");
const path = require("path");

const themeEntries = (() => {
    const entries = {};

    const dirPath = path.join(__dirname, "..", "web", "client", "themes");
    readdirSync(dirPath, { withFileTypes: true }).filter(entry => entry.isDirectory()).forEach(entry => {
        entries[`themes/${entry.name}`] = path.join(dirPath, entry.name, "theme.less");
    });
    return entries;
})();
module.exports = {
    themeEntries,
    extractThemesPlugin
};
