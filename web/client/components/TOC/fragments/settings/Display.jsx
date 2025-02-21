/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import clamp from 'lodash/clamp';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';
import {Checkbox, Col, ControlLabel, FormGroup, Glyphicon, Grid, Row, Button as ButtonRB } from 'react-bootstrap';

import tooltip from '../../../misc/enhancers/buttonTooltip';
const Button = tooltip(ButtonRB);
import IntlNumberFormControl from '../../../I18N/IntlNumberFormControl';
import Message from '../../../I18N/Message';
import InfoPopover from '../../../widgets/widget/InfoPopover';
import Legend from '../../../../plugins/TOC/components/Legend';
import VisibilityLimitsForm from './VisibilityLimitsForm';
import { ServerTypes } from '../../../../utils/LayersUtils';
import {updateLayerLegendFilter} from '../../../../utils/FilterUtils';
import Select from 'react-select';
import { getSupportedFormat } from '../../../../api/WMS';
import WMSCacheOptions from './WMSCacheOptions';
import ThreeDTilesSettings from './ThreeDTilesSettings';
import ModelTransformation from './ModelTransformation';
import StyleBasedWMSJsonLegend from '../../../../plugins/TOC/components/StyleBasedWMSJsonLegend';
import { getMiscSetting } from '../../../../utils/ConfigUtils';
import VectorLegend from '../../../../plugins/TOC/components/VectorLegend';

export default class extends React.Component {
    static propTypes = {
        opacityText: PropTypes.node,
        element: PropTypes.object,
        formats: PropTypes.array,
        settings: PropTypes.object,
        onChange: PropTypes.func,
        containerWidth: PropTypes.number,
        currentLocaleLanguage: PropTypes.string,
        isLocalizedLayerStylesEnabled: PropTypes.bool,
        isCesiumActive: PropTypes.bool,
        projection: PropTypes.string,
        mapSize: PropTypes.object,
        mapBbox: PropTypes.object,
        resolutions: PropTypes.array,
        zoom: PropTypes.number,
        hideInteractiveLegendOption: PropTypes.bool
    };

