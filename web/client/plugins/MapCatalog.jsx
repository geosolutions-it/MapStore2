/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { toggleControl } from '../actions/controls';
import {
    setFilterReloadDelay,
    triggerReload,
    saveMap,
    deleteMap
} from '../actions/mapcatalog';
import { userSelector } from '../selectors/security';
import {
    triggerReloadValueSelector,
    filterReloadDelaySelector,
    mapTypeSelector
} from '../selectors/mapcatalog';

import MapCatalogPanel from '../components/mapcatalog/MapCatalogPanel';
import Message from '../components/I18N/Message';
import { createPlugin } from '../utils/PluginsUtils';

import mapcatalog from '../reducers/mapcatalog';
import * as epics from '../epics/mapcatalog';
import {mapLayoutValuesSelector} from "../selectors/maplayout";
import * as PropTypes from "prop-types";
import ResponsivePanel from "../components/misc/panels/ResponsivePanel";

/**
 * Allows users to existing maps directly on the map.
 * @memberof plugins
 * @class
 * @name MapCatalog
 */
class MapCatalogComponent extends React.Component {
    static propTypes = {
        allow3d: PropTypes.any,
        active: PropTypes.any,
        mapType: PropTypes.any,
        user: PropTypes.any,
        triggerReloadValue: PropTypes.any,
        filterReloadDelay: PropTypes.any,
        onToggleControl: PropTypes.func,
        onTriggerReload: PropTypes.func,
        onDelete: PropTypes.func,
        onSave: PropTypes.func,
        dockStyle: PropTypes.object,
        size: PropTypes.number
    };
    static defaultProps = {
        onToggleControl: () => {
        }, onTriggerReload: () => {
        }, onDelete: () => {
        }, onSave: () => {
        }, dockStyle: {},
        size: 550
    };

    render() {
        const {
            allow3d,
            active,
            mapType,
            user,
            triggerReloadValue,
            filterReloadDelay,
            onToggleControl,
            onTriggerReload,
            onDelete,
            onSave,
            dockStyle,
            size,
            ...props
        } = this.props;
        return (
            <ResponsivePanel
                containerStyle={dockStyle}
                containerId="map-catalog-container"
                containerClassName="dock-container"
                className="map-catalog-dock-panel"
                open={active}
                position="right"
                size={size}
                bsStyle="primary"
                glyph="maps-catalog"
                title={<Message msgId="mapCatalog.title"/>}
                onClose={() => onToggleControl()}
                style={dockStyle}
            >
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
            </ResponsivePanel>
        );
    }
}


export default createPlugin('MapCatalog', {
    component: connect(createStructuredSelector({
        active: state => state.controls && state.controls.mapCatalog && state.controls.mapCatalog.enabled,
        mapType: mapTypeSelector,
        user: userSelector,
        triggerReloadValue: triggerReloadValueSelector,
        filterReloadDelay: filterReloadDelaySelector,
        dockStyle: state => mapLayoutValuesSelector(state, { height: true, right: true }, true)
    }), {
        setFilterReloadDelay,
        onToggleControl: toggleControl.bind(null, 'mapCatalog', 'enabled'),
        onTriggerReload: triggerReload,
        onDelete: deleteMap,
        onSave: saveMap
    })(MapCatalogComponent),
    containers: {
        BurgerMenu: {
            name: 'mapCatalog',
            position: 6,
            text: <Message msgId="mapCatalog.title" />,
            icon: <Glyphicon glyph="maps-catalog" />,
            tooltip: "mapCatalog.tooltip",
            action: () => toggleControl('mapCatalog', 'enabled'),
            priority: 2,
            doNotHide: true
        },
        SidebarMenu: {
            name: "mapCatalog",
            position: 6,
            icon: <Glyphicon glyph="maps-catalog" />,
            text: <Message msgId="mapCatalog.title" />,
            tooltip: "mapCatalog.tooltip",
            action: () => toggleControl('mapCatalog', 'enabled'),
            toggle: true,
            priority: 1,
            doNotHide: true
        }
    },
    reducers: {
        mapcatalog
    },
    epics
});
