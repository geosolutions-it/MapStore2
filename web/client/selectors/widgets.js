const {get, isEqualWith} = require('lodash');
const {mapSelector} = require('./map');
const {getSelectedLayer} = require('./layers');
const {DEFAULT_TARGET} = require('../actions/widgets');
const {defaultMemoize, createSelector, createSelectorCreator} = require('reselect');

const isShallowEqual = (el1, el2) => {
    if (Array.isArray(el1) && Array.isArray(el2)) {
        return el1 === el2 || el1.reduce((acc, curr, i) => acc && curr === el2[i], true);
    }
    return el1 === el2;
};

const createShallowSelector = createSelectorCreator(
  defaultMemoize,
  (a, b) => isEqualWith(a, b, isShallowEqual)
);
const getEditorSettings = state => get(state, "widgets.builder.settings");
const getDependenciesMap = s => get(s, "widgets.dependencies") || {};
const getDependenciesKeys = s => Object.keys(getDependenciesMap(s)).map(k => getDependenciesMap(s)[k]);
const getEditingWidget = state => get(state, "widgets.builder.editor");
module.exports = {
    getFloatingWidgets: state => get(state, `widgets.containers[${DEFAULT_TARGET}].widgets`),
    getFloatingWidgetsLayout: state => get(state, `widgets.containers[${DEFAULT_TARGET}].layouts`),
    getEditingWidget,
    getEditingWidgetFilter: state => get(getEditingWidget(state), "filter"),
    getEditorSettings,
    getWidgetLayer: createSelector(
        getEditingWidget,
        getSelectedLayer,
        ({layer} = {}, selectedLayer) => layer || selectedLayer
    ),
    dependenciesSelector: createShallowSelector(
        getDependenciesMap,
        getDependenciesKeys,
        // produces the array of values of the keys in getDependenciesKeys
        state => getDependenciesKeys(state).map(k => k.indexOf("map." === 0) ? get(mapSelector(state), k.slice(4)) : get(state, k) ),
        (map, keys, values) => keys.reduce((acc, k, i) => ({
            ...acc,
            [Object.keys(map)[i]]: values[i]
        }), {})
    )
};
