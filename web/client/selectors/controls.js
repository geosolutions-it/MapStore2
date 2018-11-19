const {get} = require('lodash');
const createControlVariableSelector = (name, attribute) => state => get(state, `controls[${name}][${attribute}]`);
const createControlEnabledSelector = name => createControlVariableSelector(name, 'enabled');

module.exports = {
    createControlEnabledSelector,
    createControlVariableSelector,
    queryPanelSelector: (state) => get(state, "controls.queryPanel.enabled"),
    measureSelector: (state) => get(state, "controls.measure.enabled"),
    wfsDownloadAvailable: state => !!get(state, "controls.wfsdownload.available"),
    wfsDownloadSelector: state => !!get(state, "controls.wfsdownload.enabled"),
    widgetBuilderAvailable: state => get(state, "controls.widgetBuilder.available", false),
    widgetBuilderSelector: (state) => get(state, "controls.widgetBuilder.enabled")
};
