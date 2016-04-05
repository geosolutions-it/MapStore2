/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const LocaleUtils = require('../utils/LocaleUtils');
const CoordinatesUtils = require('../utils/CoordinatesUtils');
const MapUtils = require('../utils/MapUtils');

const {Grid, Row, Col, Panel, Glyphicon, Accordion} = require('react-bootstrap');

const {toggleControl} = require('../actions/controls');
const {printSubmit, printSubmitting, configurePrintMap} = require('../actions/print');

const assign = require('object-assign');

const {head} = require('lodash');

const {
    Name,
    Description,
    Resolution,
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
const Message = require('../components/I18N/Message');

const Print = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        layers: React.PropTypes.array,
        capabilities: React.PropTypes.object,
        printSpec: React.PropTypes.object,
        printSpecTemplate: React.PropTypes.object,
        withContainer: React.PropTypes.bool,
        open: React.PropTypes.bool,
        pdfUrl: React.PropTypes.string,
        title: React.PropTypes.string,
        style: React.PropTypes.object,
        mapWidth: React.PropTypes.number,
        mapType: React.PropTypes.string,
        alternatives: React.PropTypes.array,
        toggleControl: React.PropTypes.func,
        onBeforePrint: React.PropTypes.func,
        onPrint: React.PropTypes.func,
        configurePrintMap: React.PropTypes.func,
        getPrintSpecification: React.PropTypes.func,
        getLayoutName: React.PropTypes.func,
        error: React.PropTypes.string
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            withContainer: true,
            title: 'print.paneltitle',
            toggleControl: () => {},
            onBeforePrint: () => {},
            onPrint: () => {},
            configurePrintMap: () => {},
            printSpecTemplate: {},
            getPrintSpecification: PrintUtils.getMapfishPrintSpecification,
            getLayoutName: PrintUtils.getLayoutName,
            pdfUrl: null,
            mapWidth: 370,
            mapType: "leaflet",
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
            }]
        };
    },
    componentWillMount() {
        this.configurePrintMap();
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.open && !this.props.open) {
            this.configurePrintMap();
        }
    },
    getMapSize(layout) {
        const currentLayout = layout || this.getLayout();
        return {
            width: this.props.mapWidth,
            height: currentLayout && currentLayout.map.height / currentLayout.map.width * this.props.mapWidth || 270
        };
    },
    getLayout() {
        const layoutName = this.props.getLayoutName(this.props.printSpec);
        return head(this.props.capabilities.layouts.filter((l) => l.name === layoutName));
    },
    renderHeader() {
        return (
            <span>
                <span>{LocaleUtils.getMessageById(this.context.messages, this.props.title)}</span>
                <button onClick={this.props.toggleControl} className="close">
                    <Glyphicon glyph={(this.props.open) ? "glyphicon glyphicon-collapse-down" : "glyphicon glyphicon-expand"}/>
                </button>
            </span>
        );
    },
    renderLayoutsAlternatives() {
        return this.props.alternatives.map((alternative) => (
            <alternative.component key={"printoption_" + alternative.name}
                label={LocaleUtils.getMessageById(this.context.messages, "print.alternatives." + alternative.name)}
                enableRegex={alternative.regex}
            />
        ));
    },
    renderPreviewPanel() {
        return <PrintPreview prevPage={this.prevPage} nextPage={this.nextPage}/>;
    },
    renderError() {
        if (this.props.error) {
            return <Row><Col xs={12}><div className="print-error"><span>{this.props.error}</span></div></Col></Row>;
        }
        return null;
    },
    renderWarning(layout) {
        if (!layout) {
            return <Row><Col xs={12}><div className="print-warning"><span><Message msgId="print.layoutWarning"/></span></div></Col></Row>;
        }
        return null;
    },
    renderPrintPanel() {
        const layout = this.getLayout();
        const mapSize = this.getMapSize(layout);
        return (
            <Grid fluid>
            {this.renderError()}
            {this.renderWarning(layout)}
            <Row>
                <Col xs={6}>
                    <Name label={LocaleUtils.getMessageById(this.context.messages, 'print.title')} placeholder={LocaleUtils.getMessageById(this.context.messages, 'print.titleplaceholder')} />
                    <Description label={LocaleUtils.getMessageById(this.context.messages, 'print.description')} placeholder={LocaleUtils.getMessageById(this.context.messages, 'print.descriptionplaceholder')} />
                    <Accordion defaultActiveKey="1">
                        <Panel header={LocaleUtils.getMessageById(this.context.messages, "print.layout")} eventKey="1" collapsible>
                            <Sheet key="sheetsize"
                                layouts={this.props.capabilities.layouts}
                                label={LocaleUtils.getMessageById(this.context.messages, "print.sheetsize")}
                                />
                            {this.renderLayoutsAlternatives()}
                        </Panel>
                        <Panel header={LocaleUtils.getMessageById(this.context.messages, "print.legendoptions")} eventKey="2" collapsible>
                            <Font label={LocaleUtils.getMessageById(this.context.messages, "print.legend.font")}/>
                            <ForceLabelsOption label={LocaleUtils.getMessageById(this.context.messages, "print.legend.forceLabels")}/>
                            <AntiAliasingOption label={LocaleUtils.getMessageById(this.context.messages, "print.legend.antiAliasing")}/>
                            <IconSizeOption label={LocaleUtils.getMessageById(this.context.messages, "print.legend.iconsSize")}/>
                            <LegendDpiOption label={LocaleUtils.getMessageById(this.context.messages, "print.legend.dpi")}/>
                        </Panel>
                    </Accordion>
                </Col>
                <Col xs={6} style={{textAlign: "center"}}>
                    <Resolution label={LocaleUtils.getMessageById(this.context.messages, "print.resolution")}/>
                    <MapPreview width={mapSize.width} height={mapSize.height} mapType={this.props.mapType}
                        onMapRefresh={this.configurePrintMap}
                        />
                    <PrintSubmit disabled={!layout} onPrint={this.print}/>
                </Col>
            </Row>
        </Grid>
        );
    },
    renderBody() {
        if (this.props.pdfUrl) {
            return this.renderPreviewPanel();
        }
        return this.renderPrintPanel();
    },
    render() {
        if (this.props.capabilities || this.props.error) {
            return this.props.withContainer ?
                (<Panel collapsible expanded={this.props.open} header={this.renderHeader()} style={this.props.style}>
                    {this.renderBody()}
                </Panel>) : this.renderBody();
        }
        return null;
    },
    configurePrintMap() {
        if (this.props.map && this.props.capabilities) {
            const bbox = CoordinatesUtils.reprojectBbox([
                this.props.map.bbox.bounds.minx,
                this.props.map.bbox.bounds.miny,
                this.props.map.bbox.bounds.maxx,
                this.props.map.bbox.bounds.maxy
            ], this.props.map.bbox.crs, this.props.map.projection);
            const mapSize = this.getMapSize();
            const mapZoom = MapUtils.getZoomForExtent(bbox, mapSize);
            const scales = PrintUtils.getPrintScales(this.props.capabilities);
            const scaleZoom = PrintUtils.getNearestZoom(this.props.map.zoom, scales);

            this.props.configurePrintMap(this.props.map.center, mapZoom, scaleZoom, scales[scaleZoom],
                this.props.layers.filter((layer) => layer.visibility), this.props.map.projection);
        }
    },
    print() {
        const spec = this.props.getPrintSpecification(this.props.printSpec);
        this.props.onBeforePrint();
        this.props.onPrint(this.props.capabilities.createURL, spec);
    }
});

module.exports = connect((state) => ({
    open: state.controls.print && state.controls.print.enabled,
    capabilities: state.print && state.print.capabilities,
    printSpec: state.print && state.print.spec && assign({}, state.print.spec, state.print.map || {}),
    pdfUrl: state.print && state.print.pdfUrl,
    error: state.print && state.print.error
}), {
    toggleControl: toggleControl.bind(null, 'print', null),
    onPrint: printSubmit,
    onBeforePrint: printSubmitting,
    configurePrintMap
})(Print);
