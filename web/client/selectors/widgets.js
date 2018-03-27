const {get, find, isEqualWith} = require('lodash');
const {mapSelector} = require('./map');
const {getSelectedLayer} = require('./layers');
const {DEFAULT_TARGET} = require('../actions/widgets');
const WIDGETS_REGEX = /^widgets\["?([^"\]]*)"?\]\.?(.*)$/;
const {isDashboardAvailable, isDashboardEditing} = require('./dashboard');
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
const getWidgetLayer = createSelector(
    getEditingWidget,
    getSelectedLayer,
    state => isDashboardAvailable(state) && isDashboardEditing(state),
    ({layer} = {}, selectedLayer, dashboardEditing) => layer || !dashboardEditing && selectedLayer
);
const getWidgetDependency = (k, widgets) => {
    const [match, id, rest] = WIDGETS_REGEX.exec(k);
    if (match) {
        const widget = find(widgets, { id });
        return rest
            ? get(widget, rest)
            : widget;
    }
};
const getFloatingWidgets = state => get(state, `widgets.containers[${DEFAULT_TARGET}].widgets`);
module.exports = {
    getFloatingWidgets,
    getFloatingWidgetsLayout: state => get(state, `widgets.containers[${DEFAULT_TARGET}].layouts`),
    // let's use the same container for the moment
    getDashboardWidgets: state => get(state, `widgets.containers[${DEFAULT_TARGET}].widgets`),
    getDashboardWidgetsLayout: state => get(state, `widgets.containers[${DEFAULT_TARGET}].layouts`),
    getEditingWidget,
    getEditingWidgetLayer: state => get(getEditingWidget(state), "layer"),
    getEditingWidgetFilter: state => get(getEditingWidget(state), "filter"),
    getEditorSettings,
    getWidgetLayer,
    getMapWidgets: state => (get(state, `widgets.containers[${DEFAULT_TARGET}].widgets`) || []).filter(({type} = {}) => type === "map"),
    dashBoardDependenciesSelector: () => ({}), // TODO dashboard dependencies
    /**
     * transforms dependencies in the form `{ k1: "path1", k1, "path2" }` into
     * a map like `{k1: v1, k2: v2}` where `v1 = get("path1, state)`.
     * Dependencies paths map comes from getDependenciesMap.
     * map.... is a special path that brings to the map of mapstore.
     */
    dependenciesSelector: createShallowSelector(
        getDependenciesMap,
        getDependenciesKeys,
        // produces the array of values of the keys in getDependenciesKeys
        state => getDependenciesKeys(state).map(k =>
            k.indexOf("map.") === 0
            ? get(mapSelector(state), k.slice(4))
            : k.match(WIDGETS_REGEX) === 0
            ? getWidgetDependency(k, getFloatingWidgets(state))
            : get(state, k) ),
        // iterate the dependencies keys to set the dependencies values in a map
        (map, keys, values) => keys.reduce((acc, k, i) => ({
            ...acc,
            [Object.keys(map)[i]]: values[i]
        }), {})
    )
};
