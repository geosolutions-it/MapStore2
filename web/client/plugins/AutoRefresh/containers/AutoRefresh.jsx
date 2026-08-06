/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import {Checkbox  } from "react-bootstrap";

import {
    hasAutoRefreshCapability
} from '../../../utils/LayersUtils';
import Message from '../../../components/I18N/Message';
import {
    AUTOREFRESH_DEFAULT_REFRESH_INTERVAL,
    AUTOREFRESH_MINIMUM_REFRESH_INTERVAL
} from '../constants';
import AutoRefreshInformations from '../components/AutoRefreshInformations';
import AutoRefreshSettings from '../components/AutoRefreshSettings';

// Do not consider background layers, since they are not expected to be updated frequently
// and they are not visible in the layer switcher,
// so they cannot be selected by the user in the settings
const LAYER_GROUPS_TO_IGNORE = ['background'];
const AUTHORIZED_ACCESS_ROLES = ['ADMIN'];

/**
 * AutoRefresh container component. It manages the state and the logic of the AutoRefresh plugin.
 * @param {object} props - The props of the container
 * @param {number} props.defaultRefreshInterval - The default refresh interval in milliseconds
 * @param {number} props.minimumRefreshInterval - The minimum refresh interval in milliseconds
 */
const AutoRefreshContainer = ({
    // Configured by the user when added to a Context
    defaultRefreshInterval = AUTOREFRESH_DEFAULT_REFRESH_INTERVAL,
    minimumRefreshInterval = AUTOREFRESH_MINIMUM_REFRESH_INTERVAL,

    // Common store
    userRoles,
    mapType,
    layers,

    // Common actions
    onUpdateNode,

    // AutoRefresh store
    enabled,
    availableLayers,
    activeLayers,
    ticks,

    // AutoRefresh actions
    onStart,
    onStop,
    onUpdateAvailableLayers
}) => {
    const [lastUpdatedText] = useState(null);

    const handleAutorefreshActivated = (event) => {
        const { checked } = event.target || {};
        if (checked) {
            onStart();
        } else {
            onStop();
        }
    };

    useEffect(() => {
        const availables = layers.filter(l => !LAYER_GROUPS_TO_IGNORE.includes(l.group) && hasAutoRefreshCapability(l.type, mapType));

        onUpdateAvailableLayers(availables.reduce((acc, layer) => {
            acc[layer.id] = layer;
            return acc;
        }, {}));
    }, [layers]);


    return (<div className="ms-autorefresh-wrapper">
        <Checkbox id="autorefresh" inline checked={enabled} onChange={handleAutorefreshActivated}>
            <Message msgId={lastUpdatedText ? 'autorefresh.label.lastUpdated' : 'autorefresh.label.default'}/>
        </Checkbox>

        {/* Non-admin users see the layers information's panel,
            Admin users see the settings panel
        */}
        {AUTHORIZED_ACCESS_ROLES.includes(userRoles) && <AutoRefreshSettings
            defaultRefreshInterval={defaultRefreshInterval / 1000}
            minimumRefreshInterval={minimumRefreshInterval / 1000}
            ticks={ticks}
            availableLayers={availableLayers}
            activeLayers={activeLayers}
            onUpdateNode={onUpdateNode}
        />}
        {!AUTHORIZED_ACCESS_ROLES.includes(userRoles) && <AutoRefreshInformations
            ticks={ticks}
            layers={Object.values(activeLayers)}/>}
    </div>);
};

export default AutoRefreshContainer;