    static defaultProps = {
        onChange: () => {},
        opacityText: <Message msgId="opacity"/>,
        hideInteractiveLegendOption: false
    };

    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
    }

    state = {
        opacity: 100,
        legendOptions: {
            legendWidth: 12,
            legendHeight: 12
        },
        containerStyle: {overflowX: 'auto'},
        containerWidth: 0
    };

    componentDidMount() {
        this.updateState(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.updateState(nextProps);
        }
    }

    onChange = (name, value) =>{
        if (name === 'opacity') {
            const opacity = value && clamp(Math.round(value), 0, 100);
            this.setState({opacity, ...this.state});
            this.props.onChange("opacity", opacity && (opacity / 100) || 0);
        } else {
            const legendValues = value && clamp(Math.round(value), 0, 1000);
            this.setState({
                ...this.state,
                legendOptions: {
                    ...this.state.legendOptions,
                    [name]: legendValues
                }});
            this.props.onChange({
                legendOptions: {
                    ...this.state.legendOptions,
                    [name]: legendValues
                }
            });
        }
    };

    onBlur = (event) => {
        const value = event.target.value && Math.round(event.target.value);
        const name = event.target.name;
        const defaultSize = 12;
        this.props.onChange({
            legendOptions: {
                ...this.state.legendOptions,
                [name]: value >= defaultSize ? value : ""
            }
        });
    };

    onFormatOptionsFetch = (url) => {
        this.setState({formatLoading: true});
        getSupportedFormat(url).then((imageFormats)=>{
            this.props.onChange("imageFormats", imageFormats);
            this.setState({formatLoading: false});
        });
    }

    getValidationState = (name) =>{
        if (this.state.legendOptions && this.state.legendOptions[name]) {
            return parseInt(this.state.legendOptions[name], 10) < 12 && "error";
        }
        return null;
    };
    getLegendProps = () => {
        return pick(this.props, ['projection', 'mapSize', 'mapBbox']);
    }
    render() {
        const formatValue = this.props.element && this.props.element.format || "image/png";
        const experimentalInteractiveLegend = getMiscSetting('experimentalInteractiveLegend', false);
        const enableInteractiveLegend = !!(experimentalInteractiveLegend && this.props.element?.enableInteractiveLegend);
        return (
            <Grid
                fluid
                className={"fluid-container ms-display-form " + (!this.props.containerWidth && "adjust-display")}>
                {this.props.element.type === "wms" &&
                <Row>
                    <Col xs={12}>
                        <FormGroup>
                            <ControlLabel><Message msgId="layerProperties.format.title" /></ControlLabel>
                            <div className={'ms-format-container'}>
                                <Select
                                    className={'format-select'}
                                    key="format-dropdown"
                                    clearable={false}
                                    noResultsText={<Message
                                        msgId={this.state.formatLoading
                                            ? "layerProperties.format.loading" : "layerProperties.format.noOption"}
                                    />}
                                    isLoading={!!this.state.formatLoading}
                                    options={this.state.formatLoading
                                        ? []
                                        : (this.props.element?.imageFormats || this.props.formats || []).map((format) => format?.value ? format : ({ value: format, label: format }))
                                    }
                                    value={{ value: formatValue, label: formatValue }}
                                    onOpen={() => {
                                        if (!this.props.element?.imageFormats
                                        || this.props.element?.imageFormats?.length === 0) {
                                            this.onFormatOptionsFetch(this.props.element?.url);
                                        }
                                    }}
                                    onChange={({ value }) => {
                                        this.props.onChange("format", value);
                                    }}/>
                                <Button
                                    disabled={!!this.state.formatLoading}
                                    tooltipId="layerProperties.format.refresh"
                                    className="square-button-md no-border format-refresh"
                                    onClick={() => {this.onFormatOptionsFetch(this.props.element?.url);}}
                                    key="format-refresh">
                                    <Glyphicon glyph="refresh" />
                                </Button>
                            </div>
                        </FormGroup>
                    </Col>
                    <Col xs={12}>
                        <FormGroup>
                            <ControlLabel><Message msgId="layerProperties.wmsLayerTileSize" /></ControlLabel>
                            <Select
                                key="wsm-layersize-dropdown"
                                clearable={false}
                                options={[{ value: 256, label: 256 }, { value: 512, label: 512 }]}
                                value={this.props.element && this.props.element.tileSize || 256}
                                onChange={({ value }) => {
                                    this.props.onChange("tileSize", value);
                                }}/>
                        </FormGroup>
                    </Col>
                </Row>}

                {!["3dtiles", 'model'].includes(this.props.element.type) && <Row>
                    <Col xs={12}>
                        <FormGroup>
                            <ControlLabel>{this.props.opacityText} %</ControlLabel>
                            <IntlNumberFormControl
                                type="number"
                                min={0}
                                max={100}
                                name={"opacity"}
                                value={this.state.opacity}
                                onChange={(val)=> this.onChange("opacity", val)}/>
                        </FormGroup>
                    </Col>
                </Row>}

                <Row>
                    <Col xs={12}>
                        <FormGroup>
                            <VisibilityLimitsForm
                                title={<ControlLabel><Message msgId="layerProperties.visibilityLimits.title"/></ControlLabel>}
                                layer={this.props.element}
                                onChange={this.props.onChange}
                                projection={this.props.projection}
                                resolutions={this.props.resolutions}
                                zoom={this.props.zoom}
                                defaultLimitsType={this.props.element.visibilityLimitType}
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <ThreeDTilesSettings
                    layer={this.props.element}
                    onChange={this.props.onChange}
                />
                <ModelTransformation
                    layer={this.props.element}
                    onChange={this.props.onChange}
                />

                {this.props.element.type === "wms" &&
                <Row>
                    <Col xs={12}>
                        <hr/>
                        <FormGroup>
                            <Checkbox key="transparent" checked={this.props.element && (this.props.element.transparent === undefined ? true : this.props.element.transparent)} onChange={(event) => {this.props.onChange("transparent", event.target.checked); }}>
                                <Message msgId="layerProperties.transparent"/></Checkbox>
                            <Checkbox key="singleTile" value="singleTile"
                                checked={this.props.element && (this.props.element.singleTile !== undefined ? this.props.element.singleTile : false )}
                                onChange={(e) => this.props.onChange("singleTile", e.target.checked)}>
                                <Message msgId="layerProperties.singleTile"/>
                            </Checkbox>
                            {(this.props.isLocalizedLayerStylesEnabled && this.props.element?.serverType !== ServerTypes.NO_VENDOR && (
                                <Checkbox key="localizedLayerStyles" value="localizedLayerStyles"
                                    data-qa="display-lacalized-layer-styles-option"
                                    checked={this.props.element && (this.props.element.localizedLayerStyles !== undefined ? this.props.element.localizedLayerStyles : false )}
                                    onChange={(e) => this.props.onChange("localizedLayerStyles", e.target.checked)}>
                                    <Message msgId="layerProperties.enableLocalizedLayerStyles.label" />&nbsp;<InfoPopover text={<Message msgId="layerProperties.enableLocalizedLayerStyles.tooltip" />} />
                                </Checkbox>))}
                            {(this.props.element?.serverType !== ServerTypes.NO_VENDOR && (
                                <>
                                    <hr/>
                                    <WMSCacheOptions
                                        layer={this.props.element}
                                        projection={this.props.projection}
                                        onChange={this.props.onChange}
                                        disableTileGrids={!!this.props.isCesiumActive}
                                    />
                                </>
                            ))}
                        </FormGroup>
                    </Col>
                    <div className={"legend-options"}>
                        <Col xs={12} className={"legend-label"}>
                            <label key="legend-options-title" className="control-label"><Message msgId="layerProperties.legendOptions.title" /></label>
                        </Col>
                        { experimentalInteractiveLegend && this.props.element?.serverType !== ServerTypes.NO_VENDOR && !this.props?.hideInteractiveLegendOption &&
                            <Col xs={12} className="first-selectize">
                                <Checkbox
                                    data-qa="display-interactive-legend-option"
                                    value="enableInteractiveLegend"
                                    key="enableInteractiveLegend"
                                    onChange={(e) => {
                                        if (!e.target.checked) {
                                            const newLayerFilter = updateLayerLegendFilter(this.props.element.layerFilter);
                                            this.props.onChange("layerFilter", newLayerFilter );
                                        }
                                        this.props.onChange("enableInteractiveLegend", e.target.checked);
                                    }}
                                    checked={enableInteractiveLegend} >
                                    <Message msgId="layerProperties.enableInteractiveLegendInfo.label"/>
                                    &nbsp;<InfoPopover text={<Message msgId="layerProperties.enableInteractiveLegendInfo.info" />} />
                                </Checkbox>
                            </Col>
                        }
                        {!enableInteractiveLegend && <><Col xs={12} sm={6} className="first-selectize">
                            <FormGroup validationState={this.getValidationState("legendWidth")}>
                                <ControlLabel><Message msgId="layerProperties.legendOptions.legendWidth" /></ControlLabel>
                                <IntlNumberFormControl
                                    value={this.state.legendOptions.legendWidth}
                                    name="legendWidth"
                                    type="number"
                                    min={12}
                                    max={1000}
                                    onChange={(val)=> this.onChange("legendWidth", val)}
                                    onKeyPress={(e)=> e.key === "-" && e.preventDefault()}
                                    onBlur={this.onBlur}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={12} sm={6} className="second-selectize">
                            <FormGroup validationState={this.getValidationState("legendHeight")}>
                                <ControlLabel><Message msgId="layerProperties.legendOptions.legendHeight" /></ControlLabel>
                                <IntlNumberFormControl
                                    value={this.state.legendOptions.legendHeight}
                                    name="legendHeight"
                                    type="number"
                                    min={12}
                                    max={1000}
                                    onChange={(val)=> this.onChange("legendHeight", val)}
                                    onKeyPress={(e)=> e.key === "-" && e.preventDefault()}
                                    onBlur={this.onBlur}
                                />
                            </FormGroup>
                        </Col></>}
                        <Col xs={12} className="legend-preview">
                            <ControlLabel><Message msgId="layerProperties.legendOptions.legendPreview" /></ControlLabel>
                            <div style={this.setOverFlow() && this.state.containerStyle || {}} ref={this.containerRef} >
                                { enableInteractiveLegend ?
                                    <StyleBasedWMSJsonLegend
                                        style={this.setOverFlow() && {} || undefined}
                                        layer={this.props.element}
                                        legendHeight={
                                            this.useLegendOptions() && this.state.legendOptions.legendHeight || undefined}
                                        legendWidth={
                                            this.useLegendOptions() && this.state.legendOptions.legendWidth || undefined}
                                        language={
                                            this.props.isLocalizedLayerStylesEnabled ? this.props.currentLocaleLanguage : undefined}
                                        {...this.getLegendProps()}
                                    /> :
                                    <Legend
                                        style={this.setOverFlow() && {} || undefined}
                                        layer={this.props.element}
                                        legendHeight={
                                            this.useLegendOptions() && this.state.legendOptions.legendHeight || undefined}
                                        legendWidth={
                                            this.useLegendOptions() && this.state.legendOptions.legendWidth || undefined}
                                        language={
                                            this.props.isLocalizedLayerStylesEnabled ? this.props.currentLocaleLanguage : undefined}
                                        {...this.getLegendProps()}
                                    />}
                            </div>
                        </Col>
                    </div>
                </Row>}
                {['wfs', 'vector'].includes(this.props.element.type) && <Row>
                    <div className={"legend-options"}>
                        {experimentalInteractiveLegend && <Col xs={12} className={"legend-label"}>
                            <label key="legend-options-title" className="control-label"><Message msgId="layerProperties.legendOptions.title" /></label>
                        </Col>}
                        { experimentalInteractiveLegend && !this.props?.hideInteractiveLegendOption &&
                            <Col xs={12} className="first-selectize">
                                <Checkbox
                                    data-qa="display-interactive-legend-option"
                                    value="enableInteractiveLegend"
                                    key="enableInteractiveLegend"
                                    onChange={(e) => {
                                        if (!e.target.checked) {
                                            const newLayerFilter = updateLayerLegendFilter(this.props.element.layerFilter);
                                            this.props.onChange("layerFilter", newLayerFilter );
                                        }
                                        this.props.onChange("enableInteractiveLegend", e.target.checked);
                                    }}
                                    checked={enableInteractiveLegend} >
                                    <Message msgId="layerProperties.enableInteractiveLegendInfo.label"/>
                                    &nbsp;<InfoPopover text={<Message msgId="layerProperties.enableInteractiveLegendInfo.infoWithoutGSNote" />} />
                                </Checkbox>
                            </Col>
                        }
                        {enableInteractiveLegend && <Col xs={12} className="legend-preview">
                            <ControlLabel><Message msgId="layerProperties.legendOptions.legendPreview" /></ControlLabel>
                            <div style={this.setOverFlow() && this.state.containerStyle || {}} ref={this.containerRef} >
                                <VectorLegend
                                    layer={this.props.element}
                                    style={this.props.element.style || {}}
                                />
                            </div>
                        </Col>}
                    </div>
                </Row>}
            </Grid>
        );
    }
    updateState = (props) =>{
        if (props.settings && props.settings.options) {
            this.setState({
                ...this.state,
                opacity: !isNil(props.settings.options.opacity) ? Math.round(props.settings.options.opacity * 100) : this.state.opacity,
                legendOptions: {
                    ...this.state.legendOptions,
                    legendHeight: props.element.legendOptions && !isNil(props.element.legendOptions.legendHeight) ?
                        props.element.legendOptions.legendHeight : this.state.legendOptions.legendHeight,
                    legendWidth: props.element.legendOptions && !isNil(props.element.legendOptions.legendWidth) ?
                        props.element.legendOptions.legendWidth : this.state.legendOptions.legendWidth
                },
                containerWidth: this.containerRef.current && this.containerRef.current.clientWidth
            });
        }
    };

    setOverFlow = () =>{
        return this.state.legendOptions.legendWidth > this.state.containerWidth;
    };

    useLegendOptions = () =>{
        return (
            this.getValidationState("legendWidth") !== 'error' &&
            this.getValidationState("legendHeight") !== 'error' &&
            isNumber(this.state.legendOptions.legendHeight) &&
            isNumber(this.state.legendOptions.legendWidth)
        );
    };


}
