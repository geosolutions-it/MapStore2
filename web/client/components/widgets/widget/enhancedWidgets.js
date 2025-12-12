import { compose } from 'recompose';

// enhancers for base menus and functionalities
import chartWidget, { chartWidgetProps } from '../enhancers/chartWidget';
import counterWidget from '../enhancers/counterWidget';
import tableWidget from '../enhancers/tableWidget';
import legendWidget from '../enhancers/legendWidget';
import textWidget from '../enhancers/textWidget';
import mapWidget from '../enhancers/mapWidget';

// Enhancers for ajax support
import multiProtocolChart from '../enhancers/multiProtocolChart';
import wpsCounter from '../enhancers/wpsCounter';
import wfsTable from '../enhancers/wfsTable';


// enhancers for dependencies management
import dependenciesToFilter from '../enhancers/dependenciesToFilter';
import dependenciesToOptions from '../enhancers/dependenciesToOptions';
import dependenciesToWidget from '../enhancers/dependenciesToWidget';
import dependenciesToExtent from '../enhancers/dependenciesToExtent';
import dependenciesToLayers from '../enhancers/dependenciesToLayers';
import dependenciesToMapProp from '../enhancers/dependenciesToMapProp';


import BaseChartWidget from './ChartWidget';
import BaseTextWidget from './TextWidget';
import BaseMapWidget from './MapWidget';
import BaseTableWidget from './TableWidget';
import BaseCounterWidget from './CounterWidget';
import BaseLegendWidget from './LegendWidget';
import dependenciesToShapes from '../enhancers/dependenciesToShapes';

//
// connect widgets to dependencies, remote services and add base icons/tools
//

/**
 * Chart widget with automatic data fetch, dependency management and all base enhancers. mapSync and dependencies are mapped to the needed props. Adds to the Base component the following props.
 * @prop {object} dependencies values for dependenciesMap.
 * @prop {object} dependenciesMap a map of dependencies that provides the needed props to the widget
 * @prop {boolean} mapSync if true, this is in sync with a map
 * @prop {string} geomProp the geometry, required to generate spatial filter
 * @prop {object} layer The layer object where to perform the requests
 * @prop {object} options for the backing service. E.g. for WPS `{groupByAttributes: "STATE_NAME", aggregationAttribute: "LAND_KM", aggregateFunction: "Sum"}`
 */
export const ChartWidget = compose(
    chartWidgetProps,
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    multiProtocolChart,
    chartWidget,
    dependenciesToShapes
)(BaseChartWidget);

/**
 * Basic text widget with the base menu.
 */
export const TextWidget = compose(
    textWidget
)(BaseTextWidget);

/**
 * Map widgets with dependencies management and all base enhancers. Adds to the base widget the following props.
 * @prop {object} dependencies values for dependenciesMap.
 * @prop {boolean} mapSync if true, this is in sync with a map
 * @prop {object} dependenciesMap a map of dependencies that provides the needed props to the widget
 * @prop {object} map the map to display, with layers, projection, bbox, center ....
 * @prop {object} options
 */
export const MapWidget = compose(
    dependenciesToWidget,
    dependenciesToLayers,
    dependenciesToMapProp('center'),
    dependenciesToMapProp('zoom'),
    dependenciesToExtent,
    mapWidget
)(BaseMapWidget);

/**
 * Table widgets with automatic data fetch, dependencies management and all base enhancers. Adds to the base component the following props.
 * @prop {object} dependencies values for dependenciesMap.
 * @prop {boolean} mapSync if true, this is in sync with a map
 * @prop {object} dependenciesMap a map of dependencies that provides the needed props to the widget
 * @prop {string} geomProp the geometry, required to generate spatial filter
 * @prop {object} layer The layer object where to perform the requests
 * @prop {object} options {groupByAttributes: "STATE_NAME", aggregationAttribute: "LAND_KM", aggregateFunction: "Sum"}
 */
export const TableWidget = compose(
    dependenciesToWidget,
    dependenciesToOptions,
    dependenciesToFilter,
    wfsTable,
    tableWidget
)(BaseTableWidget);

/**
 * Counter widget with automatic data fetch, dependency management and all base enhancers. Adds to the base component the following props.
 * @prop {object} dependencies values for dependenciesMap.
 * @prop {boolean} mapSync if true, this is in sync with a map
 * @prop {object} dependenciesMap a map of dependencies that provides the needed props to the widget
 * @prop {string} geomProp the geometry, required to generate spatial filter
 * @prop {object} layer The layer object where to perform the requests
 * @prop {object} options for the backing service. E.g. for WPS `{groupByAttributes: "STATE_NAME", aggregationAttribute: "LAND_KM", aggregateFunction: "Sum"}`
 */
export const CounterWidget = compose(
    dependenciesToWidget,
    dependenciesToFilter,
    dependenciesToOptions,
    wpsCounter,
    counterWidget
)(BaseCounterWidget);

/**
 * Legend widgets with dependencies management and all base enhancers. Adds to the base component the following props.
 * @prop {object} dependencies values for dependenciesMap.
 * @prop {object} dependenciesMap a map of dependencies that provides the needed props to the widget
 * @prop {object} env parameter for legend localization
 */
export const LegendWidget = compose(
    dependenciesToWidget,
    legendWidget
)(BaseLegendWidget);
