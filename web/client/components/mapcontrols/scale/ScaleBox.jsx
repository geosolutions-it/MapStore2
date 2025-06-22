/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { ControlLabel, Form, FormControl, FormGroup } from 'react-bootstrap';
import {Creatable} from 'react-select';
import { getExactZoomFromResolution, getGoogleMercatorScales, getResolutions } from '../../../utils/MapUtils';
import localizedProps from '../../misc/enhancers/localizedProps';
import Message from '../../I18N/Message';
const ReactSelectCreatable = localizedProps(['placeholder', 'noResultsText'])(Creatable);

class ScaleBox extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        style: PropTypes.object,
        scales: PropTypes.array,
        currentZoomLvl: PropTypes.number,
        minZoom: PropTypes.number,
        onChange: PropTypes.func,
        readOnly: PropTypes.bool,
        label: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.object]),
        template: PropTypes.func,
        useRawInput: PropTypes.bool,
        disableScaleLockingParms: PropTypes.object
    };

    static defaultProps = {
        id: 'mapstore-scalebox',
        scales: getGoogleMercatorScales(0, 28),
        currentZoomLvl: 0,
        minZoom: 0,
        scale: 0,
        onChange() {},
        readOnly: false,
        template: scale => scale < 1
            ? Math.round(1 / scale) + " : 1"
            : "1 : " + Math.round(scale),
        useRawInput: false,
        disableScaleLockingParms: {}
    };
    constructor(props) {
        super(props);
        this.state = {
            scales: this.props.disableScaleLockingParms?.resolutions?.length ?
                this.getScalesFromResolutions(this.props.disableScaleLockingParms?.resolutions) :
                this.props.scales.map((scale, idx) => ({
                    value: scale,
                    zoom: idx
                }))
        };
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    }
    onComboChange = (event) => {
        let selectedZoomLvl = parseInt(event.nativeEvent.target.value, 10);
        this.props.onChange(selectedZoomLvl, this.props.scales[selectedZoomLvl]);
    };

    getOptions = () => {
        return this.state.scales.map((item) => {
            return (
                <option value={item.zoom} key={item.zoom}>{this.props.template(item.value, item.zoom)}</option>
            );
        }).filter((element, index) => index >= this.props.minZoom);
    };
    // for print in case editScale = true
    updateScales(scales, newValue) {
        const scalesValues = scales.map(scale => scale.value);

        const isMissing = newValue && scalesValues.indexOf(newValue.value) === -1;

        return isMissing
            ? [ {value: newValue.value, zoom: newValue.zoom}, ...scales ].sort((a, b) => (a.value > b.value ? -1 : 1))
            : scales;
    }
    handleUpdateScales = (newScaleValue) => {
        this.setState((prevState) => ({
            scales: this.updateScales(prevState.scales, newScaleValue)
        }));
    };
    getResolutionByScale(scale, resolutions) {
        const { disableScaleLockingParms } = this.props;
        let correspScales = this.props.scales.map(sc => sc * disableScaleLockingParms.ratio);
        const firstRes = resolutions[0];
        const firstScale = correspScales[0];
        const corresEnteredScale = scale * disableScaleLockingParms?.ratio || 1;
        const correspondentResolution = corresEnteredScale * firstRes / firstScale;
        return correspondentResolution;
    }

    getZoomLevelByResolution(resolution) {
        const resolutions = this.props.disableScaleLockingParms?.resolutions || getResolutions(this.props.disableScaleLockingParms?.projection);
        const corresZoom = getExactZoomFromResolution(resolution, resolutions) ?? 0;
        return parseFloat(corresZoom.toFixed(2));
    }
    getScalesFromResolutions(resolutions) {
        const { disableScaleLockingParms } = this.props;

        // Calculate the corresponding scales based on the ratio
        let correspScales = this.props.scales.map(sc => sc * disableScaleLockingParms.ratio).map((sc, idx) => ({value: sc, zoom: idx}));

        // Get the first resolution and the first corresponding scale
        const firstRes = resolutions[0];
        const firstScale = correspScales[0].value;

        // Calculate the corresponding scales for each resolution
        const correspondentScales = resolutions.map(res => {
            return res * firstScale / firstRes;
        });
        return correspondentScales.map(sc => sc / disableScaleLockingParms.ratio).map((sc, idx) => ({value: sc, zoom: this.getZoomLevelByResolution(resolutions[idx])}));
    }
    handleChangeEditableScaleList(option) {
        const {disableScaleLockingParms} = this.props;

        const newValue = option?.value && parseFloat(option.value);
        const newScale = option?.scale && parseFloat(option.scale) || newValue;
        const newLabel = option?.label && parseFloat(option.label);
        const newZoom = option?.zoom && parseFloat(option.zoom);

        const baseResolutions  = disableScaleLockingParms?.resolutions || getResolutions(this.props.disableScaleLockingParms?.projection);
        const currentResolutions = [...baseResolutions];
        const correspondentResolution = this.getResolutionByScale(newScale, baseResolutions );
        // 1. Validate if newResolution is a valid number greater than 0
        if (typeof correspondentResolution === 'number' && correspondentResolution > 0) {
            // 2. Check if the resolution already exists in the array
            const resolutionSet = new Set(baseResolutions );
            if (!resolutionSet.has(correspondentResolution)) {
                // 3. Add the new resolution to the array
                currentResolutions .push(correspondentResolution);
                // 4. Sort the array to maintain order
                currentResolutions .sort((a, b) => b - a); // Sorts numerically in ascending order
            }
        }
        const corresZoom = getExactZoomFromResolution(correspondentResolution, currentResolutions) ?? 0;
        const roundedZoom = parseFloat(corresZoom.toFixed(2));
        // new created option
        if (newScale === newLabel && newScale && !newZoom) {
            this.handleUpdateScales({
                value: newScale, zoom: roundedZoom
            });
            this.props.onChange(roundedZoom, newScale, correspondentResolution, currentResolutions);
            // add this resolution to the resolutions list of map viewer
            return;
        }
        const scaleLevelToSet = isNaN(newScale) ? undefined : newScale;
        const zoomLevelToSet = isNaN(newZoom) ? undefined : newZoom;
        const selectedZoomLvl = this.state.scales.find( sc => sc.value === scaleLevelToSet) ||
                            this.props.scales[this.props.currentZoomLvl];
        this.props.onChange(zoomLevelToSet, selectedZoomLvl?.value, correspondentResolution, currentResolutions);
    }
    render() {
        let control = null;
        let currentZoomLvl = Math.round(this.props.currentZoomLvl);
        const {disableScaleLockingParms} = this.props;
        if (this.props.readOnly) {
            control =
                <label>{this.props.template(this.props.scales[currentZoomLvl], currentZoomLvl)}</label>
            ;
        } else if (this.props.useRawInput) {
            control =
                (<select label={this.props.label} onChange={this.onComboChange} bsSize="small" value={currentZoomLvl || ""}>
                    {this.getOptions()}
                </select>)
            ;
        } else if (disableScaleLockingParms?.editScale) {
            const {scales} = this.state;
            currentZoomLvl = disableScaleLockingParms?.resolution ? this.getZoomLevelByResolution(disableScaleLockingParms?.resolution) : Math.round(this.props.currentZoomLvl) > (scales.length - 1) ? (scales.length - 1) : Math.round(this.props.currentZoomLvl);

            control =
                (<Form inline><FormGroup bsSize="small">
                    <ReactSelectCreatable
                        clearable={false}
                        id="scaleBox"
                        className="scale-box-create-select"
                        value={currentZoomLvl}
                        options={scales.map((item) => ({scale: item.value, zoom: item.zoom, value: item.zoom, label: this.props.template(item.value, item.zoom)}))}
                        promptTextCreator={(label) => {
                            return <Message msgId={"print.createScaleOption"} msgParams={{ label }}/>;

                        }}
                        isValidNewOption={(option) => {
                            if (option.label) {
                                const newValue = parseFloat(option.label);
                                return !isNaN(newValue) && newValue > Math.min(...(this.props.scales || [])) && newValue < Math.max(...(this.props.scales || []));
                            }
                            return false;
                        }}
                        onChange={(op) => this.handleChangeEditableScaleList(op)}
                    />
                </FormGroup></Form>)
            ;
        } else {
            control =
                (<Form inline><FormGroup bsSize="small">
                    <ControlLabel htmlFor="scaleBox">{this.props.label}</ControlLabel>
                    <FormControl id="scaleBox" componentClass="select" onChange={this.onComboChange} value={currentZoomLvl || ""}>
                        {this.getOptions()}
                    </FormControl>
                </FormGroup></Form>)
            ;
        }
        return (

            <div id={this.props.id} style={this.props.style}>
                {control}
            </div>
        );
    }
}

export default ScaleBox;
