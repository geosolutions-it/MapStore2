const Rx = require('rxjs');
const { get, isEqual } = require('lodash');
const { EXPORT_CSV, EXPORT_IMAGE, INSERT, clearWidgets, loadDependencies} = require('../actions/widgets');
const {
    MAP_CONFIG_LOADED
} = require('../actions/config');
const { availableDependenciesSelector } = require('../selectors/widgets');
const { MAP_CREATED, SAVING_MAP, MAP_ERROR } = require('../actions/maps');
const {LOCATION_CHANGE} = require('react-router-redux');
const {saveAs} = require('file-saver');
const FileUtils = require('../utils/FileUtils');
const converter = require('json-2-csv');
const canvg = require('canvg-browser');

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
        action$.ofType(MAP_CONFIG_LOADED, INSERT)
        .map(() => availableDependenciesSelector(getState()))
        .pluck('availableDependencies')
        .distinctUntilChanged( (oldMaps = [], newMaps = []) => isEqual([...oldMaps], [...newMaps]))
        // add dependencies for all map widgets (for the moment the only ones that shares dependencies)
        // and for main "map" dependency, the "viewport" and "center"
        .map((maps=[]) => loadDependencies(maps.reduce( (deps, m) => ({
            ...deps,
            [m === "map" ? "viewport" : `${m}.viewport`]: `${m}.bbox`, // {viewport: "map.bbox"} or {"widgets[ID_W].viewport": "widgets[ID_W].bbox"}
            [m === "map" ? "center" : `${m}.center`]: `${m}.center`, // {center: "map.center"} or {"widgets[ID_W].center": "widgets[ID_W].center"}
            [m === "map" ? "zoom" : `${m}.zoom`]: `${m}.zoom`
        }), {}))
    ),
    clearWidgetsOnLocationChange: (action$, {getState = () => {}} = {}) =>
        action$.ofType(MAP_CONFIG_LOADED).switchMap( () => {
            const location = get(getState(), "routing.location");
            return action$.let(getValidLocationChange)
                .filter( () => {
                    const newLocation = get(getState(), "routing.location");
                    return newLocation !== location;
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
