/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

const {connect} = require('react-redux');

const LocaleUtils = require('../utils/LocaleUtils');
const CoordinatesUtils = require('../utils/CoordinatesUtils');
const MapUtils = require('../utils/MapUtils');
const Dialog = require('../components/misc/Dialog');

const {Grid, Row, Col, Panel, Accordion, Glyphicon} = require('react-bootstrap');

const {toggleControl, setControlProperty} = require('../actions/controls');
const { printSubmit, printError, printSubmitting, configurePrintMap} = require('../actions/print');

const {mapSelector} = require('../selectors/map');
const {layersSelector} = require('../selectors/layers');

const {createSelector} = require('reselect');

const assign = require('object-assign');

const {head} = require('lodash');

const {scalesSelector} = require('../selectors/map');
const {currentLocaleSelector, currentLocaleLanguageSelector} = require('../selectors/locale');
const {isLocalizedLayerStylesEnabledSelector, localizedLayerStylesEnvSelector} = require('../selectors/localizedLayerStyles');
const {mapTypeSelector} = require('../selectors/maptype');

const Message = require('../components/I18N/Message');

require('./print/print.css');

/**
 * Print plugin. This plugin allows to print current map view. **note**: this plugin requires the  **printing module** to work.
 * Please look at mapstore documentation about how to add and configure the printing module in your installation.
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
 */

