const { get, castArray} = require('lodash');
const {mapSelector} = require('./map');
const {getSelectedLayer} = require('./layers');
const {DEFAULT_TARGET, DEPENDENCY_SELECTOR_KEY, WIDGETS_REGEX} = require('../actions/widgets');
const { getWidgetsGroups, getWidgetDependency} = require('../utils/WidgetsUtils');

const {isDashboardAvailable, isDashboardEditing} = require('./dashboard');
const { createSelector, createStructuredSelector} = require('reselect');
const { createShallowSelector } = require('../utils/ReselectUtils');

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

const getFloatingWidgets = state => get(state, `widgets.containers[${DEFAULT_TARGET}].widgets`);
const getCollapsedState = state => get(state, `widgets.containers[${DEFAULT_TARGET}].collapsed`);
const getVisibleFloatingWidgets = createSelector(
    getFloatingWidgets,
    getCollapsedState,
    (widgets, collapsed) => {
        if (widgets && collapsed) {
            return widgets.filter(({ id } = {}) => !collapsed[id]);
        }
        return widgets;
    }
);
const getCollapsedIds = createSelector(
    getCollapsedState,
    (collapsed = {}) => Object.keys(collapsed)
);
const getMapWidgets = state => (getFloatingWidgets(state) || []).filter(({ widgetType } = {}) => widgetType === "map");

/**
 * Find in the state the available dependencies to connect
 */
const availableDependenciesSelector = createSelector(
    getMapWidgets,
    mapSelector,
    (ws = [], map = []) => ({
        availableDependencies: ws.map(({id}) => `widgets[${id}].map`).concat(castArray(map).map(() => "map"))
    })
);
/**
 * returns if the dependency selector state
 * @param {object} state the state
 */
const getDependencySelectorConfig = state => get(getEditorSettings(state), `${DEPENDENCY_SELECTOR_KEY}`);
/**
 * Determines if the dependencySelector is active
 * @param {object} state the state
 */
const isWidgetSelectionActive = state => get(getDependencySelectorConfig(state), 'active');

const getWidgetsDependenciesGroups = createSelector(
    getFloatingWidgets,
    widgets => getWidgetsGroups(widgets)
);
const getFloatingWidgetsLayout = state => get(state, `widgets.containers[${DEFAULT_TARGET}].layouts`);
const getFloatingWidgetsCurrentLayout = state => get(state, `widgets.containers[${DEFAULT_TARGET}].layout`);

const getDashboardWidgets = state => get(state, `widgets.containers[${DEFAULT_TARGET}].widgets`);

const isTrayEnabled = state => get(state, "widgets.tray");

module.exports = {
    getFloatingWidgets,
    getVisibleFloatingWidgets,
    getCollapsedState,
    getCollapsedIds,
    getFloatingWidgetsLayout,
    getFloatingWidgetsCurrentLayout,
    // let's use the same container for the moment
    getDashboardWidgets,
    dashboardHasWidgets: state => (getDashboardWidgets(state) || []).length > 0,
    getDashboardWidgetsLayout: state => get(state, `widgets.containers[${DEFAULT_TARGET}].layouts`),
    getEditingWidget,
    getEditingWidgetLayer: state => get(getEditingWidget(state), "layer"),
    returnToFeatureGridSelector: (state) => get(state, "widgets.builder.editor.returnToFeatureGrid", false),
    getEditingWidgetFilter: state => get(getEditingWidget(state), "filter"),
    getEditorSettings,
    getWidgetLayer,
    getMapWidgets,
    availableDependenciesSelector,
    dashBoardDependenciesSelector: () => ({}), // TODO dashboard dependencies
    /**
     * transforms dependencies in the form `{ k1: "path1", k1, "path2" }` into
     * a map like `{k1: v1, k2: v2}` where `v1 = get("path1", state)`.
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
            : k.match(WIDGETS_REGEX)
            ? getWidgetDependency(k, getFloatingWidgets(state))
            : get(state, k) ),
        // iterate the dependencies keys to set the dependencies values in a map
        (map, keys, values) => keys.reduce((acc, k, i) => ({
            ...acc,
            [Object.keys(map)[i]]: values[i]
        }), {})
    ),
    isWidgetSelectionActive,
    getDependencySelectorConfig,
    getWidgetsDependenciesGroups,
    widgetsConfig: createStructuredSelector({
        widgets: getFloatingWidgets,
        layouts: getFloatingWidgetsLayout
    }),
    isTrayEnabled
};
