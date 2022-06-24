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
import Message from '../../../components/I18N/Message';
import { createSelector } from 'reselect';
import { updateMapOptions } from '../../../actions/map';
import ConfigUtils from '../../../utils/ConfigUtils';

import { mapSelector } from '../../../selectors/map';
import { mapTypeSelector, isCesium as isCesiumSelector } from '../../../selectors/maptype';

const mapStateToProps = createSelector(
    mapSelector,
    mapTypeSelector,
    isCesiumSelector,
    (map, mapType, isCesium) => ( { map, mapType, isCesium })
);

const actions = {
    updateConfigAction: updateMapOptions
};

const Component = ({
    map,
    mapType,
    isCesium,
    updateConfigAction,
    mapOptions: defaultMapOptions
}) => {

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
        </form>
    ) : null;
};

export default connect(mapStateToProps, actions)(Component);
