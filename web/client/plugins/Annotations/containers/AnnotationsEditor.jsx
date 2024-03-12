
/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import tinycolor from 'tinycolor2';
import {
    ANNOTATIONS,
    checkInvalidCoordinate,
    validateFeature
} from '../utils/AnnotationsUtils';
import { zoomToExtent } from '../../../actions/map';
import { updateNode } from '../../../actions/layers';
import {
    storeAnnotationsSession,
    selectAnnotationFeature
} from '../actions/annotations';
import {
    getSelectedAnnotationLayer,
    getAnnotationsSession,
    getSelectedAnnotationFeatureId
} from '../selectors/annotations';
import { createControlVariableSelector } from '../../../selectors/controls';
import { mapSelector } from '../../../selectors/map';
import { is3DMode } from '../../../selectors/maptype';
import FeaturesEditor from '../components/FeaturesEditor';
import {
    updateAdditionalLayer,
    removeAdditionalLayer
} from '../../../actions/additionallayers';
import bbox from '@turf/bbox';
import {
    DEFAULT_TARGET_ID,
    ANNOTATIONS_ADDITIONAL_LAYERS_OWNER,
    ANNOTATIONS_HIGHLIGHT_LAYER,
    ANNOTATIONS_SELECTED_LAYER,
    ANNOTATIONS_INVALID_LAYER
} from '../constants';

import AnnotationsMapInteractionsSupport, { areAnnotationsMapInteractionsSupported } from './AnnotationsMapInteractionsSupport';

function getInvalidFeatures(features) {
    return (features || []).filter(( {geometry }) => geometry?.type && ['LineString', 'Polygon'].includes(geometry.type))
        .reduce((acc, feature) => {
            const lineCoordinates = (feature.geometry.type === 'LineString'
                ? feature.geometry.coordinates
                : feature.geometry.coordinates[0]
            ).filter((coords) => !coords.some(checkInvalidCoordinate));
            return [
                ...acc,
                ...(lineCoordinates.length > 1
                    ? [{
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: lineCoordinates },
                        properties: { ...feature?.properties, geometryType: 'LineString' }
                    }]
                    : []),
                ...lineCoordinates.map((coordinates) => ({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates },
                    properties: { geometryType: 'Point' }
                }))
            ];
        }, []);
}

function getHighlightFeatures(feature) {
    if (!feature?.geometry?.type) {
        return [];
    }
    if (feature.geometry.type === 'Point' && !feature.geometry.coordinates.some(checkInvalidCoordinate)) {
        return [{ ...feature, properties: { geometryType: 'Point' } }];
    }
    const [minx, miny, maxx, maxy] = bbox(feature);
    const perimeter = {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [[minx, miny], [minx, maxy], [maxx, maxy], [maxx, miny], [minx, miny]] },
        properties: { geometryType: 'LineString' }
    };
    if (feature.geometry.type === 'LineString') {
        return [
            perimeter,
            ...feature.geometry.coordinates.map((coordinates) => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates },
                properties: { geometryType: 'Point' }
            }))
        ];
    }
    if (feature.geometry.type === 'Polygon') {
        return [
            perimeter,
            ...feature.geometry.coordinates[0].map((coordinates) => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates },
                properties: { geometryType: 'Point' }
            }))
        ];
    }
    return [feature];
}

