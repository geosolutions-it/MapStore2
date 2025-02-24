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
            <FormGroup>
                <ControlLabel><Message msgId="map.settings.lightings.title"/></ControlLabel>
                <SelectLocalized
                    options={[
                        {label: "map.settings.lightings.sunlightOption", value: "sunlight"},
                        {label: "map.settings.lightings.flashlightOption", value: "flashlight"},
                        {label: "map.settings.lightings.dateTimeOption", value: "dateTime"}
                    ]}
                    wrapperStyle = {{ marginTop: "10px"}}
                    value={mapOptions && mapOptions.lighting?.value || "sunlight"}
                    clearable={false}
                    onChange={(val) => {
                        if (val !== 'dateTime') {
                            updateConfigAction({"lighting": {value: val.value}});
                        } else {
                            updateConfigAction({"lighting": {value: val.value, dateTime: new Date().toISOString()}});
                        }
                    }}
                    placeholder="map.settings.lightings.placeholder"
                />
                {mapOptions?.lighting?.value === 'dateTime' ?
                    <div className="lighting-dateTime-picker">
                        <UTCDateTimePicker
                            value={mapOptions.lighting?.dateTime ? new Date(mapOptions.lighting?.dateTime) : new Date()}
                            hideOperator
                            time
                            popupPosition={"top"}
                            calendar
                            type={'date-time'}
                            onChange={(date) => {
                                updateConfigAction({"lighting": {...mapOptions.lighting, dateTime: date}});
                            }}
                            placeholder={getMessageById(messages, "map.settings.lightings.dateTimePlaceholder")} />
                    </div> :
                    null}
            </FormGroup>
        </form>
    ) : null;
};
Component.contextTypes = {
    messages: PropTypes.object
};
export default connect(mapStateToProps, actions)(Component);
