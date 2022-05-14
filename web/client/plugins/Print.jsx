/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './print/print.css';

import head from 'lodash/head';
import castArray from "lodash/castArray";
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { PanelGroup, Col, Glyphicon, Grid, Panel, Row } from 'react-bootstrap';
import { connect } from '../utils/PluginsUtils';
import { createSelector } from 'reselect';

import { setControlProperty, toggleControl } from '../actions/controls';
import { configurePrintMap, printError, printSubmit, printSubmitting, addPrintParameter } from '../actions/print';
import Message from '../components/I18N/Message';
import Dialog from '../components/misc/Dialog';
import printReducers from '../reducers/print';
import { printSpecificationSelector } from "../selectors/print";
import { layersSelector } from '../selectors/layers';
import { currentLocaleSelector } from '../selectors/locale';
import { mapSelector, scalesSelector } from '../selectors/map';
import { mapTypeSelector } from '../selectors/maptype';
import { normalizeSRS, reprojectBbox } from '../utils/CoordinatesUtils';
import { getMessageById } from '../utils/LocaleUtils';
import { defaultGetZoomForExtent, getResolutions, mapUpdated, dpi2dpu, DEFAULT_SCREEN_DPI } from '../utils/MapUtils';
import { isInsideResolutionsLimits } from '../utils/LayersUtils';
import { has, includes } from 'lodash';
import {additionalLayersSelector} from "../selectors/additionallayers";

