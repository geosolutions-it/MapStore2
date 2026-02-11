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

import { getGoogleMercatorScales } from '../../../utils/MapUtils';
import {Creatable} from 'react-select';
import { getExactZoomFromResolution, getGoogleMercatorScales, getResolutions } from '../../../utils/MapUtils';
import localizedProps from '../../misc/enhancers/localizedProps';
import Message from '../../I18N/Message';
const ReactSelectCreatable = localizedProps(['placeholder', 'noResultsText'])(Creatable);
const SCALE = "scale";
const ZOOM = "zoom";
const templates = {
    [SCALE]: (scale) => scale < 1
        ? Math.round(1 / scale) + " : 1"
        : "1 : " + Math.round(scale),
    [ZOOM]: (_, zoom) => zoom
};

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
        display: PropTypes.string,
        useRawInput: PropTypes.bool,
        disableScaleLockingParms: PropTypes.object
    };

    static defaultProps = {
        id: 'mapstore-scalebox',
        scales: getGoogleMercatorScales(0, 28),
        currentZoomLvl: 0,
        minZoom: 0,
        onChange() {},
        readOnly: false,
        template: scale => scale < 1
            ? Math.round(1 / scale) + " : 1"
            : "1 : " + Math.round(scale),
        useRawInput: false,
        display: SCALE,
        useRawInput: false,
        disableScaleLockingParms: {}
    };

    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    }

    onComboChange = (event) => {
        let selectedZoomLvl = parseInt(event.nativeEvent.target.value, 10);
        this.props.onChange(selectedZoomLvl, this.props.scales[selectedZoomLvl]);
    };

    getOptions = () => {
        return this.props.scales.map((item, index) => {
            return (
                <option value={item.zoom} key={item.zoom}>{templates[this.props.display](item.value, item.zoom)}</option>
            );
        }).filter((element, index) => index >= this.props.minZoom);
    };

    render() {
        let control = null;
        const currentZoomLvl = Math.round(this.props.currentZoomLvl);
        if (this.props.readOnly) {
            control =
                <label>{templates[this.props.display](this.props.scales[currentZoomLvl], currentZoomLvl)}</label>
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
                        options={scales.map((item) => ({scale: item.value, zoom: item.zoom, value: item.zoom, label: templates[this.props.display](item.value, item.zoom)}))}
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
