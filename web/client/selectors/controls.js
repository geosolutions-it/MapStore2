const {get} = require('lodash');

module.exports = {
    queryPanelSelector: (state) => get(state, "controls.queryPanel.enabled"),
    wfsDownloadAvailable: state => !!get(state, "controls.wfsdownload.available"),
    wfsDownloadSelector: state => !!get(state, "controls.wfsdownload.enabled"),
    widgetBuilderAvailable: state => get(state, "controls.widgetBuilder.available", false),
    widgetBuilderSelector: (state) => get(state, "controls.widgetBuilder.enabled")
};
