/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { Dropdown, Glyphicon, Checkbox  } from "react-bootstrap";

import {
    NodeTypes
} from '../../../utils/LayersUtils';

import AutoRefreshForm from '../components/AutoRefreshForm';
import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonRB from '../../../components/misc/Button';
import AutoRefreshMenu from '../components/AutoRefreshMenu';
import { AUTOREFRESH_DEFAULT_REFRESH_INTERVAL, AUTOREFRESH_MINIMUM_REFRESH_INTERVAL, generateAutorefreshLayerOptions } from '../constants';
import AutoRefreshInformations from '../components/AutoRefreshInformations';

const Button = tooltip(ButtonRB);
const LAYER_TYPES_TO_FOLLOW = ['wms', "wfs"];
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
    defaultRefreshInterval = AUTOREFRESH_DEFAULT_REFRESH_INTERVAL,
    minimumRefreshInterval = AUTOREFRESH_MINIMUM_REFRESH_INTERVAL,
    enabled,
    onSetEnabled,
    userRoles,
    layers,
    onUpdateNode
}) => {
    const [filteredLayers, setFilteredLayers] = useState({});
    const [activeLayers, setActiveLayers] = useState({});
    const [lastUpdatedText] = useState(null);
    const [settingsToggled, setSettingsToggled] = useState(false);

    const handleAutorefreshActivated = (event) => {
        const { checked } = event.target || {};
        onSetEnabled(checked, activeLayers);
    };

    const handleIntervalChange = (interval, layerId) => {
        onUpdateNode(layerId, NodeTypes.LAYER, generateAutorefreshLayerOptions(interval));
    };

    const handleAddLayer = (layerId, interval) => {
        onUpdateNode(layerId, NodeTypes.LAYER, generateAutorefreshLayerOptions(interval));
    };

    const handleRemoveLayer = (layerId) =>{
        onUpdateNode(layerId, NodeTypes.LAYER, generateAutorefreshLayerOptions(-1));
    };

    useEffect(() => {
        const availables = layers.filter(l => !LAYER_GROUPS_TO_IGNORE.includes(l.group) && LAYER_TYPES_TO_FOLLOW.includes(l.type));
        const actives = availables.filter(l => l.autorefreshInterval > -1);

        const availableLayers = availables.filter(l => !actives.includes(l)).reduce((acc, l) => {
            acc[l.id] = l;
            return acc;
        }, {});

        setFilteredLayers(availableLayers);

        setActiveLayers(actives.reduce((acc, l) => {
            acc[l.id] = l;
            return acc;
        }, {}));
    }, [layers]);

    return (<div className="ms-autorefresh-wrapper">
        {/* Only show the layers summary to non-admin users,
            since for admin users the summary is already visible in the settings dropdown
        */}
        {!AUTHORIZED_ACCESS_ROLES.includes(userRoles) && <AutoRefreshInformations layers={Object.values(activeLayers)}/>}

        <Checkbox id="autorefresh" inline checked={enabled ?? false} onChange={handleAutorefreshActivated}>
            <Message msgId={lastUpdatedText ? 'autorefresh.label.lastUpdated' : 'autorefresh.label.default'}/>
        </Checkbox>

        {AUTHORIZED_ACCESS_ROLES.includes(userRoles) && <Dropdown id="ms-autorefresh-selector"
            dropup
            onToggle={(toggled) => setSettingsToggled(toggled)}>
            <Button bsRole="toggle"
                bsStyle="primary"
                className={`square-button btn btn-${settingsToggled ? 'success' : 'primary'}`}
                tooltip={<Message msgId="autorefresh.selector"/>}
                tooltipPosition="top">
                <Glyphicon glyph="cog" />
            </Button>
            <AutoRefreshMenu bsRole="menu" >
                <AutoRefreshForm
                    defaultRefreshInterval={defaultRefreshInterval / 1000}
                    minimumRefreshInterval={minimumRefreshInterval / 1000}
                    availableLayers={filteredLayers}
                    activeLayers={activeLayers}
                    handleIntervalChange={handleIntervalChange}
                    handleAddLayer={handleAddLayer}
                    handleRemoveLayer={handleRemoveLayer}/>
            </AutoRefreshMenu>
        </Dropdown>}
    </div>);
};

export default AutoRefreshContainer;