function AnnotationsEditor({
    enabled,
    targetId = DEFAULT_TARGET_ID,
    mapType,
    map,
    selected,
    onChange,
    onZoomTo,
    maxZoom = 18,
    projection,
    onUpdateALayer = () => {},
    onRemoveALayer = () => {},
    symbolsPath = 'product/assets/symbols/symbols.json',
    lineDashOptions,
    enable3dStyleOptions,
    geometryEditorOptions,
    format = 'decimal',
    defaultTextAnnotation = 'New',
    defaultPointType,
    defaultShape,
    defaultShapeStrokeColor,
    defaultShapeFillColor,
    defaultShapeSize = 64,
    geodesic,
    activeClickEventListener,
    fonts,
    onStoreSession,
    session,
    selectedId,
    setSelectedId = () => {}
}) {

    const container = document.querySelector(`#${targetId}`);
    const [coordinatesFormat, setCoordinatesFormat] = useState(format);
    const [tab, setTab] = useState('coordinates');

    function getSvgSymbolsPath() {
        return symbolsPath.includes('.json') ? symbolsPath : `${symbolsPath}symbols.json`;
    }

    function configToDefaultSymbolizers() {
        if (defaultPointType !== 'symbol') {
            return {};
        }
        const fill = tinycolor(defaultShapeFillColor || '#dddddd');
        const stroke = tinycolor(defaultShapeStrokeColor || '#777777');
        const wellKnownName = getSvgSymbolsPath().replace(/[^\/]*.json$/, `${defaultShape}.svg`);
        return {
            Point: {
                kind: 'Mark',
                wellKnownName,
                color: fill.toHexString(),
                fillOpacity: fill.getAlpha(),
                strokeColor: stroke.toHexString(),
                strokeOpacity: stroke.getAlpha(),
                strokeWidth: 1,
                radius: defaultShapeSize / 2,
                rotate: 0
            }
        };
    }

    useEffect(() => {
        if (enabled && selected?.id) {
            onUpdateALayer(selected.id, ANNOTATIONS_ADDITIONAL_LAYERS_OWNER, 'override', {
                visibility: true
            });
        }
        return () => {
            onRemoveALayer({ owner: ANNOTATIONS_ADDITIONAL_LAYERS_OWNER });
        };
    }, [enabled]);
    function updateInvalidLayer(invalidFeatures) {
        onUpdateALayer(ANNOTATIONS_INVALID_LAYER, ANNOTATIONS_ADDITIONAL_LAYERS_OWNER, 'overlay', {
            type: 'vector',
            visibility: true,
            features: invalidFeatures ? getInvalidFeatures(invalidFeatures) : [],
            style: {
                format: 'geostyler',
                body: {
                    name: '',
                    rules: [
                        {
                            name: '',
                            filter: ['==', 'geometryType', 'LineString'],
                            symbolizers: [ {
                                kind: 'Line',
                                color: '#ff0000',
                                width: 2,
                                opacity: 1,
                                cap: 'round',
                                join: 'round',
                                msClampToGround: false,
                                dasharray: [6, 6]
                            }]
                        },
                        {
                            name: '',
                            filter: ['==', 'geometryType', 'Point'],
                            symbolizers: [{
                                kind: 'Mark',
                                wellKnownName: 'shape://plus',
                                color: '#ffffff',
                                fillOpacity: 0,
                                strokeColor: '#ff0000',
                                strokeOpacity: 1,
                                strokeWidth: 1,
                                radius: 8,
                                rotate: 0,
                                msBringToFront: true
                            }]
                        }
                    ]
                }
            }
        });
    }
    function updateSelectedLayer(feature, showSelected) {
        if (areAnnotationsMapInteractionsSupported(mapType)) {
            onUpdateALayer(selected.id, ANNOTATIONS_ADDITIONAL_LAYERS_OWNER, 'override', {
                visibility: true,
                ...((feature && !showSelected && !activeClickEventListener) && {
                    features: selected?.features?.filter(({ id, properties }) => id !== feature.id && properties?.measureId !== feature.id)
                })
            });
        }
        onUpdateALayer(ANNOTATIONS_SELECTED_LAYER, ANNOTATIONS_ADDITIONAL_LAYERS_OWNER, 'overlay', {
            type: 'vector',
            visibility: true,
            features: feature ? getHighlightFeatures(feature) : [],
            style: {
                format: 'geostyler',
                body: {
                    name: '',
                    rules: [
                        {
                            name: '',
                            filter: ['==', 'geometryType', 'LineString'],
                            symbolizers: [ {
                                kind: 'Line',
                                color: '#111111',
                                width: 1,
                                opacity: 1,
                                cap: 'round',
                                join: 'round',
                                msClampToGround: true,
                                dasharray: [6, 6]
                            }]
                        },
                        {
                            name: '',
                            filter: ['==', 'geometryType', 'Point'],
                            symbolizers: [{
                                kind: 'Mark',
                                wellKnownName: 'shape://plus',
                                color: '#ffffff',
                                fillOpacity: 0,
                                strokeColor: '#000000',
                                strokeOpacity: 1,
                                strokeWidth: 1,
                                radius: 8,
                                rotate: 0,
                                msBringToFront: true
                            }]
                        }
                    ]
                }
            }
        });
    }
    useEffect(() => {
        const selectedFeature = (selected?.features || []).find((feature) => feature.id === selectedId);
        if (enabled && validateFeature(selectedFeature)) {
            updateSelectedLayer(selectedFeature, tab === 'style');
        }
    }, [activeClickEventListener, mapType, enabled]);
    if (!(enabled && container && selected)) {
        return null;
    }
    return createPortal(
        <div className="ms-annotations-editor">
            <FeaturesEditor
                key={selected._v_}
                selectedId={selectedId}
                geodesic={{
                    Circle: geodesic !== false
                }}
                fonts={fonts}
                defaultSymbolizers={configToDefaultSymbolizers()}
                svgSymbolsPath={getSvgSymbolsPath()}
                lineDashOptions={lineDashOptions}
                coordinatesFormat={coordinatesFormat}
                enable3dStyleOptions={enable3dStyleOptions}
                geometryEditorOptions={geometryEditorOptions}
                defaultTextLabel={defaultTextAnnotation}
                onChangeCoordinatesFormat={setCoordinatesFormat}
                tab={tab}
                onSelectTab={(selectedTab, feature) => {
                    setTab(selectedTab);
                    updateSelectedLayer(feature, selectedTab === 'style');
                }}
                mapInteractionsSupport={!activeClickEventListener && AnnotationsMapInteractionsSupport}
                value={session || {
                    features: selected?.features || [],
                    style: selected?.style || {}
                }}
                onHighlight={(type, feature) => {
                    onUpdateALayer(ANNOTATIONS_HIGHLIGHT_LAYER, ANNOTATIONS_ADDITIONAL_LAYERS_OWNER, 'overlay', {
                        type: 'vector',
                        visibility: true,
                        features: feature ? getHighlightFeatures(feature) : [],
                        style: {
                            format: 'geostyler',
                            body: {
                                name: '',
                                rules: [
                                    {
                                        name: '',
                                        filter: ['==', 'geometryType', 'LineString'],
                                        symbolizers: [ {
                                            kind: 'Line',
                                            color: '#555555',
                                            width: 1,
                                            opacity: 1,
                                            cap: 'round',
                                            join: 'round',
                                            msClampToGround: true,
                                            dasharray: [6, 6]
                                        }]
                                    },
                                    {
                                        name: '',
                                        filter: ['==', 'geometryType', 'Point'],
                                        symbolizers: [{
                                            kind: 'Mark',
                                            wellKnownName: 'Square',
                                            color: '#ffffff',
                                            fillOpacity: 0,
                                            strokeColor: '#ff0000',
                                            strokeOpacity: 1,
                                            strokeWidth: 3,
                                            radius: 6,
                                            rotate: 0,
                                            msBringToFront: true
                                        }]
                                    }
                                ]
                            }
                        }
                    });
                }}
                mapType={mapType}
                map={map}
                maxZoom={maxZoom}
                projection={projection}
                onSelect={(id, selectedFeature) => {
                    setSelectedId(id);
                    updateSelectedLayer(selectedFeature, tab === 'style');
                }}
                onChange={(options, selectedFeature, present) => {
                    onChange(selected.id, 'layers', options);
                    updateSelectedLayer(selectedFeature, tab === 'style');
                    updateInvalidLayer(options.invalidFeatures);
                    onStoreSession(present);
                }}
                onZoomTo={onZoomTo}
            />
        </div>
        ,
        container
    );
}

const ConnectedAnnotationsEditor = connect(
    createSelector([
        createControlVariableSelector(ANNOTATIONS, 'ready'),
        getSelectedAnnotationLayer,
        mapSelector,
        is3DMode,
        getAnnotationsSession,
        getSelectedAnnotationFeatureId
    ],
    (enabled, selected, map, is3D, session, selectedId) => ({
        enabled,
        selected,
        maxZoom: map?.zoom || 18,
        projection: map?.projection,
        enable3dStyleOptions: !!is3D,
        activeClickEventListener: map?.eventListeners?.click?.[0],
        session,
        selectedId
    })),
    {
        onChange: updateNode,
        onZoomTo: zoomToExtent,
        onUpdateALayer: updateAdditionalLayer,
        onRemoveALayer: removeAdditionalLayer,
        onStoreSession: storeAnnotationsSession,
        setSelectedId: selectAnnotationFeature
    }
)(AnnotationsEditor);

export default ConnectedAnnotationsEditor;

