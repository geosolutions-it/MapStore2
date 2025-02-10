/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { FormGroup, Checkbox, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';
import { createSelector } from 'reselect';
import Message from '../../../components/I18N/Message';
import { updateMapOptions } from '../../../actions/map';
import ConfigUtils from '../../../utils/ConfigUtils';

import { mapSelector } from '../../../selectors/map';
import { mapTypeSelector, isCesium as isCesiumSelector } from '../../../selectors/maptype';
import localizedProps from '../../../components/misc/enhancers/localizedProps';
import utcDateWrapper from '../../../components/misc/enhancers/utcDateWrapper';
import { DATE_TYPE } from '../../../utils/FeatureGridUtils';
import { getMessageById } from '../../../utils/LocaleUtils';
import PropTypes from 'prop-types';
import DateTimePicker from '../../../components/misc/datetimepicker';

const mapStateToProps = createSelector(
    mapSelector,
    mapTypeSelector,
    isCesiumSelector,
    (map, mapType, isCesium) => ( { map, mapType, isCesium })
);

const actions = {
    updateConfigAction: updateMapOptions
};

const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

const Component = ({
    map,
    mapType,
    isCesium,
    updateConfigAction,
    mapOptions: defaultMapOptions
}, { messages }) => {
    const SelectLocalized = localizedProps(["placeholder", "options"])(Select);
    const DEFAULT_QUICK_TIME_SELECTORS = [
        {
            "type": DATE_TYPE.DATE_TIME,
            "value": "{now}+P0D",
            "labelId": "queryform.attributefilter.datefield.quickSelectors.now"
        },
        {
            "type": DATE_TYPE.DATE_TIME,
            "value": "{now}-P1D",
            "labelId": "queryform.attributefilter.datefield.quickSelectors.yesterday"
        },
        {
            "type": DATE_TYPE.DATE_TIME,
            "value": "{now}+P1D",
            "labelId": "queryform.attributefilter.datefield.quickSelectors.tomorrow"
        }
    ];

    const mapOptions = {
        ...(defaultMapOptions && defaultMapOptions[mapType]
            || ConfigUtils.getConfigProp("defaultMapOptions") && ConfigUtils.getConfigProp("defaultMapOptions")[mapType] || {}),
        ...map?.mapOptions
    };

    const handleConfigUpdate = (options, key) => {
        updateConfigAction({[key]: !options[key]});
    };

    return isCesium ? (
        <form>
            <FormGroup>
                <ControlLabel>
                    <Message msgId="map.settings.title" />
                </ControlLabel>
            </FormGroup>
            <Checkbox
                checked={mapOptions.showSkyAtmosphere}
                onChange={() => handleConfigUpdate(mapOptions, 'showSkyAtmosphere')}
            >
                <Message msgId="map.settings.skyAtmosphere" />
            </Checkbox>
            <Checkbox
                checked={mapOptions.showGroundAtmosphere}
                onChange={() => handleConfigUpdate(mapOptions, 'showGroundAtmosphere')}
            >
                <Message msgId="map.settings.groundAtmosphere" />
            </Checkbox>
            <Checkbox
                checked={mapOptions.enableFog}
                onChange={() => handleConfigUpdate(mapOptions, 'enableFog')}
            >
                <Message msgId="map.settings.fog" />
            </Checkbox>
            <Checkbox
                checked={mapOptions.depthTestAgainstTerrain}
                onChange={() => handleConfigUpdate(mapOptions, 'depthTestAgainstTerrain')}
            >
                <Message msgId="map.settings.depthTest" />
            </Checkbox>
            <>
                <label className="control-label"><Message msgId="map.settings.lighting3DOptions.title"/></label>
                <SelectLocalized
                    options={[
                        {label: "map.settings.lighting3DOptions.flashlightOption", value: "flashlight"},
                        {label: "map.settings.lighting3DOptions.sunlightOption", value: "sunlight"},
                        {label: "map.settings.lighting3DOptions.dateTimeOption", value: "dateTime"}
                    ]}
                    wrapperStyle = {{ marginTop: "10px"}}
                    value={mapOptions && mapOptions.lighting3DOption?.value || ""}
                    clearable={false}
                    onChange={(val) => {
                        if (val !== 'dateTime') {
                            updateConfigAction({"lighting3DOption": {value: val.value}});
                        } else {
                            updateConfigAction({"lighting3DOption": {value: val.value, dateTime: new Date().toISOString()}});
                        }
                    }}
                    placeholder="map.settings.lighting3DOptions.placeholder"
                />
                {mapOptions?.lighting3DOption?.value === 'dateTime' ?
                    <UTCDateTimePicker
                        value={mapOptions.lighting3DOption?.dateTime ? new Date(mapOptions.lighting3DOption?.dateTime) : new Date()}
                        quickDateTimeSelectors={DEFAULT_QUICK_TIME_SELECTORS}
                        hideOperator
                        time
                        calendar
                        type={'date-time'}
                        onChange={(date) => {
                            updateConfigAction({"lighting3DOption": {...mapOptions.lighting3DOption, dateTime: date}});
                        }}
                        placeholder={getMessageById(messages, "map.settings.lighting3DOptions.dateTimePlaceholder")} /> :
                    null}
            </>
        </form>
    ) : null;
};
Component.contextTypes = {
    messages: PropTypes.object
};
export default connect(mapStateToProps, actions)(Component);
