/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from "react";
import { FormGroup, ControlLabel } from 'react-bootstrap';
import { connect } from 'react-redux';
import Select from "react-select";
import { createSelector } from 'reselect';

import Message from "../../components/I18N/Message";
import FormControl from '../../components/misc/DebouncedFormControl';
import {
    changeReferential,
    changeDistance,
    changePitch,
    changeChartTitle
} from "../../actions/longitudinalProfile";
import {
    configSelector,
    chartTitleSelector,
    distanceSelector,
    pitchSelector,
    referentialSelector
} from '../../selectors/longitudinalProfile';

const Properties = ({
    chartTitle,
    config,
    distance,
    pitch,
    referential,
    onChangeReferential,
    onChangeDistance,
    onChangePitch,
    onChangeChartTitle
}) => {
    return (
        <div className="longitudinal-container">
            <FormGroup bsSize="small">
                <ControlLabel><Message msgId="longitudinalProfile.settings.referential"/></ControlLabel>
                <Select
                    id="referential"
                    value={referential}
                    clearable={false}
                    options={config.referentials.map(r => ({value: r.layerName, label: r.title}))}
                    onChange={(selected) => onChangeReferential(selected?.value)}
                />
            </FormGroup>
            <FormGroup bsSize="small">
                <ControlLabel><Message msgId="longitudinalProfile.settings.distance"/></ControlLabel>
                <Select
                    id="distance"
                    value={distance}
                    clearable={false}
                    options={config.distances.map(r => ({value: r, label: r}))}
                    onChange={(selected) => onChangeDistance(selected?.value)}
                />
            </FormGroup>
            <FormGroup bsSize="small">
                <ControlLabel><Message msgId="longitudinalProfile.settings.chartTitle"/></ControlLabel>
                <FormControl
                    id="chartTitle"
                    value={chartTitle}
                    clearable={false}
                    onChange={(value) => onChangeChartTitle(value)}
                />
            </FormGroup>
            <FormGroup bsSize="small">
                <ControlLabel><Message msgId="longitudinalProfile.settings.pitch"/></ControlLabel>
                <FormControl
                    id="pitch"
                    value={pitch}
                    clearable={false}
                    onChange={(value) => onChangePitch(value)}
                />
            </FormGroup>
        </div>
    );
};

const PropertiesConnected = connect(
    createSelector(
        [
            chartTitleSelector,
            configSelector,
            distanceSelector,
            pitchSelector,
            referentialSelector
        ],
        (
            chartTitle,
            config,
            distance,
            pitch,
            referential
        ) => ({
            chartTitle,
            config,
            distance,
            pitch,
            referential
        })), {
        onChangeChartTitle: changeChartTitle,
        onChangeDistance: changeDistance,
        onChangePitch: changePitch,
        onChangeReferential: changeReferential
    })(Properties);

export default PropertiesConnected;
