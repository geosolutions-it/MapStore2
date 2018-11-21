const Rx = require('rxjs');
const { get, isEqual, omit } = require('lodash');
const { EXPORT_CSV, EXPORT_IMAGE, INSERT, TOGGLE_CONNECTION, WIDGET_SELECTED, EDITOR_SETTING_CHANGE,
    onEditorChange, clearWidgets, loadDependencies, toggleDependencySelector, DEPENDENCY_SELECTOR_KEY, WIDGETS_REGEX} = require('../actions/widgets');
const {
    MAP_CONFIG_LOADED
} = require('../actions/config');
const { availableDependenciesSelector, isWidgetSelectionActive, getDependencySelectorConfig } = require('../selectors/widgets');
const { pathnameSelector } = require('../selectors/routing');
const { MAP_CREATED, SAVING_MAP, MAP_ERROR } = require('../actions/maps');
const { DASHBOARD_LOADED } = require('../actions/dashboard');
const {LOCATION_CHANGE} = require('react-router-redux');
const {saveAs} = require('file-saver');
const FileUtils = require('../utils/FileUtils');
const converter = require('json-2-csv');
const canvg = require('canvg-browser');
const updateDependencyMap = (active, id, { dependenciesMap, mappings}) => {
    const overrides = Object.keys(mappings).filter(k => mappings[k] !== undefined).reduce( (ov, k) => ({
        ...ov,
        [k]: id === "map" ? mappings[k] : `${id}.${mappings[k]}`
    }), {});
    return active
        ? { ...dependenciesMap, ...overrides}
        : omit(dependenciesMap, [Object.keys(mappings)]);
};

const outerHTML = (node) => {
    const parent = document.createElement('div');
    parent.appendChild(node.cloneNode(true));
    return parent.innerHTML;
};
/**
 * Disables action emissions on the stream between SAVING_MAP and MAP_CREATED or MAP_ERROR events.
 * This is needed to avoid widget clear when LOCATION_CHANGE because of a map save.
 */
const getValidLocationChange = action$ =>
    action$.ofType(SAVING_MAP, MAP_CREATED, MAP_ERROR)
        .startWith({type: MAP_CONFIG_LOADED}) // just dummy action to trigger the first switchMap
        .switchMap(action => action.type === SAVING_MAP ? Rx.Observable.never() : action$)
        .filter(({type} = {}) => type === LOCATION_CHANGE);
/**
 * Action flow to add/Removes dependencies for a widgets.
 * Trigger `mapSync` property of a widget and sets `dependenciesMap` object to map `dependency` prop onto widget props.
 * For instance if
 *  - `active = true`
 *  - `mappings` option is `{a: "b"}
 *  - `dependency = "x"`
 * then you will have dependencyMap set to : {a: "x.b"}.
 * It manages also special dependency "map" where mappings are applied directly (center...) .
 * If active = false the dependencies will be removed from dependencyMap.
 *
 * @param {boolean} active true if the connection must be activated
 * @param {string} dependency the dependency element id to add
 * @param {object} options dependency mapping options. Must contain `mappings` object
 */
const configureDependency = (active, dependency, options) =>
    Rx.Observable.of(
        onEditorChange("mapSync", active),
        onEditorChange('dependenciesMap',
            updateDependencyMap(active, dependency, options)
        )
    );
