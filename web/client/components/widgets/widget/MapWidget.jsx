import { omit } from 'lodash';
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { withHandlers } from 'recompose';

import BorderLayout from '../../layout/BorderLayout';
import LoadingSpinner from '../../misc/LoadingSpinner';
import MapViewComp from './MapView';
import WidgetContainer from './WidgetContainer';

const MapView = withHandlers({
    onMapViewChanges: ({ updateProperty = () => { } }) => ({layers, ...map}) => updateProperty('map', map, "merge" )
})(MapViewComp);

export default ({
    updateProperty = () => { },
    toggleDeleteConfirm = () => { },
    id, title,
    map,
    icons,
    hookRegister,
    mapStateSource,
    topRightItems,
    confirmDelete = false,
    loading = false,
    onDelete = () => {},
    headerStyle,
    env
} = {}) =>
    (<WidgetContainer id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
        icons={icons}
        topRightItems={topRightItems}
    >
        <BorderLayout
            footer={
                <div style={{ height: "30px", overflow: "hidden"}}>
                    {loading ? <span style={{ "float": "right"}}><LoadingSpinner /></span> : null}
                </div>
            }>
            <MapView
                updateProperty={updateProperty}
                id={id}
                map={omit(map, 'mapStateSource')}
                mapStateSource={mapStateSource}
                hookRegister={hookRegister}
                layers={map && map.layers}
                options={{ style: { margin: 10, height: 'calc(100% - 20px)' }}}
                env={env}
            />
        </BorderLayout>

    </WidgetContainer>);
