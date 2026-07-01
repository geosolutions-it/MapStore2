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
import { generateAutorefreshLayerOptions } from '../constants';
import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonRB from '../../../components/misc/Button';

const Button = tooltip(ButtonRB);

const AutoRefreshSettings = ({
    defaultRefreshInterval,
    minimumRefreshInterval,
    availableLayers,
    activeLayers,
    ticks,
    onUpdateNode
}) => {

    const handleIntervalChange = (interval, layerId) => {
        onUpdateNode(layerId, NodeTypes.LAYER, generateAutorefreshLayerOptions(interval));
    };

    const handleAddLayer = (layerId, interval) => {
        onUpdateNode(layerId, NodeTypes.LAYER, generateAutorefreshLayerOptions(interval));
    };

    const handleRemoveLayer = (layerId) =>{
        onUpdateNode(layerId, NodeTypes.LAYER, generateAutorefreshLayerOptions(-1));
    };

    return (<Dropdown id="ms-autorefresh-selector" dropup>
        <Button bsRole="toggle"
            bsStyle="link"
            className="ms-autorefresh-button"
            tooltip={<Message msgId="autorefresh.selector"/>}
            tooltipPosition="top">
            <Glyphicon glyph="cog" />
        </Button>
        <AutoRefreshMenu bsRole="menu" >
            <AutoRefreshForm
                ticks={ticks}
                defaultRefreshInterval={defaultRefreshInterval}
                minimumRefreshInterval={minimumRefreshInterval}
                availableLayers={availableLayers}
                activeLayers={activeLayers}
                handleIntervalChange={handleIntervalChange}
                handleAddLayer={handleAddLayer}
                handleRemoveLayer={handleRemoveLayer}/>
        </AutoRefreshMenu>
    </Dropdown>);
};

export default AutoRefreshSettings;
