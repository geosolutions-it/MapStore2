/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { toggleControl } from '../actions/controls';
import {
    setFilterReloadDelay,
    triggerReload,
    saveMap,
    deleteMap
} from '../actions/mapcatalog';
import { mapTypeSelector } from '../selectors/maptype';
import { userSelector } from '../selectors/security';
import {
    triggerReloadValueSelector,
    filterReloadDelaySelector
} from '../selectors/mapcatalog';

import MapCatalogPanel from '../components/mapcatalog/MapCatalogPanel';
import DockPanel from '../components/misc/panels/DockPanel';
import Message from '../components/I18N/Message';
import { createPlugin } from '../utils/PluginsUtils';

import mapcatalog from '../reducers/mapcatalog';
import * as epics from '../epics/mapcatalog';

/**
 * Allows users to existing maps directly on the map.
 * @memberof plugins
 * @class
 * @name MapCatalog
 */
const MapCatalogComponent = ({
    active,
    mapType,
    user,
    triggerReloadValue,
    filterReloadDelay,
    onToggleControl = () => {},
    onTriggerReload = () => {},
    onDelete = () => {},
    onSave = () => {},
    ...props
}) => {
    return (
        <DockPanel
            className="map-catalog-dock-panel"
            open={active}
            position="right"
            size={660}
            bsStyle="primary"
            glyph="maps-catalog"
            title={<Message msgId="mapCatalog.title"/>}
            onClose={() => onToggleControl()}
            style={{ height: 'calc(100% - 30px)' }}>
            <MapCatalogPanel
                mapType={mapType}
                user={user}
                triggerReloadValue={triggerReloadValue}
                filterReloadDelay={filterReloadDelay}
                setFilterReloadDelay={props.setFilterReloadDelay}
                onTriggerReload={onTriggerReload}
                onDelete={onDelete}
                onSave={onSave}
                getShareUrl={(map) => map.contextName ?
                    `context/${map.contextName}/${map.id}` :
                    `viewer/${mapType}/${map.id}`
                }
                toggleCatalog={() => onToggleControl()}
                shareApi/>
        </DockPanel>
    );
};

export default createPlugin('MapCatalog', {
    component: connect(createStructuredSelector({
        active: state => state.controls && state.controls.mapCatalog && state.controls.mapCatalog.enabled,
        mapType: mapTypeSelector,
        user: userSelector,
        triggerReloadValue: triggerReloadValueSelector,
        filterReloadDelay: filterReloadDelaySelector
    }), {
        setFilterReloadDelay,
        onToggleControl: toggleControl.bind(null, 'mapCatalog', 'enabled'),
        onTriggerReload: triggerReload,
        onDelete: deleteMap,
        onSave: saveMap
    })(MapCatalogComponent),
    containers: {
        BurgerMenu: {
            name: 'mapcatalog',
            position: 6,
            text: <Message msgId="mapCatalog.title" />,
            icon: <Glyphicon glyph="maps-catalog" />,
            action: () => toggleControl('mapCatalog', 'enabled'),
            priority: 2,
            doNotHide: true
        }
    },
    reducers: {
        mapcatalog
    },
    epics
});
