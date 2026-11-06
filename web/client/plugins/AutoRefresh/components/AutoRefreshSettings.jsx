/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon, Dropdown } from 'react-bootstrap';

import Message from '../../../components/I18N/Message';
import AutoRefreshMenu from './AutoRefreshMenu';
import AutoRefreshForm from './AutoRefreshForm';
import { NodeTypes } from '../../../utils/LayersUtils';
import { generateAutoRefreshLayerOptions, AUTOREFRESH_MAXIMUM_REFRESH_INTERVAL } from '../constants';
import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonRB from '../../../components/misc/Button';

const Button = tooltip(ButtonRB);

export const AutoRefreshSettingsForm = ({
    defaultRefreshInterval,
    minimumRefreshInterval,
    availableLayers,
    activeLayers,
    onUpdateNode
}) => {

    const handleIntervalChange = (interval, layerId) => {
        const i = Number.isFinite(interval) && interval > 0 && interval <= AUTOREFRESH_MAXIMUM_REFRESH_INTERVAL / 1000 ? interval : defaultRefreshInterval;
        onUpdateNode(layerId, NodeTypes.LAYER, generateAutoRefreshLayerOptions(Math.max(minimumRefreshInterval, i) * 1000));
    };

    const handleAddLayer = (layerId, interval) => {
        handleIntervalChange(interval, layerId);
    };

    const handleRemoveLayer = (layerId) =>{
        onUpdateNode(layerId, NodeTypes.LAYER, generateAutoRefreshLayerOptions(undefined));
    };

    return (<AutoRefreshForm
        defaultRefreshInterval={defaultRefreshInterval}
        minimumRefreshInterval={minimumRefreshInterval}
        availableLayers={availableLayers}
        activeLayers={activeLayers}
        handleIntervalChange={handleIntervalChange}
        handleAddLayer={handleAddLayer}
        handleRemoveLayer={handleRemoveLayer}/>);
};

const AutoRefreshSettings = props => (<Dropdown id="ms-autorefresh-selector" dropup>
    <Button bsRole="toggle"
        bsStyle="link"
        className="ms-autorefresh-button"
        tooltip={<Message msgId="autorefresh.selector"/>}
        tooltipPosition="top">
        <Glyphicon glyph="cog" />
    </Button>
    <AutoRefreshMenu bsRole="menu" >
        <AutoRefreshSettingsForm {...props}/>
    </AutoRefreshMenu>
</Dropdown>);

export default AutoRefreshSettings;
