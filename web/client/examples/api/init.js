/*eslint-disable */
function init() {
/*eslint-enable */
    var cfg;
    var embeddedPlugins;
    var pluginsCfg;

    /*eslint-disable */
    cfg = MapStore2.loadConfigFromStorage('mapstore.example.plugins.' + MapStore2.getMapNameFromRequest());
    /*eslint-enable */
    embeddedPlugins = {
        "desktop": [
            "Map",
            "MousePosition",
            "Toolbar",
            "ZoomAll",
            "Expander",
            "ZoomIn",
            "ZoomOut",
            "ScaleBox",
            "OmniBar",
            "Search",
            "DrawerMenu",
            "TOC",
            "BackgroundSwitcher",
            "Identify"
      ]};
    /*eslint-disable */
    pluginsCfg = cfg && MapStore2.buildPluginsCfg(cfg.pluginsCfg.standard, cfg.userCfg) || embeddedPlugins;
    MapStore2.create('container', {
    /*eslint-enable */
        plugins: pluginsCfg,
        initialState: cfg && cfg.state && {
            defaultState: cfg.state
        } || null,
        style: cfg && cfg.customStyle,
        theme: {
            path: '../../dist/themes'
        }
    });
}
