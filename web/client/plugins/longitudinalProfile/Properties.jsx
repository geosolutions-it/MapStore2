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
    changeChartTitle
} from "../../actions/longitudinalProfile";
import {
    configSelector,
    chartTitleSelector,
    distanceSelector,
    referentialSelector
} from '../../selectors/longitudinalProfile';

const Properties = ({
    chartTitle,
    config,
    distance,
    referential,
    onChangeReferential,
    onChangeDistance,
    onChangeChartTitle
}) => {
    return (
        <div className="longitudinal-container">
            <FormGroup>
                <ControlLabel><Message msgId="longitudinalProfile.settings.referential"/></ControlLabel>
                <Select
                    id="referential"
                    value={referential}
                    clearable={false}
                    options={config.referentials.map(r => ({value: r.layerName, label: r.title}))}
                    onChange={(selected) => onChangeReferential(selected?.value)}
                />
            </FormGroup>
            <FormGroup>
                <ControlLabel><Message msgId="longitudinalProfile.settings.distance"/></ControlLabel>
                <FormControl
                    id="distance"
                    min={1}
                    step={1}
                    type="number"
                    value={distance}
                    clearable={false}
                    onChange={(value) => onChangeDistance(value)}
                />
            </FormGroup>
            <FormGroup>
                <ControlLabel><Message msgId="longitudinalProfile.settings.chartTitle"/></ControlLabel>
                <FormControl
                    id="chartTitle"
                    value={chartTitle}
                    clearable={false}
                    onChange={(value) => onChangeChartTitle(value)}
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
            referentialSelector
        ],
        (
            chartTitle,
            config,
            distance,
            referential
        ) => ({
            chartTitle,
            config,
            distance,
            referential
        })), {
        onChangeChartTitle: changeChartTitle,
        onChangeDistance: changeDistance,
        onChangeReferential: changeReferential
    })(Properties);

export default PropertiesConnected;
