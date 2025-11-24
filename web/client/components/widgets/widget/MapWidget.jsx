/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { omit, isEqual } from 'lodash';
import React from 'react';
import { compose, withHandlers, withProps } from 'recompose';

import BorderLayout from '../../layout/BorderLayout';
import LoadingSpinner from '../../misc/LoadingSpinner';
import MapViewComp from './MapView';
import WidgetContainer from './WidgetContainer';
import MapSwitcher from "../builder/wizard/map/MapSwitcher";
import BackgroundSelector from '../../background/BackgroundSelector';
import LegendViewComponent from './LegendView';
import { getDerivedLayersVisibility } from "../../../utils/LayersUtils";

const MapView = withHandlers({
    onMapViewChanges: ({ onUpdateMapProperty = () => { }}) => ({layers, ...map}) => onUpdateMapProperty(map)
})(MapViewComp);

const LegendView = withHandlers({
    updateProperty: ({ onUpdateMapProperty = () => { }, map }) => (_, value) => {
        const newLayers = map.layers?.map(layer => {
            const updateLayer = value?.layers.find(l => l.id === layer.id);
            if (updateLayer) {
                return {
                    ...layer,
                    visibility: updateLayer.visibility,
                    opacity: updateLayer.opacity,
                    expanded: updateLayer.expanded,
                    layerFilter: updateLayer.layerFilter
                };
            }
            return layer;
        });
        const groups = map.groups?.map(group => {
            const updateGroup = value?.groups.find(g => g.id === group.id);
            if (updateGroup) {
                return {
                    ...group,
                    visibility: updateGroup.visibility,
                    expanded: updateGroup.expanded
                };
            }
            return group;
        });
        if (!isEqual(map.layers, newLayers) || !isEqual(map.groups, groups)) {
            onUpdateMapProperty({ ...map, layers: newLayers, groups });
        }
    }
})(LegendViewComponent);

const BackgroundSelectorWithHandlers = withHandlers({
    onPropertiesChange: ({ onUpdateMapProperty, map }) => (layerId, properties) => {
        if (!layerId) {
            return;
        }
        const newLayers = map.layers?.map(layer => {
            if (layer.group === 'background') {
                const updatedLayer = { ...layer, visibility: false };
                // set the selected background layer to visible
                if (layer.id === layerId) {
                    return { ...updatedLayer, visibility: true, ...properties };
                }
                return updatedLayer;
            }
            return layer;
        });
        if (!isEqual(map.layers, newLayers)) {
            onUpdateMapProperty({ ...map, layers: newLayers });
        }
    }
})(BackgroundSelector);

const MapWidgetComponent = ({
    updateProperty = () => { },
    onUpdateMapProperty = () => { },
    toggleDeleteConfirm = () => { },
    id, title,
    map = {},
    maps = [],
    selectedMapId,
    icons,
    hookRegister,
    mapStateSource,
    topRightItems = [],
    options = {},
    confirmDelete = false,
    loading = false,
    dataGrid = {},
    onDelete = () => {},
    headerStyle,
    env,
    selectionActive,
    currentZoomLvl,
    scales,
    language,
    currentLocale
}) => {
    const { size: {height: mapHeight, width: mapWidth} = {}, mapInfoControl } = map;
    const backgroundLayers = (map.layers || []).filter(layer => layer.group === 'background');
    const enableViewerTools = mapHeight > 400 && mapWidth > 400 && mapInfoControl;

    return (<WidgetContainer className={"map-widget-view"} id={`widget-text-${id}`} title={title} confirmDelete={confirmDelete} onDelete={onDelete} toggleDeleteConfirm={toggleDeleteConfirm} headerStyle={headerStyle}
        icons={icons}
        topRightItems={[
            <MapSwitcher
                key="map-switcher"
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
            <div className="map-widget-view-content">
                <MapView
                    tools={enableViewerTools ? ['popup'] : []}
                    onUpdateMapProperty={onUpdateMapProperty}
                    id={id}
                    map={{
                        ...omit(map, 'mapStateSource')
                    }}
                    mapStateSource={mapStateSource}
                    hookRegister={hookRegister}
                    layers={getDerivedLayersVisibility(map.layers, map.groups)}
                    options={{ style: { margin: '0 10px 10px 10px', height: 'calc(100% - 10px)' }}}
                    env={env}
                />
                {enableViewerTools && <>
                    {map.showBackgroundSelector && backgroundLayers?.length > 0 && (
                        <BackgroundSelectorWithHandlers
                            id={id}
                            map={map}
                            onUpdateMapProperty={onUpdateMapProperty}
                            backgrounds={backgroundLayers}
                            projection={map.projection}
                            style={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                zIndex: 100,
                                marginBottom: 0
                            }}
                            alwaysVisible={false}
                            canEdit={false}
                            allowDeletion={false}
                            backgroundToolbarItems={[]}
                        />
                    )}
                    {map.showLegend && (
                        <div className="legend-in-mapview">
                            <LegendView
                                id={id}
                                map={map}
                                onUpdateMapProperty={onUpdateMapProperty}
                                currentZoomLvl={currentZoomLvl}
                                scales={scales}
                                language={language}
                                currentLocale={currentLocale}
                            />
                        </div>
                    )}
                </>}
            </div>
        </BorderLayout>
    </WidgetContainer>);
};

const MapWidget = compose(
    withProps(({ selectedMapId }) => ({ selectedMapId })),
    withHandlers({
        onUpdateMapProperty: ({updateProperty = () => {}, id, selectedMapId}) => (value) => {
            // Include mapId in the value so the reducer knows which map to update
            const valueWithMapId = selectedMapId ? { ...value, mapId: selectedMapId } : value;
            updateProperty(id, "maps", valueWithMapId, "merge");
        }
    })
)(MapWidgetComponent);

export default MapWidget;
