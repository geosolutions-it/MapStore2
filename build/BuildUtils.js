/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const DefinePlugin = require("webpack/lib/DefinePlugin");
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');

const gitRevPlugin = new GitRevisionPlugin({
    branchCommand: 'log -n1 --format=format:"Message: %s%nCommit: %H%nDate: %aD%nAuthor: %an"'
});
let pluginOptions;
console.log('======Getting version metadata ======');
pluginOptions;
try {
    pluginOptions = {
        __COMMITHASH__: JSON.stringify(gitRevPlugin.commithash()),
        __COMMIT_DATA__: JSON.stringify(gitRevPlugin.branch())
    };
    console.log(pluginOptions);
} catch (e) {
    console.error('Error getting version metadata. Using default values.');
    console.error('Setting default commit hash');
    pluginOptions = {
        __COMMITHASH__: '"Not a git repository"',
        __COMMIT_DATA__: '"Not a git repository"'
    };
}
console.log('======End getting version metadata ======');
const VERSION_INFO_DEFINE_PLUGIN = new DefinePlugin(pluginOptions);


module.exports = {
    VERSION_INFO_DEFINE_PLUGIN
};
