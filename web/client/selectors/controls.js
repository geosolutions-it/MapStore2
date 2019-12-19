const {get} = require('lodash');
const createControlVariableSelector = (name, attribute) => state => get(state, `controls[${name}][${attribute}]`);
const createControlEnabledSelector = name => createControlVariableSelector(name, 'enabled');


/**
 * selects the showCoordinateEditor flag from state
 * @memberof selectors.controls
 * @param  {object} state the state
 * @return {boolean} the showCoordinateEditor in the state
 */
const showCoordinateEditorSelector = (state) => get(state, "controls.measure.showCoordinateEditor");

module.exports = {
    createControlEnabledSelector,
    createControlVariableSelector,
    showCoordinateEditorSelector,
    measureSelector: (state) => get(state, "controls.measure.enabled"),
    queryPanelSelector: (state) => get(state, "controls.queryPanel.enabled"),
    printSelector: (state) => get(state, "controls.print.enabled"),
    wfsDownloadAvailable: state => !!get(state, "controls.wfsdownload.available"),
    wfsDownloadSelector: state => !!get(state, "controls.wfsdownload.enabled"),
    widgetBuilderAvailable: state => get(state, "controls.widgetBuilder.available", false),
    widgetBuilderSelector: (state) => get(state, "controls.widgetBuilder.enabled"),
    initialSettingsSelector: state => get(state, "controls.layersettings.initialSettings") || {},
    originalSettingsSelector: state => get(state, "controls.layersettings.originalSettings") || {},
    activeTabSettingsSelector: state => get(state, "controls.layersettings.activeTab") || 'general',
    drawerEnabledControlSelector: (state) => get(state, "controls.drawer.enabled", false),
    unsavedMapSelector: (state) => get(state, "controls.unsavedMap.enabled", false),
    unsavedMapSourceSelector: (state) => get(state, "controls.unsavedMap.source", "")
};
