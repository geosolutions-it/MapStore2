/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Checkbox, Dropdown, Glyphicon } from 'react-bootstrap';
import Message from '../../../components/I18N/Message';
import { ButtonWithTooltip } from '../../../components/misc/Button';
import { AUTOREFRESH_DEFAULT_REFRESH_INTERVAL, AUTOREFRESH_MINIMUM_REFRESH_INTERVAL, formatDate } from '../constants';
import AutoRefreshInformations from '../components/AutoRefreshInformations';
import AutoRefreshSettings, { AutoRefreshSettingsForm } from '../components/AutoRefreshSettings';
import AutoRefreshMenu from '../components/AutoRefreshMenu';
import AutoRefreshLayerRow from '../components/AutoRefreshLayerRow';

const AutoRefreshContainer = ({
    defaultRefreshInterval = AUTOREFRESH_DEFAULT_REFRESH_INTERVAL,
    minimumRefreshInterval = AUTOREFRESH_MINIMUM_REFRESH_INTERVAL,
    canConfigure = false,
    enabled = false,
    paused = false,
    lastRefresh,
    availableLayers = [],
    activeLayers = [],
    eligibleCount = 0,
    sidebar = false,
    onUpdateNode = () => {},
    onStart = () => {},
    onStop = () => {},
    onRefreshNow = () => {}
}) => {
    const settings = {
        defaultRefreshInterval: defaultRefreshInterval / 1000,
        minimumRefreshInterval: minimumRefreshInterval / 1000,
        availableLayers, activeLayers, onUpdateNode
    };
    const summary = activeLayers.map(layer => `${layer.title}: ${layer.autoRefreshInterval / 1000}s`).join('\n');
    const controls = (<>
        <Checkbox id={sidebar ? 'autorefresh-dashboard' : 'autorefresh'} inline checked={enabled} title={summary}
            onChange={event => event.target.checked ? onStart() : onStop()}>
            <Message msgId="autorefresh.label.default"/>
        </Checkbox>
        <ButtonWithTooltip bsStyle="link" className="ms-autorefresh-button" disabled={!eligibleCount || paused}
            tooltipId="autorefresh.label.refreshNow" onClick={() => onRefreshNow()}>
            <Glyphicon glyph="refresh"/>
        </ButtonWithTooltip>
        {paused && <span role="status"><Message msgId="autorefresh.label.paused"/></span>}
        {lastRefresh && <time className="ms-autorefresh-last-refresh" dateTime={new Date(lastRefresh).toISOString()}>
            <Message msgId="autorefresh.label.lastUpdated"/>: {formatDate(lastRefresh)}
        </time>}
    </>);
    if (sidebar) {
        return (<Dropdown id="ms-autorefresh-dashboard">
            <ButtonWithTooltip bsRole="toggle" bsStyle={enabled ? 'primary' : 'tray'} className="square-button btn btn-tray"
                tooltipId="autorefresh.label.default" tooltipPosition="left">
                <Glyphicon glyph="refresh"/>
            </ButtonWithTooltip>
            <AutoRefreshMenu bsRole="menu" sidebar>
                <div className="ms-autorefresh-wrapper">{controls}</div>
                {canConfigure ? <AutoRefreshSettingsForm {...settings}/>
                    : <div className="ms-autorefresh-layers-summary">
                        {!activeLayers.length && <Message msgId="autorefresh.label.noLayers"/>}
                        {activeLayers.map(layer => <AutoRefreshLayerRow key={layer.id} layer={layer}/>)}
                    </div>}
            </AutoRefreshMenu>
        </Dropdown>);
    }
    return (<div className="ms-autorefresh-wrapper">
        {controls}
        {canConfigure ? <AutoRefreshSettings {...settings}/> : <AutoRefreshInformations layers={activeLayers}/>}
    </div>);
};

export default AutoRefreshContainer;
