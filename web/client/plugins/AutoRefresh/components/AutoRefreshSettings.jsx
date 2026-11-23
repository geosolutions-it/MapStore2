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

/**
 * Connect interval settings in seconds to layer property patches in milliseconds.
 * @function AutoRefreshSettingsForm
 * @param {object} props Component props.
 * @param {number} props.defaultRefreshInterval Default interval in seconds.
 * @param {number} props.minimumRefreshInterval Minimum interval in seconds.
 * @param {object[]} props.availableLayers Datasets available to add.
 * @param {object[]} props.activeLayers Configured datasets with intervals in milliseconds.
 * @param {function} props.onUpdateNode Called with dataset key, NodeTypes.LAYER and the interval patch.
 * @returns {React.ReactElement} Editable refresh settings form.
 */
export const AutoRefreshSettingsForm = ({
    defaultRefreshInterval,
    minimumRefreshInterval,
    availableLayers,
    activeLayers,
    onUpdateNode
}) => {

    /**
     * Validate and clamp an interval before converting it to a millisecond layer patch.
     * @param {number} interval Requested interval in seconds.
     * @param {string} layerId Dataset key to configure.
     * @returns {void}
     */
    const handleIntervalChange = (interval, layerId) => {
        const i = Number.isFinite(interval) && interval > 0 && interval <= AUTOREFRESH_MAXIMUM_REFRESH_INTERVAL / 1000 ? interval : defaultRefreshInterval;
        onUpdateNode(layerId, NodeTypes.LAYER, generateAutoRefreshLayerOptions(Math.max(minimumRefreshInterval, i) * 1000));
    };

    /**
     * Configure a previously unconfigured dataset.
     * @param {string} layerId Dataset key to add.
     * @param {number} interval Initial interval in seconds.
     * @returns {void}
     */
    const handleAddLayer = (layerId, interval) => {
        handleIntervalChange(interval, layerId);
    };

    /**
     * Remove the saved refresh interval from every instance of a dataset.
     * @param {string} layerId Dataset key to remove.
     * @returns {void}
     */
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

/**
 * Render the map footer's refresh settings dropdown.
 * @function AutoRefreshSettings
 * @param {object} props Settings props forwarded to AutoRefreshSettingsForm; interval values are in seconds.
 * @returns {React.ReactElement} Settings dropdown.
 */
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
