/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { cloneElement, Children } from 'react';
import { compose, withState } from 'recompose';
import { Glyphicon } from 'react-bootstrap';

import MapView from '../common/MapView';
import { applyDefaults } from '../../../utils/GeoStoryUtils';
import {defaultLayerMapPreview} from '../../../utils/MediaEditorUtils';
import Portal from '../../../components/misc/Portal';
import tooltip from '../../../components/misc/enhancers/tooltip';
import { withResizeDetector } from 'react-resize-detector';

import { MapLibraries } from '../../../utils/MapTypeUtils';
import { getDerivedLayersVisibility } from '../../../utils/LayersUtils';

import ButtonRB from '../../misc/Button';
const Button = tooltip(ButtonRB);

export default compose(
    withState('active', 'setActive', false),
    withResizeDetector
)(({
    id,
    map = {layers: [defaultLayerMapPreview]},
    fit,
    editMap = false,
    onMapViewChanges,
    eventHandlers,
    expandable = false,
    active,
    setActive,
    width,
    height,
    size,
    showCaption,
    caption: contentCaption,
    mapType = MapLibraries.OPENLAYERS, // default for when map MediaViewer is not connected to redux
    onMapTypeLoaded,
    layers: geoStoryLayers,
    children,
    ...props
}) => {

    const { layers: flatLayers = [], groups = [], mapOptions = {}, description, ...m} = (map.data ? map.data : map);
    const layers = getDerivedLayersVisibility(flatLayers, groups);
    const caption = contentCaption || description;

    const expandedMapOptions = active
        ? {
            zoomControl: false,
            interactive: true,
            mapOptions: {
                scrollWheelZoom: true,
                interactions: {
                    mouseWheelZoom: true,
                    dragPan: true
                }
            }
        }
        : {
            zoomControl: false,
            interactive: false,
            mapOptions: {
                scrollWheelZoom: false,
                interactions: {
                    mouseWheelZoom: false,
                    dragPan: false
                }
            }
        };

    const expandMapOptions = expandable ? expandedMapOptions : { mapOptions };

    // mouseWheelZoom is enabled only if inlineEditing is active and zoomControl too
    const updatedMapOptions = editMap
        ? {
            mapOptions: {
                ...mapOptions,
                interactions: {
                    ...mapOptions.interactions,
                    mouseWheelZoom: m.zoomControl
                }

            }
        }
        : expandMapOptions;

    const isMapInfoControlActive = !props.isDrawEnabled && m.mapInfoControl && !(expandable && !active);
    // BaseMap component overrides the MapView id with map's id
    const mapView = (
        <>
            <MapView
                {...props}
                // force unmount to setup correct interactions
                key={expandable ? 'overlay' : 'block'}
                onMapViewChanges={onMapViewChanges}
                eventHandlers={eventHandlers}
                map={{
                    ...m,
                    id: `media-${id}`,
                    resize: width + '-' + height + '_' + size,
                    className: 'aaaa',
                    style: {
                        // removed width and height from style and added to .less
                        // to use different sizes in story sections
                        cursor: isMapInfoControlActive ? 'pointer' : 'default',

                        // openlayers map does not propagate the events even if if the interactions are set to false
                        // we need to disable all the pointer and touch events to make the geostory scrollable also on mobile devices
                        ...((expandable && !active) && {
                            pointerEvents: 'none',
                            touchAction: 'none'
                        })
                    }
                }} // if map id is passed as number, the resource id, ol throws an error
                layers={geoStoryLayers ? [ ...layers, ...geoStoryLayers ] : layers}
                tools={isMapInfoControlActive ? ["popup"] : []}
                options={applyDefaults(updatedMapOptions)}
                mapType={mapType}
                onMapTypeLoaded={onMapTypeLoaded}
            >
                {Children.map(children, child => child ? cloneElement(child, { mapType }) : null)}
            </MapView>
            {expandable && !editMap &&
        <Button
            className="ms-expand-media-button"
            onClick={() => setActive(!active)}
            tooltipId={active ? 'geostory.closeFullscreenMap' : 'geostory.showFullscreenMap'}
            tooltipPosition="left">
            <Glyphicon glyph={!active ? '1-full-screen' : '1-close'}/>
        </Button>}
        </>
    );
    return (<div
        className={`ms-media ms-media-map ${mapOptions.zoomPosition || ""}`}
        style={{
            objectFit: fit
        }}>
        {active && expandable
            ? <Portal>
                <div className="ms-expanded-media-container">
                    {mapView}
                </div>
            </Portal>
            : mapView}
        {showCaption && caption && <div className="ms-media-caption">
            <small>
                {caption}
            </small>
        </div>}
    </div>);
});