module.exports = {
    PrintPlugin: assign({
        loadPlugin: (resolve) => {
            require.ensure('./print/index', () => {
                const {
                    Name,
                    Description,
                    Resolution,
                    DefaultBackgroundOption,
                    Sheet,
                    LegendOption,
                    MultiPageOption,
                    LandscapeOption,
                    ForceLabelsOption,
                    AntiAliasingOption,
                    IconSizeOption,
                    LegendDpiOption,
                    Font,
                    MapPreview,
                    PrintSubmit,
                    PrintPreview
                } = require('./print/index');

                const PrintUtils = require('../utils/PrintUtils');


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
                        localizedLayerStylesEnv: PropTypes.object
                    };

                    static contextTypes = {
                        messages: PropTypes.object
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
                        preloadData: PrintUtils.preloadData,
                        getPrintSpecification: PrintUtils.getMapfishPrintSpecification,
                        getLayoutName: PrintUtils.getLayoutName,
                        getZoomForExtent: MapUtils.defaultGetZoomForExtent,
                        pdfUrl: null,
                        mapWidth: 370,
                        mapType: "leaflet",
                        minZoom: 1,
                        maxZoom: 23,
                        alternatives: [{
                            name: "legend",
                            component: LegendOption,
                            regex: /legend/
                        }, {
                            name: "2pages",
                            component: MultiPageOption,
                            regex: /2_pages/
                        }, {
                            name: "landscape",
                            component: LandscapeOption,
                            regex: /landscape/
                        }],
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
                        overrideOptions: {}
                    };

                    UNSAFE_componentWillMount() {
                        if (this.props.usePreview && !window.PDFJS) {
                            const s = document.createElement("script");
                            s.type = "text/javascript";
                            s.src = "https://unpkg.com/pdfjs-dist@1.4.79/build/pdf.combined.js";
                            document.head.appendChild(s);
                        }
                        this.configurePrintMap();
                    }

                    UNSAFE_componentWillReceiveProps(nextProps) {
                        const hasBeenOpened = nextProps.open && !this.props.open;
                        const mapHasChanged = this.props.open && this.props.syncMapPreview && MapUtils.mapUpdated(this.props.map, nextProps.map);
                        const specHasChanged = nextProps.printSpec.defaultBackground !== this.props.printSpec.defaultBackground;
                        if (hasBeenOpened || mapHasChanged || specHasChanged) {
                            this.configurePrintMap(nextProps.map, nextProps.printSpec);
                        }
                    }

                    getMapSize = (layout) => {
                        const currentLayout = layout || this.getLayout();
                        return {
                            width: this.props.mapWidth,
                            height: currentLayout && currentLayout.map.height / currentLayout.map.width * this.props.mapWidth || 270
                        };
                    };

                    getLayout = () => {
                        const layoutName = this.props.getLayoutName(this.props.printSpec);
                        return head(this.props.capabilities.layouts.filter((l) => l.name === layoutName));
                    };

                    renderLayoutsAlternatives = () => {
                        return this.props.alternatives.map((alternative) =>
                            (<alternative.component key={"printoption_" + alternative.name}
                                label={LocaleUtils.getMessageById(this.context.messages, "print.alternatives." + alternative.name)}
                                enableRegex={alternative.regex}
                            />)
                        );
                    };

                    renderPreviewPanel = () => {
                        return <PrintPreview {...this.props.previewOptions} role="body" prevPage={this.prevPage} nextPage={this.nextPage}/>;
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

                    renderPrintPanel = () => {
                        const layout = this.getLayout();
                        const layoutName = this.props.getLayoutName(this.props.printSpec);
                        const mapSize = this.getMapSize(layout);
                        return (
                            <Grid fluid role="body">
                                {this.renderError()}
                                {this.renderWarning(layout)}
                                <Row>
                                    <Col xs={12} md={6}>
                                        <Name label={LocaleUtils.getMessageById(this.context.messages, 'print.title')} placeholder={LocaleUtils.getMessageById(this.context.messages, 'print.titleplaceholder')} />
                                        <Description label={LocaleUtils.getMessageById(this.context.messages, 'print.description')} placeholder={LocaleUtils.getMessageById(this.context.messages, 'print.descriptionplaceholder')} />
                                        <Accordion defaultActiveKey="1">
                                            <Panel className="print-layout" header={LocaleUtils.getMessageById(this.context.messages, "print.layout")} eventKey="1" collapsible>
                                                <Sheet key="sheetsize"
                                                    layouts={this.props.capabilities.layouts}
                                                    label={LocaleUtils.getMessageById(this.context.messages, "print.sheetsize")}
                                                />
                                                {this.renderLayoutsAlternatives()}
                                            </Panel>
                                            <Panel className="print-legend-options" header={LocaleUtils.getMessageById(this.context.messages, "print.legendoptions")} eventKey="2" collapsible>
                                                <Font label={LocaleUtils.getMessageById(this.context.messages, "print.legend.font")}/>
                                                <ForceLabelsOption label={LocaleUtils.getMessageById(this.context.messages, "print.legend.forceLabels")}/>
                                                <AntiAliasingOption label={LocaleUtils.getMessageById(this.context.messages, "print.legend.antiAliasing")}/>
                                                <IconSizeOption label={LocaleUtils.getMessageById(this.context.messages, "print.legend.iconsSize")}/>
                                                <LegendDpiOption label={LocaleUtils.getMessageById(this.context.messages, "print.legend.dpi")}/>
                                            </Panel>
                                        </Accordion>
                                    </Col>
                                    <Col xs={12} md={6} style={{textAlign: "center"}}>
                                        <Resolution label={LocaleUtils.getMessageById(this.context.messages, "print.resolution")}/>
                                        <MapPreview width={mapSize.width} height={mapSize.height} mapType={this.props.mapType}
                                            onMapRefresh={() => this.configurePrintMap()}
                                            layout={layoutName}
                                            layoutSize={layout && layout.map || {width: 10, height: 10}}
                                            resolutions={MapUtils.getResolutions()}
                                            useFixedScales={this.props.useFixedScales}
                                            env={this.props.localizedLayerStylesEnv}
                                            {...this.props.mapPreviewOptions}
                                        />
                                        {this.isBackgroundIgnored() ? <DefaultBackgroundOption label={LocaleUtils.getMessageById(this.context.messages, "print.defaultBackground")}/> : null}
                                        <PrintSubmit {...this.props.submitConfig} disabled={!layout} onPrint={this.print}/>
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

                    isAllowed = (layer) => {
                        return this.props.ignoreLayers.indexOf(layer.type) === -1;
                    };

                    isBackgroundIgnored = () => {
                        return this.props.layers.filter((layer) => layer.visibility && !this.isAllowed(layer)).length > 0;
                    };

                    filterLayers = (printSpec) => {
                        const filtered = this.props.layers.filter((layer) => layer.visibility && this.isAllowed(layer));
                        if (this.isBackgroundIgnored() && this.props.defaultBackground && printSpec.defaultBackground) {
                            const defaultBackground = this.props.layers.filter((layer) => layer.type === this.props.defaultBackground)[0];
                            return [assign({}, defaultBackground, {visibility: true}), ...filtered];
                        }
                        return filtered;
                    };

                    configurePrintMap = (map, printSpec) => {
                        const newMap = map || this.props.map;
                        const newPrintSpec = printSpec || this.props.printSpec;
                        if (newMap && newMap.bbox && this.props.capabilities) {
                            const bbox = CoordinatesUtils.reprojectBbox([
                                newMap.bbox.bounds.minx,
                                newMap.bbox.bounds.miny,
                                newMap.bbox.bounds.maxx,
                                newMap.bbox.bounds.maxy
                            ], newMap.bbox.crs, newMap.projection);
                            const mapSize = this.getMapSize();
                            if (this.props.useFixedScales) {
                                const mapZoom = this.props.getZoomForExtent(bbox, mapSize, this.props.minZoom, this.props.maxZoom);
                                const scales = PrintUtils.getPrintScales(this.props.capabilities);
                                const scaleZoom = PrintUtils.getNearestZoom(newMap.zoom, scales);

                                this.props.configurePrintMap(newMap.center, mapZoom, scaleZoom, scales[scaleZoom],
                                    this.filterLayers(newPrintSpec), newMap.projection, this.props.currentLocale);
                            } else {
                                this.props.configurePrintMap(newMap.center, newMap.zoom, newMap.zoom, this.props.scales[newMap.zoom],
                                    this.filterLayers(newPrintSpec), newMap.projection, this.props.currentLocale);
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
                    configurePrintMap
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
            text: <Message msgId="printbutton"/>,
            icon: <Glyphicon glyph="print"/>,
            action: toggleControl.bind(null, 'print', null),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {print: require('../reducers/print')}
};