module.exports = {
    exportWidgetData: action$ =>
        action$.ofType(EXPORT_CSV)
            .do( ({data = [], title = "data"}) =>
                converter.json2csv(data, (err, csv) => err ? null : saveAs(new Blob([
                    csv
                ], {type: "text/csv"}), title + ".csv")))
            .filter( () => false),
    /**
     * Intercepts changes to widgets to catch widgets that can share some dependencies.
     * Then re-configures the dependencies to it.
     */
    alignDependenciesToWidgets: (action$, { getState = () => { } } = {}) =>
        action$.ofType(MAP_CONFIG_LOADED, DASHBOARD_LOADED, INSERT)
        .map(() => availableDependenciesSelector(getState()))
        .pluck('availableDependencies')
        .distinctUntilChanged( (oldMaps = [], newMaps = []) => isEqual([...oldMaps], [...newMaps]))
        // add dependencies for all map widgets (for the moment the only ones that shares dependencies)
        // and for main "map" dependency, the "viewport" and "center"
        .map((maps=[]) => loadDependencies(maps.reduce( (deps, m) => ({
            ...deps,
            [m === "map" ? "viewport" : `${m}.viewport`]: `${m}.bbox`, // {viewport: "map.bbox"} or {"widgets[ID_W].viewport": "widgets[ID_W].bbox"}
            [m === "map" ? "center" : `${m}.center`]: `${m}.center`, // {center: "map.center"} or {"widgets[ID_W].center": "widgets[ID_W].center"}
            [m === "map" ? "zoom" : `${m}.zoom`]: `${m}.zoom`,
            [m === "map" ? "layers" : `${m}.layers`]: m === "map" ? `layers.flat` : `${m}.layers`
        }), {}))
    ),
    /**
     * Toggles the dependencies setup and widget selection for dependencies
     * (if more than one widget is available for connection)
     */
    toggleWidgetConnectFlow: (action$, {getState = () => {}} = {}) =>
        action$.ofType(TOGGLE_CONNECTION).switchMap(({ active, availableDependencies = [], options}) =>
            (active && availableDependencies.length > 0)
                // activate flow
                ? availableDependencies.length === 1
                    // case singleMap
                    // In future may be necessary to pass active prop, if different from mapSync, in options object
                    // also if connection is triggered for a different target (widget not in editing) we should change actions to trigger (onChange instead of onEditorChange)
                    ? configureDependency(active, availableDependencies[0], options)
                    // case of multiple map
                    : Rx.Observable.of(toggleDependencySelector(active, {
                            availableDependencies
                        })
                        ).merge(
                            action$.ofType(WIDGET_SELECTED)
                                .filter(() => isWidgetSelectionActive(getState()))
                                .switchMap(({ widget }) => {
                                    const ad = get(getDependencySelectorConfig(getState()), 'availableDependencies');
                                    const deps = ad.filter(d => (WIDGETS_REGEX.exec(d) || [])[1] === widget.id);
                                    return configureDependency(active, deps[0], options).concat(Rx.Observable.of(toggleDependencySelector(false, {})));
                                }).takeUntil(
                                    action$.ofType(LOCATION_CHANGE)
                                    .merge(action$.filter(({ type, key } = {}) => type === EDITOR_SETTING_CHANGE && key === DEPENDENCY_SELECTOR_KEY))
                                )
                        )

                // deactivate flow
                : configureDependency(active, availableDependencies[0], options)
        ),

    clearWidgetsOnLocationChange: (action$, {getState = () => {}} = {}) =>
        action$.ofType(MAP_CONFIG_LOADED).switchMap( () => {
            const location = pathnameSelector(getState()).split('/');
            const loctionDifference = location[location.length - 1];
            return action$.let(getValidLocationChange)
                .filter( () => {
                    const newLocation = pathnameSelector(getState()).split('/');
                    const newLocationDifference = newLocation[newLocation.length - 1];
                    return newLocationDifference !== loctionDifference;
                }).switchMap( ({payload = {}} = {}) => {
                    if (payload && payload.pathname) {
                        return Rx.Observable.of(clearWidgets());
                    }
                    return Rx.Observable.empty();
                });
        }),
    exportWidgetImage: action$ =>
        action$.ofType(EXPORT_IMAGE)
            .do( ({widgetDivId, title = "data"}) => {
                let canvas = document.createElement('canvas');
                const svg = document.querySelector(`#${widgetDivId} .recharts-wrapper svg`);
                const svgString = svg.outerHTML ? svg.outerHTML : outerHTML(svg);
                // svgOffsetX = svgOffsetX ? svgOffsetX : 0;
                // svgOffsetY = svgOffsetY ? svgOffsetY : 0;
                // svgCanv.setAttribute("width", Number.parseFloat(svgW) + left);
                // svgCanv.setAttribute("height", svgH);
                canvg(canvas, svgString, {
                    renderCallback: () => {
                        const context = canvas.getContext("2d");
                        context.globalCompositeOperation = "destination-over";
                        // set background color
                        context.fillStyle = '#fff'; // <- background color
                        // draw background / rect on entire canvas
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        FileUtils.downloadCanvasDataURL(canvas.toDataURL('image/jpeg', 1.0), `${title}.jpg`, "image/jpeg");
                    }
                });
            })
            .filter( () => false)
};
