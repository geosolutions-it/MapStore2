const LOAD_PLUGINS = 'LOAD_PLUGINS';

function loadPlugins(plugins) {
    return {
        type: LOAD_PLUGINS,
        plugins
    };
}
module.exports = {LOAD_PLUGINS, loadPlugins};
