const {get} = require('lodash');

module.exports = {
    queryPanelSelector: (state) => get(state, "controls.queryPanel.enabled"),
    wfsDownloadAvailable: state => !!get(state, "controls.wfsdownload.available"),
    widgetBuilderAvailable: state => get(state, "controls.widgetBuilder.available"),
    widgetBuilderSelector: (state) => get(state, "controls.widgetBuilder.enabled")
};
