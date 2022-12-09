/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { omit } from 'lodash';
import React from 'react';
import { withHandlers } from 'recompose';

import BorderLayout from '../../layout/BorderLayout';
import LoadingSpinner from '../../misc/LoadingSpinner';
import MapViewComp from './MapView';
import WidgetContainer from './WidgetContainer';
import MapSwitcher from "../builder/wizard/map/MapSwitcher";

const MapView = withHandlers({
    onMapViewChanges: ({ updateProperty = () => { }, id }) => ({layers, ...map}) => updateProperty(id, 'maps', map, "merge")
})(MapViewComp);

export default ({
    updateProperty = () => { },
    toggleDeleteConfirm = () => { },
    id, title,
    map = {},
    maps = [],
    selectedMapId,
    icons,
    hookRegister,
    mapStateSource,
    topRightItems,
    options = {},
    confirmDelete = false,
    loading = false,
    dataGrid = {},
    onDelete = () => {},
    headerStyle,
    env,
    selectionActive
} = {}) => {
    const { size: {height: mapHeight, width: mapWidth} = {}, mapInfoControl } = map;
    const enablePopupTools = mapHeight > 400 && mapWidth > 400 && mapInfoControl;
    return (<WidgetContainer className={"map-widget-view"} id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
        icons={icons}
        topRightItems={[
            <MapSwitcher
                className={'map-switcher'}
                maps={maps}
                onChange={(...args) => updateProperty(id, ...args)}
                value={selectedMapId}
                disabled={selectionActive}
            />,
            ...topRightItems]
        }
        isDraggable={dataGrid.isDraggable}
        options={options}
    >
        <BorderLayout
            footer={loading
                ? <div className={"widget-footer"}>
                    <span style={{ "float": "right"}}><LoadingSpinner /></span>
                </div>
                : null
            }>
            <MapView
                tools={enablePopupTools ? ['popup'] : []}
                updateProperty={updateProperty}
                id={id}
                map={{
                    ...omit(map, 'mapStateSource')
                }}
                mapStateSource={mapStateSource}
                hookRegister={hookRegister}
                layers={map && map.layers}
                options={{ style: { margin: '0 10px 10px 10px', height: 'calc(100% - 10px)' }}}
                env={env}
            />
        </BorderLayout>

    </WidgetContainer>);
};
