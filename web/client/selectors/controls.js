const {get} = require('lodash');

module.exports = {
    queryPanelSelector: (state) => get(state, "controls.queryPanel.enabled"),
    widgetBulderSelector: (state) => get(state, "controls.widgetBulder.enabled")
};