/**
 * Print plugin. This plugin allows to print current map view. **note**: this plugin requires the  **printing module** to work.
 * Please look at mapstore documentation about how to add and configure the printing module in your installation.
 *
 * It also works as a container for other plugins, usable to customize the UI of the parameters dialog.
 *
 * The UI supports different targets for adding new plugins:
 *  - `left-panel` (controls/widgets to be added to the left column, before the accordion)
 *  - `left-panel-accordion` (controls/widgets to be added to the left column, as subpanels of the accordion)
 *  - `right-panel` (controls/widgets to be added to the right column, before the buttons bar)
 *  - `buttons` (controls/widgets to be added to the right column, in the buttons bar)
 *  - `preview-panel` (controls/widgets to be added to the printed pdf preview panel)
 *
 * In addition it is also possibile to use specific targets that override a standard widget, to replace it
 * with a custom one. They are (in order, from left to right and top to bottom in the UI):
 *  - `name` (`left-panel`, `position`: `1`)
 *  - `description` (`left-panel`, `position`: `2`)
 *  - `outputFormat` (`left-panel`, `position`: `3`)
 *  - `projection` (`left-panel`, `position`: `4`)
 *  - `layout` (`left-panel-accordion`, `position`: `1`)
 *  - `legend-options` (`left-panel-accordion`, `position`: `2`)
 *  - `resolution` (`right-panel`, `position`: `1`)
 *  - `map-preview` (`right-panel`, `position`: `2`)
 *  - `default-background-ignore` (`right-panel`, `position`: `3`)
 *  - `submit` (`buttons`, `position`: `1`)
 *  - `print-preview` (`preview-panel`, `position`: `1`)
 *
 * To remove a widget, you have to include a Null plugin with the desired target.
 * You can use the position to sort existing and custom items.
 *
 * Standard widgets can be configured by providing an options object as a configuration property
 * of this (Print) plugin. The options object of a widget is named `<widget_id>Options`
 * (e.g. `outputFormatOptions`).
 *
 * You can customize Print plugin by creating one custom plugin (or more) that modifies the existing
 * components with your own ones. You can configure this plugin in `localConfig.json` as usual.
 *
 * It delegates to a printingService the creation of the final print. The default printingService
 * implements a mapfish-print v2 compatible workflow. It is possible to override the printingService to
 * use, via a specific property (printingService).
 *
 * It is also possible to customize the payload of the spec sent to the mapfish-print engine, by
 * adding new transformers to the default chain.
 *
 * Each transformer is a function that can add / replace / remove fragments from the JSON payload.
 *
 * @class Print
 * @memberof plugins
 * @static
 *
 * @prop {boolean} cfg.useFixedScales if true the printing scale is constrained to the nearest scale of the ones configured
 * in the config.yml file, if false the current scale is used
 * @prop {object} cfg.overrideOptions overrides print options, this will override options created from current state of map
 * @prop {boolean} cfg.overrideOptions.geodetic prints in geodetic mode: in geodetic mode scale calculation is more precise on
 * printed maps, but the preview is not accurate
 * @prop {string} cfg.overrideOptions.outputFilename name of output file
 * @prop {object} cfg.mapPreviewOptions options for the map preview tool
 * @prop {string[]} cfg.ignoreLayers list of layer types to ignore in preview and when printing, default ["google", "bing"]
 * @prop {boolean} cfg.mapPreviewOptions.enableScalebox if true a combobox to select the printing scale is shown over the preview
 * this is particularly useful if useFixedScales is also true, to show the real printing scales
 * @prop {boolean} cfg.mapPreviewOptions.enableRefresh true by default, if false the preview is not updated if the user pans or zooms the main map
 *
 * @example
 * // printing in geodetic mode
 * {
 *   "name": "Print",
 *   "cfg": {
 *       "overrideOptions": {
 *          "geodetic": true
 *       }
 *    }
 * }
 *
 * @example
 * // Using a list of fixed scales with scale selector
 * {
 *   "name": "Print",
 *   "cfg": {
 *       "ignoreLayers": ["google", "bing"],
 *       "useFixedScales": true,
 *       "mapPreviewOptions": {
 *          "enableScalebox": true
 *       }
 *    }
 * }
 *
 * @example
 * // restrict allowed output formats
 * {
 *   "name": "Print",
 *   "cfg": {
 *       "outputFormatOptions": {
 *          "allowedFormats": [{"name": "PDF", "value": "pdf"}, {"name": "PNG", "value": "png"}]
 *       }
 *    }
 * }
 *
 * @example
 * // enable custom projections for printing
 * "projectionDefs": [{
 *    "code": "EPSG:23032",
 *    "def": "+proj=utm +zone=32 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs",
 *    "extent": [-1206118.71, 4021309.92, 1295389.0, 8051813.28],
 *    "worldExtent": [-9.56, 34.88, 31.59, 71.21]
 * }]
 * ...
 * {
 *   "name": "Print",
 *   "cfg": {
 *       "projectionOptions": {
 *          "projections": [{"name": "UTM32N", "value": "EPSG:23032"}, {"name": "EPSG:3857", "value": "EPSG:3857"}, {"name": "EPSG:4326", "value": "EPSG:4326"}]
 *       }
 *    }
 * }
 *
 * @example
 * // customize the printing UI via plugin(s)
 * import React from "react";
 * import {createPlugin} from "../../utils/PluginsUtils";
 * import { connect } from "react-redux";
 *
 * const MyCustomPanel = () => <div>Hello, I am a custom component</div>;
 *
 * const MyCustomLayout = ({sheet}) => <div>Hello, I am a custom layout, the sheet is {sheet}</div>;
 * const MyConnectedCustomLayout = connect((state) => ({sheet: state.print?.spec.sheet}))(MyCustomLayout);
 *
 * export default createPlugin('PrintCustomizations', {
 *     component: () => null,
 *     containers: {
 *         Print: [
 *             // this entry add a panel between title and description
 *             {
 *                 target: "left-panel",
 *                 position: 1.5,
 *                 component: MyCustomPanel
 *             },
 *             // this entry replaces the layout panel
 *             {
 *                 target: "layout",
 *                 component: MyConnectedCustomLayout,
 *                 title: "MyLayout"
 *             },
 *             // To remove one component, simply create a component that returns null.
 *             {
 *                 target: "map-preview",
 *                 component: () => null
 *             }
 *         ]
 *     }
 * });
 * @example
 * // adds a transformer to the printingService chain
 * import {addTransformer} from "@js/utils/PrintUtils";
 *
 * addTransformer("mytranform", (state, spec) => Promise.resolve({
 *      ...spec,
 *      custom: "some value"
 * }));
 */

function overrideItem(item, overrides = []) {
    const replacement = overrides.find(i => i.target === item.id);
    return replacement ?? item;
}

const EmptyComponent = () => {
    return null;
};

function handleRemoved(item) {
    return item.plugin ? item : {
        ...item,
        plugin: EmptyComponent
    };
}

