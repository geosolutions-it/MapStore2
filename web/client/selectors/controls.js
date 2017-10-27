const {get} = require('lodash');

module.exports = {
    queryPanelSelector: (state) => get(state, "controls.queryPanel.enabled"),
    widgetBuilderAvailable: state => get(state, "controls.widgetBulder.available"),
    widgetBulderSelector: (state) => get(state, "controls.widgetBulder.enabled")
};
