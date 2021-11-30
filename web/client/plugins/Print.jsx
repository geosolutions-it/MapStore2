/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './print/print.css';

import { head } from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { PanelGroup, Col, Glyphicon, Grid, Panel, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { setControlProperty, toggleControl } from '../actions/controls';
import { configurePrintMap, printError, printSubmit, printSubmitting, addPrintParameter } from '../actions/print';
import Message from '../components/I18N/Message';
import Dialog from '../components/misc/Dialog';
import printReducers from '../reducers/print';
import { layersSelector } from '../selectors/layers';
import { currentLocaleLanguageSelector, currentLocaleSelector } from '../selectors/locale';
import { isLocalizedLayerStylesEnabledSelector, localizedLayerStylesEnvSelector } from '../selectors/localizedLayerStyles';
import { mapSelector, scalesSelector } from '../selectors/map';
import { mapTypeSelector } from '../selectors/maptype';
import { reprojectBbox } from '../utils/CoordinatesUtils';
import { getMessageById } from '../utils/LocaleUtils';
import { defaultGetZoomForExtent, getResolutions, mapUpdated, dpi2dpu, DEFAULT_SCREEN_DPI } from '../utils/MapUtils';
import { isInsideResolutionsLimits } from '../utils/LayersUtils';

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
 *  - `layout` (`left-panel-accordion`, `position`: `1`)
 *  - `legendoptions` (`left-panel-accordion`, `position`: `2`)
 *  - `resolution` (`right-panel`, `position`: `1`)
 *  - `mappreview` (`right-panel`, `position`: `2`)
 *  - `defaultbackgroundignore` (`right-panel`, `position`: `3`)
 *  - `submit` (`buttons`, `position`: `1`)
 *  - `printpreview` (`preview-panel`, `position`: `1`)
 *
 * To remove a widget, you have to include a Null plugin with the desired target.
 * You can use the position to sort existing and custom items.
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
 * // Custom plugin added to the left-panel target
 * export default createPlugin("PluginCustomization", {
 *    component: MyCustomization,
 *    containers: {
 *       Print: {
 *           target: "left-panel",
 *           position: 1.5
 *       }
 *    }
 * });
 *
 * @example
 * // Custom plugin replacing an existing target ("name", the widget for entering the title for the map)
 * export default createPlugin("PluginCustomization", {
 *    component: MyCustomization,
 *    containers: {
 *       Print: {
 *           target: "name",
 *           position: 1.5
 *       }
 *    }
 * });
  *
 * @example
 * // Removal of an existing target (using the Null component)
 * export default createPlugin("PluginCustomization", {
 *    component: Null,
 *    containers: {
 *       Print: {
 *           target: "name",
 *           position: 1.5
 *       }
 *    }
 * });
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
                    preloadData,
                    getMapfishPrintSpecification,
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
                        preloadData: PropTypes.func,
                        getPrintSpecification: PropTypes.func,
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
                        defaultBackground: PropTypes.string,
                        closeGlyph: PropTypes.string,
                        submitConfig: PropTypes.object,
                        previewOptions: PropTypes.object,
                        currentLocale: PropTypes.string,
                        currentLocaleLanguage: PropTypes.string,
                        overrideOptions: PropTypes.object,
                        isLocalizedLayerStylesEnabled: PropTypes.bool,
                        localizedLayerStylesEnv: PropTypes.object,
                        items: PropTypes.array,
                        addPrintParameter: PropTypes.func
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
                        preloadData: preloadData,
                        getPrintSpecification: getMapfishPrintSpecification,
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
                        defaultBackground: "osm",
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
                        items: []
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
                        const specHasChanged = nextProps.printSpec.defaultBackground !== this.props.printSpec.defaultBackground;
                        if (hasBeenOpened || mapHasChanged || specHasChanged) {
                            this.configurePrintMap(nextProps);
                        }
                    }
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
                    getMapSize = (layout) => {
                        const currentLayout = layout || this.getLayout();
                        return {
                            width: this.props.mapWidth,
                            height: currentLayout && currentLayout.map.height / currentLayout.map.width * this.props.mapWidth || 270
                        };
                    };

                    getLayout = (props) => {
                        const { getLayoutName: getLayoutNameProp, printSpec, capabilities } = props || this.props;
                        const layoutName = getLayoutNameProp(printSpec);
                        return head(capabilities.layouts.filter((l) => l.name === layoutName));
                    };

                    renderPreviewPanel = () => {
                        return this.renderItems("preview-panel", this.props.previewOptions);
                    };

                    renderError = () => {
                        if (this.props.error) {
                            return <Row><Col xs={12}><div className="print-error"><span>{this.props.error}</span></div></Col></Row>;
                        }
                        return null;
                    };

                    renderWarning = (layout) => {
                        if (!layout) {
                            return <Row><Col xs={12}><div className="print-warning"><span><Message msgId="print.layoutWarning"/></span></div></Col></Row>;
                        }
                        return null;
                    };
                    renderItem = (item, options) => {
                        const Comp = item.plugin;
                        const {style, ...other} = this.props;
                        return <Comp role="body" {...other} {...item.cfg} {...options}/>;
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
                                <Panel header={getMessageById(this.context.messages, item.cfg.title)} eventKey={pos} collapsible>
                                    {this.renderItem(item, options)}
                                </Panel>
                            ))}
                        </PanelGroup>);
                    };
                    renderPrintPanel = () => {
                        const layout = this.getLayout();
                        const options = {
                            layout,
                            layoutName: this.props.getLayoutName(this.props.printSpec),
                            mapSize: this.getMapSize(layout),
                            resolutions: getResolutions(),
                            onRefresh: () => this.configurePrintMap(),
                            notAllowedLayers: this.isBackgroundIgnored(),
                            actionConfig: this.props.submitConfig,
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
                                return (<Dialog id="mapstore-print-panel" style={{ left: "17%", top: "50px", zIndex: 1990, ...this.props.style}}>
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
                    isAllowed = (layer) => {
                        return this.props.ignoreLayers.indexOf(layer.type) === -1;
                    };

                    isBackgroundIgnored = (layers) => {
                        return (layers || this.props.layers).filter((layer) => layer.visibility && !this.isAllowed(layer)).length > 0;
                    };

                    filterLayers = (props, resolution) => {
                        const {
                            printSpec,
                            layers,
                            defaultBackground: defaultBackgroundProp
                        } = props || this.props;
                        const filtered = layers.filter((layer) => layer.visibility && isInsideResolutionsLimits(layer, resolution) && this.isAllowed(layer));
                        if (this.isBackgroundIgnored(layers) && defaultBackgroundProp && printSpec.defaultBackground) {
                            const defaultBackground = layers.filter((layer) => layer.type === defaultBackgroundProp)[0];
                            return [assign({}, defaultBackground, {visibility: true}), ...filtered];
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
                            scales: scalesProp
                        } = props || this.props;
                        if (newMap && newMap.bbox && capabilities) {
                            const dpu = dpi2dpu(DEFAULT_SCREEN_DPI, newMap.projection);
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
                                const previewResolution = scale / dpu;
                                configurePrintMapProp(newMap.center, mapZoom, scaleZoom, scale,
                                    this.filterLayers(props, previewResolution), newMap.projection, currentLocale);
                            } else {
                                const scale = scalesProp[newMap.zoom];
                                const previewResolution = scale / dpu;
                                configurePrintMapProp(newMap.center, newMap.zoom, newMap.zoom, scale,
                                    this.filterLayers(props, previewResolution), newMap.projection, currentLocale);
                            }
                        }
                    };

                    print = () => {
                        // localize
                        let pSpec = this.props.printSpec;
                        if (this.props.isLocalizedLayerStylesEnabled) {
                            pSpec = { ...pSpec, env: this.props.localizedLayerStylesEnv, language: this.props.currentLocaleLanguage};
                        }
                        this.props.setPage(0);
                        this.props.onBeforePrint();
                        this.props.preloadData(pSpec)
                            .then(printSpec => {
                                const spec = this.props.getPrintSpecification(printSpec);
                                this.props.onPrint(this.props.capabilities.createURL, { ...spec, ...this.props.overrideOptions });
                            })
                            .catch(e => {
                                this.props.printError("Error pre-loading data:" + e.message);
                            });
                    };
                }

                const selector = createSelector([
                    (state) => state.controls.print && state.controls.print.enabled || state.controls.toolbar && state.controls.toolbar.active === 'print',
                    (state) => state.print && state.print.capabilities,
                    (state) => state.print && state.print.spec && assign({}, state.print.spec, state.print.map || {}),
                    (state) => state.print && state.print.pdfUrl,
                    (state) => state.print && state.print.error,
                    mapSelector,
                    layersSelector,
                    scalesSelector,
                    (state) => state.browser && (!state.browser.ie || state.browser.ie11),
                    currentLocaleSelector,
                    currentLocaleLanguageSelector,
                    mapTypeSelector,
                    isLocalizedLayerStylesEnabledSelector,
                    localizedLayerStylesEnvSelector
                ], (open, capabilities, printSpec, pdfUrl, error, map, layers, scales, usePreview, currentLocale, currentLocaleLanguage, mapType, isLocalizedLayerStylesEnabled, localizedLayerStylesEnv) => ({
                    open,
                    capabilities,
                    printSpec,
                    pdfUrl,
                    error,
                    map,
                    layers: layers.filter(l => !l.loadingError),
                    scales,
                    usePreview,
                    currentLocale,
                    currentLocaleLanguage,
                    mapType,
                    isLocalizedLayerStylesEnabled,
                    localizedLayerStylesEnv
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
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {print: printReducers}
};
