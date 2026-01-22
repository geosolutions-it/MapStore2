/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { Dropdown, Form, FormGroup, Glyphicon, Checkbox  } from "react-bootstrap";

import AutoRefreshForm from '../components/AutoRefreshForm';
import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonRB from '../../../components/misc/Button';
import AutoRefreshMenu from '../components/AutoRefreshMenu';
import AutoRefreshService from '../services/AutoRefreshService';
import { CONTROL_NAME } from '../constants';

const Button = tooltip(ButtonRB);
const LAYER_TYPES_TO_FOLLOW = ['wms', "wfs"];
const AUTHORIZED_ACCESS_ROLES = ['ADMIN'];

const AutoRefreshContainer = ({
    userRoles,
    map,
    layers,
    enabled,
    interval,
    activeLayerIds,
    onSetLayerIds,
    onSetEnabled,
    onSetInterval}) => {

    const [layersToFollow, setLayersToFollow] = useState([]);
    const [lastUpdatedText, setLastUpdatedText] = useState(null);
    const [settingsToggled, setSettingsToggled] = useState(false);

    const handleAutorefreshActivated = (event) => {
        const { checked } = event.target || {};
        console.debug('[arxit] Activated change', checked);

        onSetEnabled(checked);
    };

    const handleIntervalChange = (event) => {
        const { value } = event.target || {};
        console.debug('[arxit] Interval change', value);

        onSetInterval(value);
    };

    const handleLayerEnabilityChange = (event, layer) => {
        const { checked } = event.target || {};

        if (checked) {
            onSetLayerIds([...activeLayerIds, layer.id]);
        } else {
            onSetLayerIds(activeLayerIds.filter(x => x !== layer.id));
        }
    };

    useEffect(() => {
        console.debug('[arxit] layers', layers);
        const copy = layers.filter(l => LAYER_TYPES_TO_FOLLOW.includes(l.type)).map(x => structuredClone(x));
        for (let i = 0; i < 1000; i++) {
            const c = structuredClone(copy[0]);
            c.id = crypto.randomUUID();
            copy.push(c);
        }
        setLayersToFollow(copy);
    }, [layers]);

    useEffect(() => {
        AutoRefreshService.onLastUpdated(lastUpdated => setLastUpdatedText(lastUpdated?.toLocaleDateString()));
    }, []);

    return (<div className="ms-autorefresh-wrapper">
        <Form>
            <FormGroup bsSize="small">
                <Checkbox id="autorefresh" inline checked={enabled ?? false} onChange={handleAutorefreshActivated}>
                    <Message msgId={lastUpdatedText ? 'autorefresh.label.lastUpdated' : 'autorefresh.label.default'}/>
                </Checkbox>
            </FormGroup>
        </Form>
        {AUTHORIZED_ACCESS_ROLES.includes(userRoles) && <Dropdown id="autorefresh-selector"
            dropup
            bsClass="ms-autorefresh-selector"
            onToggle={(toggled) => setSettingsToggled(toggled)}>
            <Button bsRole="toggle"
                bsStyle="primary"
                className={`square-button-sm btn-${settingsToggled ? 'success' : 'primary'}`}
                tooltip={<Message msgId="autorefresh.selector"/>}
                tooltipPosition="top">
                <Glyphicon glyph="cog" />
            </Button>
            <AutoRefreshMenu bsRole="menu" >
                <AutoRefreshForm
                    interval={interval}
                    layers={layersToFollow}
                    activeLayerIds={activeLayerIds}
                    handleIntervalChange={handleIntervalChange}
                    handleLayerEnabilityChange={handleLayerEnabilityChange}/>
            </AutoRefreshMenu>
        </Dropdown>}
    </div>);
};

export default AutoRefreshContainer;