function mergeItems(standard, overrides) {
    return standard
        .map(item => overrideItem(item, overrides))
        .map(handleRemoved);
}

export default {
    PrintPlugin: assign({
        loadPlugin: (resolve) => {
            require.ensure('./print/index', () => {
                const {
                    standardItems
                } = require('./print/index').default;

                const {
                    getDefaultPrintingService,
                    getLayoutName,
                    getPrintScales,
                    getNearestZoom
                } = require('../utils/PrintUtils');


                class Print extends React.Component {
                    static propTypes = {
                        map: PropTypes.object,
                        layers: PropTypes.array,
                        capabilities: PropTypes.object,
                        printSpec: PropTypes.object,
                        printSpecTemplate: PropTypes.object,
                        withContainer: PropTypes.bool,
                        withPanelAsContainer: PropTypes.bool,
                        open: PropTypes.bool,
                        pdfUrl: PropTypes.string,
                        title: PropTypes.string,
                        style: PropTypes.object,
                        mapWidth: PropTypes.number,
                        mapType: PropTypes.string,
                        alternatives: PropTypes.array,
                        toggleControl: PropTypes.func,
                        onBeforePrint: PropTypes.func,
                        setPage: PropTypes.func,
                        onPrint: PropTypes.func,
                        printError: PropTypes.func,
                        configurePrintMap: PropTypes.func,
                        getLayoutName: PropTypes.func,
                        error: PropTypes.string,
                        getZoomForExtent: PropTypes.func,
                        minZoom: PropTypes.number,
                        maxZoom: PropTypes.number,
                        usePreview: PropTypes.bool,
                        mapPreviewOptions: PropTypes.object,
                        syncMapPreview: PropTypes.bool,
                        useFixedScales: PropTypes.bool,
                        scales: PropTypes.array,
                        ignoreLayers: PropTypes.array,
                        defaultBackground: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
                        closeGlyph: PropTypes.string,
                        submitConfig: PropTypes.object,
                        previewOptions: PropTypes.object,
                        currentLocale: PropTypes.string,
                        overrideOptions: PropTypes.object,
                        items: PropTypes.array,
                        addPrintParameter: PropTypes.func,
                        printingService: PropTypes.object
                    };

                    static contextTypes = {
                        messages: PropTypes.object,
                        plugins: PropTypes.object,
                        loadedPlugins: PropTypes.object
                    };

                    static defaultProps = {
                        withContainer: true,
                        withPanelAsContainer: false,
                        title: 'print.paneltitle',
                        toggleControl: () => {},
                        onBeforePrint: () => {},
                        setPage: () => {},
                        onPrint: () => {},
                        configurePrintMap: () => {},
                        printSpecTemplate: {},
                        getLayoutName: getLayoutName,
                        getZoomForExtent: defaultGetZoomForExtent,
                        pdfUrl: null,
                        mapWidth: 370,
                        mapType: "leaflet",
                        minZoom: 1,
                        maxZoom: 23,
                        usePreview: true,
                        mapPreviewOptions: {
                            enableScalebox: false,
                            enableRefresh: false
                        },
                        syncMapPreview: true,
                        useFixedScales: false,
                        scales: [],
                        ignoreLayers: ["google", "bing"],
                        defaultBackground: ["osm", "wms", "empty"],
                        closeGlyph: "1-close",
                        submitConfig: {
                            buttonConfig: {
                                bsSize: "small",
                                bsStyle: "primary"
                            },
                            glyph: ""
                        },
                        previewOptions: {
                            buttonStyle: "primary"
                        },
                        style: {},
                        currentLocale: 'en-US',
                        overrideOptions: {},
                        items: [],
                        printingService: getDefaultPrintingService()
                    };

                    state = {
                        activeAccordionPanel: 0
                    }

                    UNSAFE_componentWillMount() {
                        this.configurePrintMap();
                    }

                    UNSAFE_componentWillReceiveProps(nextProps) {
                        const hasBeenOpened = nextProps.open && !this.props.open;
                        const mapHasChanged = this.props.open && this.props.syncMapPreview && mapUpdated(this.props.map, nextProps.map);
                        const specHasChanged = (
                            nextProps.printSpec.defaultBackground !== this.props.printSpec.defaultBackground ||
                                nextProps.printSpec.additionalLayers !== this.props.printSpec.additionalLayers
                        );
                        if (hasBeenOpened || mapHasChanged || specHasChanged) {
                            this.configurePrintMap(nextProps);
                        }
                    }

                    getAlternativeBackground = (layers, defaultBackground, projection) => {
                        const allowedBackground = head(castArray(defaultBackground).map(type => ({
                            type
                        })).filter(l => this.isAllowed(l, projection)));
                        if (allowedBackground) {
                            return head(layers.filter(l => l.type === allowedBackground.type));
                        }
                        return null;
                    };

                    getItems = (target) => {
                        const filtered = this.props.items.filter(i => !target || i.target === target);
                        const merged = mergeItems(standardItems[target], this.props.items)
                            .map(item => ({
                                ...item,
                                target
                            }));
                        return [...merged, ...filtered]
                            .sort((i1, i2) => (i1.position ?? 0) - (i2.position ?? 0));
                    };
                    getMapConfiguration = () => {
                        const map = this.props.printingService.getMapConfiguration();
                        return {
                            ...map,
                            layers: this.filterLayers(map.layers, map.zoom, map.projection)
                        };
                    };
                    getMapSize = (layout) => {
                        const currentLayout = layout || this.getLayout();
                        return {
                            width: this.props.mapWidth,
                            height: currentLayout && currentLayout.map.height / currentLayout.map.width * this.props.mapWidth || 270
                        };
                    };
                    getPreviewZoom = (mapZoom) => {
                        if (this.props.useFixedScales) {
                            const scales = getPrintScales(this.props.capabilities);
                            return getNearestZoom(mapZoom, scales);
                        }
                        return mapZoom;
                    };
                    getPreviewResolution = (zoom, projection) => {
                        const dpu = dpi2dpu(DEFAULT_SCREEN_DPI, projection);
                        const scale = this.props.scales[this.getPreviewZoom(zoom)];
                        return scale / dpu;
                    };
                    getLayout = (props) => {
                        const { getLayoutName: getLayoutNameProp, printSpec, capabilities } = props || this.props;
                        const layoutName = getLayoutNameProp(printSpec);
                        return head(capabilities.layouts.filter((l) => l.name === layoutName));
                    };

                    renderWarning = (layout) => {
                        if (!layout) {
                            return <Row><Col xs={12}><div className="print-warning"><span><Message msgId="print.layoutWarning"/></span></div></Col></Row>;
                        }
                        return null;
                    };
                    renderItem = (item, opts) => {
                        const {validations, ...options } = opts;
                        const Comp = item.component ?? item.plugin;
                        const {style, ...other} = this.props;
                        const itemOptions = this.props[item.id + "Options"];
                        return <Comp role="body" {...other} {...item.cfg} {...options} {...itemOptions} validation={validations?.[item.id ?? item.name]}/>;
                    };
                    renderItems = (target, options) => {
                        return this.getItems(target)
                            .map(item => this.renderItem(item, options));
                    };
                    renderAccordion = (target, options) => {
                        const items = this.getItems(target);
                        return (<PanelGroup accordion activeKey={this.state.activeAccordionPanel} onSelect={(key) => {
                            this.setState({
                                activeAccordionPanel: key
                            });
                        }}>
                            {items.map((item, pos) => (
                                <Panel header={getMessageById(this.context.messages, item.cfg?.title ?? item.title ?? "")} eventKey={pos} collapsible>
                                    {this.renderItem(item, options)}
                                </Panel>
                            ))}
                        </PanelGroup>);
                    };
                    renderPrintPanel = () => {
                        const layout = this.getLayout();
                        const map = this.getMapConfiguration();
                        const options = {
                            layout,
                            map,
                            layoutName: this.props.getLayoutName(this.props.printSpec),
                            mapSize: this.getMapSize(layout),
                            resolutions: getResolutions(map?.projection),
                            onRefresh: () => this.configurePrintMap(),
                            notAllowedLayers: this.isBackgroundIgnored(this.props.layers, map?.projection),
                            actionConfig: this.props.submitConfig,
                            validations: this.props.printingService.validate(),
                            actions: {
                                print: this.print,
                                addParameter: this.addParameter
                            }
                        };
                        return (
                            <Grid fluid role="body">
                                {this.renderError()}
                                {this.renderWarning(layout)}
                                <Row>
                                    <Col xs={12} md={6}>
                                        {this.renderItems("left-panel", options)}
                                        {this.renderAccordion("left-panel-accordion", options)}
                                    </Col>
                                    <Col xs={12} md={6} style={{textAlign: "center"}}>
                                        {this.renderItems("right-panel", options)}
                                        {this.renderItems("buttons", options)}
                                        {this.renderDownload()}
                                    </Col>
                                </Row>
                            </Grid>
                        );
                    };

                    renderDownload = () => {
                        if (this.props.pdfUrl && !this.props.usePreview) {
                            return <iframe src={this.props.pdfUrl} style={{visibility: "hidden", display: "none"}}/>;
                        }
                        return null;
                    };

                    renderError = () => {
                        if (this.props.error) {
                            return <Row><Col xs={12}><div className="print-error"><span>{this.props.error}</span></div></Col></Row>;
                        }
                        return null;
                    };

                    renderPreviewPanel = () => {
                        return this.renderItems("preview-panel", this.props.previewOptions);
                    };

                    renderBody = () => {
                        if (this.props.pdfUrl && this.props.usePreview) {
                            return this.renderPreviewPanel();
                        }
                        return this.renderPrintPanel();
                    };

                    render() {
                        if ((this.props.capabilities || this.props.error) && this.props.open) {
                            if (this.props.withContainer) {
                                if (this.props.withPanelAsContainer) {
                                    return (<Panel className="mapstore-print-panel" header={<span><span className="print-panel-title"><Message msgId="print.paneltitle"/></span><span className="print-panel-close panel-close" onClick={this.props.toggleControl}></span></span>} style={this.props.style}>
                                        {this.renderBody()}
                                    </Panel>);
                                }
                                return (<Dialog start={{x: 0, y: 80}} id="mapstore-print-panel" style={{ zIndex: 1990, ...this.props.style}}>
                                    <span role="header"><span className="print-panel-title"><Message msgId="print.paneltitle"/></span><button onClick={this.props.toggleControl} className="print-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button></span>
                                    {this.renderBody()}
                                </Dialog>);
                            }
                            return this.renderBody();
                        }
                        return null;
                    }
                    addParameter = (name, value) => {
                        this.props.addPrintParameter("params." + name, value);
                    };
                    isCompatibleWithSRS = (projection, layer) => {
                        return projection === "EPSG:3857" || includes([
                            "wms",
                            "wfs",
                            "vector",
                            "graticule",
                            "empty"
                        ], layer.type) || layer.type === "wmts" && has(layer.allowedSRS, projection);
                    };
                    isAllowed = (layer, projection) => {
                        return this.props.ignoreLayers.indexOf(layer.type) === -1 &&
                            this.isCompatibleWithSRS(normalizeSRS(projection), layer);
                    };

                    isBackgroundIgnored = (layers, projection) => {
                        const background = head((layers || this.props.layers)
                            .filter(layer => layer.group === "background" && layer.visibility && this.isAllowed(layer, projection)));
                        return !background;
                    };
                    filterLayers = (layers, zoom, projection) => {
                        const resolution = this.getPreviewResolution(zoom, projection);

                        const filtered = layers.filter((layer) =>
                            layer.visibility &&
                            isInsideResolutionsLimits(layer, resolution) &&
                            this.isAllowed(layer, projection)
                        );
                        if (this.isBackgroundIgnored(layers, projection) && this.props.defaultBackground && this.props.printSpec.defaultBackground) {
                            const defaultBackground = this.getAlternativeBackground(layers, this.props.defaultBackground);
                            if (defaultBackground) {
                                return [{
                                    ...defaultBackground,
                                    visibility: true
                                }, ...filtered];
                            }
                            return filtered;
                        }
                        return filtered;
                    };

                    configurePrintMap = (props) => {
                        const {
                            map: newMap,
                            capabilities,
                            minZoom,
                            configurePrintMap: configurePrintMapProp,
                            useFixedScales,
                            getZoomForExtent,
                            maxZoom,
                            currentLocale,
                            scales: scalesProp,
                            layers
                        } = props || this.props;
                        if (newMap && newMap.bbox && capabilities) {
                            const bbox = reprojectBbox([
                                newMap.bbox.bounds.minx,
                                newMap.bbox.bounds.miny,
                                newMap.bbox.bounds.maxx,
                                newMap.bbox.bounds.maxy
                            ], newMap.bbox.crs, newMap.projection);
                            const mapSize = this.getMapSize();
                            if (useFixedScales) {
                                const mapZoom = getZoomForExtent(bbox, mapSize, minZoom, maxZoom);
                                const scales = getPrintScales(capabilities);
                                const scaleZoom = getNearestZoom(newMap.zoom, scales);
                                const scale = scales[scaleZoom];
                                configurePrintMapProp(newMap.center, mapZoom, scaleZoom, scale,
                                    layers, newMap.projection, currentLocale);
                            } else {
                                const scale = scalesProp[newMap.zoom];
                                configurePrintMapProp(newMap.center, newMap.zoom, newMap.zoom, scale,
                                    layers, newMap.projection, currentLocale);
                            }
                        }
                    };

                    print = () => {
                        this.props.setPage(0);
                        this.props.onBeforePrint();
                        this.props.printingService.print({
                            layers: this.getMapConfiguration()?.layers,
                            scales: this.props.useFixedScales ? getPrintScales(this.props.capabilities) : undefined
                        })
                            .then((spec) =>
                                this.props.onPrint(this.props.capabilities.createURL, { ...spec, ...this.props.overrideOptions })
                            )
                            .catch(e => {
                                this.props.printError("Error in printing:" + e.message);
                            });
                    };
                }

                const selector = createSelector([
                    (state) => state.controls.print && state.controls.print.enabled || state.controls.toolbar && state.controls.toolbar.active === 'print',
                    (state) => state.print && state.print.capabilities,
                    printSpecificationSelector,
                    (state) => state.print && state.print.pdfUrl,
                    (state) => state.print && state.print.error,
                    mapSelector,
                    layersSelector,
                    additionalLayersSelector,
                    scalesSelector,
                    (state) => state.browser && (!state.browser.ie || state.browser.ie11),
                    currentLocaleSelector,
                    mapTypeSelector
                ], (open, capabilities, printSpec, pdfUrl, error, map, layers, additionalLayers, scales, usePreview, currentLocale, mapType) => ({
                    open,
                    capabilities,
                    printSpec,
                    pdfUrl,
                    error,
                    map,
                    layers: [...layers.filter(l => !l.loadingError), ...(printSpec?.additionalLayers ? additionalLayers.map(l => l.options).filter(l => !l.loadingError) : [])],
                    scales,
                    usePreview,
                    currentLocale,
                    mapType
                }));

                const PrintPlugin = connect(selector, {
                    toggleControl: toggleControl.bind(null, 'print', null),
                    onPrint: printSubmit,
                    printError: printError,
                    onBeforePrint: printSubmitting,
                    setPage: setControlProperty.bind(null, 'print', 'currentPage'),
                    configurePrintMap,
                    addPrintParameter
                })(Print);
                resolve(PrintPlugin);
            });
        },
        enabler: (state) => state.print && state.print.enabled || state.toolbar && state.toolbar.active === 'print'
    },
    {
        disablePluginIf: "{state('mapType') === 'cesium' || !state('printEnabled')}",
        Toolbar: {
            name: 'print',
            position: 7,
            help: <Message msgId="helptexts.print"/>,
            tooltip: "printbutton",
            icon: <Glyphicon glyph="print"/>,
            exclusive: true,
            panel: true,
            priority: 1
        },
        BurgerMenu: {
            name: 'print',
            position: 2,
            tooltip: "printToolTip",
            text: <Message msgId="printbutton"/>,
            icon: <Glyphicon glyph="print"/>,
            action: toggleControl.bind(null, 'print', null),
            priority: 3,
            doNotHide: true
        },
        SidebarMenu: {
            name: "print",
            position: 3,
            tooltip: "printbutton",
            text: <Message msgId="printbutton"/>,
            icon: <Glyphicon glyph="print"/>,
            action: toggleControl.bind(null, 'print', null),
            doNotHide: true,
            toggle: true,
            priority: 2
        }
    }),
    reducers: {print: printReducers}
};
