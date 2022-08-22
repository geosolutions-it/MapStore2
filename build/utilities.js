const DefinePlugin = require("webpack/lib/DefinePlugin");
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');

const gitRevPlugin = new GitRevisionPlugin({
    branchCommand: 'log -n1 --format=format:"Message: %s%nCommit: %H%nDate: %aD%nAuthor: %an"'
});

const VERSION_INFO_DEFINE_PLUGIN = new DefinePlugin({
    __COMMITHASH__: JSON.stringify(gitRevPlugin.commithash()),
    __COMMIT_DATA__: JSON.stringify(gitRevPlugin.branch())
});


module.exports = {
    VERSION_INFO_DEFINE_PLUGIN
};
