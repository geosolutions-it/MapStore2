/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import {Checkbox  } from "react-bootstrap";

import Message from '../../../components/I18N/Message';
import {
    AUTOREFRESH_DEFAULT_REFRESH_INTERVAL,
    AUTOREFRESH_MINIMUM_REFRESH_INTERVAL
} from '../constants';
import AutoRefreshInformations from '../components/AutoRefreshInformations';
import AutoRefreshSettings from '../components/AutoRefreshSettings';

const AUTHORIZED_ACCESS_ROLES = ['ADMIN'];

/**
 * AutoRefresh container component. It manages the state and the logic of the AutoRefresh plugin.
 * @param {object} props - The props of the container
 * @param {number} props.defaultRefreshInterval - The default refresh interval in milliseconds
 * @param {number} props.minimumRefreshInterval - The minimum refresh interval in milliseconds
 * @param {array} props.userRoles - The array of user roles
 * @param {function} props.onUpdateNode - The function to update a node in the store
 * @param {boolean} props.enabled - Indicates if the auto-refresh is enabled
 * @param {array} props.availableLayers - The array of available layers for auto-refresh
 * @param {array} props.activeLayers - The array of currently active layers for auto-refresh
 * @param {function} props.onStart - The function to start the auto-refresh
 * @param {function} props.onStop - The function to stop the auto-refresh
 */
const AutoRefreshContainer = ({
    // Configured by the user when added to a Context
    defaultRefreshInterval = AUTOREFRESH_DEFAULT_REFRESH_INTERVAL,
    minimumRefreshInterval = AUTOREFRESH_MINIMUM_REFRESH_INTERVAL,

    // Common store
    userRoles,

    // Common actions
    onUpdateNode,

    // AutoRefresh store
    enabled,
    availableLayers,
    activeLayers,

    // AutoRefresh actions
    onStart,
    onStop
}) => {
    const [lastUpdatedText] = useState(null);

    const handleAutoRefreshActivated = (event) => {
        const { checked } = event.target || {};
        if (checked) {
            onStart();
        } else {
            onStop();
        }
    };

    return (<div className="ms-autorefresh-wrapper">
        <Checkbox id="autorefresh" inline checked={enabled} onChange={handleAutoRefreshActivated}>
            <Message msgId={lastUpdatedText ? 'autorefresh.label.lastUpdated' : 'autorefresh.label.default'}/>
        </Checkbox>

        {/* Admin users see the settings panel */}
        {AUTHORIZED_ACCESS_ROLES.includes(userRoles) && <AutoRefreshSettings
            defaultRefreshInterval={defaultRefreshInterval / 1000}
            minimumRefreshInterval={minimumRefreshInterval / 1000}
            availableLayers={availableLayers}
            activeLayers={activeLayers}
            onUpdateNode={onUpdateNode}
        />}
        {/* Non-admin users see the layers information's panel */}
        {!AUTHORIZED_ACCESS_ROLES.includes(userRoles) && <AutoRefreshInformations
            layers={Object.values(activeLayers)}/>}
    </div>);
};

export default AutoRefreshContainer;
