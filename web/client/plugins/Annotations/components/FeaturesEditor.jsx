
/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useReducer, useEffect } from 'react';
import { Glyphicon, ButtonGroup, Nav, NavItem, FormGroup, ControlLabel, FormControl } from "react-bootstrap";
import uuid from 'uuid/v1';
import undoable from 'redux-undo';
import bbox from '@turf/bbox';
import identity from 'lodash/identity';
import RulesEditor from '../../../components/styleeditor/RulesEditor';
import { MapLibraries } from '../../../utils/MapTypeUtils';
import MSButton from '../../../components/misc/Button';
import tooltip from '../../../components/misc/enhancers/tooltip';
import {
    ANNOTATIONS,
    annotationsSymbolizerDefaultProperties,
    createDefaultStyleSymbolizer,
    validateFeature,
    applyDefaultCoordinates,
    parseUpdatedCoordinates,
    getFeatureIcon
} from '../utils/AnnotationsUtils';
import { computeFeatureMeasurement } from '../../../utils/MeasurementUtils';
import GeometryEditor from './GeometryEditor';
import Message from '../../../components/I18N/Message';
import getBlocks from '../../../components/styleeditor/config/blocks';
import { injectIntl } from 'react-intl';

const Button = tooltip(MSButton);

const UPDATE_ANNOTATIONS_FEATURES = 'UPDATE_ANNOTATIONS_FEATURES';
const UNDO_ANNOTATIONS_FEATURES = 'UNDO_ANNOTATIONS_FEATURES';
const REDO_ANNOTATIONS_FEATURES = 'REDO_ANNOTATIONS_FEATURES';

const handlers = {
    [UPDATE_ANNOTATIONS_FEATURES]: (state, callback) => callback(state)
};

const reducer = (state, action) => {
    return (handlers[action.type] || identity)(state, action.callback);
};

const historyCollectionReducer = undoable(reducer, {
    limit: 20,
    undoType: UNDO_ANNOTATIONS_FEATURES,
    redoType: REDO_ANNOTATIONS_FEATURES,
    jumpType: '',
    jumpToPastType: '',
    jumpToFutureType: '',
    clearHistoryType: ''
});

const DEFAULT_VALUE = {};


/**
 * it overrides default styler config in order to customize certain blocks
 * that in turn will make UI to change accordingly
 * @param {object} symbolizerBlock the symbolyzer block
 * @param {object} ruleBlock the rule block
 * @param {object} selected the features annotation selected
 */
function parseBlocks({ symbolizerBlock, ruleBlock}, selected) {
    return {
        symbolizerBlock: Object.keys(symbolizerBlock)
            .reduce((config, kind) => ({
                ...config,
                [kind]: {
                    ...symbolizerBlock[kind],
                    defaultProperties: annotationsSymbolizerDefaultProperties[kind] || symbolizerBlock[kind].defaultProperties,
                    params: Object.keys(symbolizerBlock[kind].params)
                        .reduce((acc, key) => {
                            const value = symbolizerBlock[kind].params[key];
                            if (['Circle'].includes(kind) && ['geodesic', 'radius', 'msClampToGround', "msGeometry"].includes(key)) {
                                return acc;
                            }
                            if (['Text'].includes(kind) && ['label', "msGeometry"].includes(key)) {
                                return acc;
                            }
                            if (['Line', 'Fill'].includes(kind) && ['msGeometry'].includes(key)) {
                                return acc;
                            }
                            // check selected annotation type
                            if (['Point', "Circle"].includes(selected?.properties?.annotationType) && ['msGeometry'].includes(key)) {
                                return acc;
                            }
                            return {
                                ...acc,
                                [key]: value
                            };
                        }, {})
                }
            }), {}),
        ruleBlock
    };
}

export function FeaturesEditor({
    selectedId,
    value,
    mapType,
    map,
    maxZoom = 18,
    onSelect = () => {},
    onChange = () => {},
    onZoomTo = () => {},
    onHighlight = () => {},
    projection,
    intl = {},
    mapInteractionsSupport,
    coordinatesFormat,
    onChangeCoordinatesFormat = () => {},
    tab = 'coordinates',
    onSelectTab = () => {},
    svgSymbolsPath,
    lineDashOptions,
    enable3dStyleOptions,
    geometryEditorOptions,
    defaultTextLabel,
    defaultSymbolizers,
    geodesic,
    fonts = [
        'Arial',
        'Verdana',
        'Helvetica',
        'Tahoma',
        'Trebuchet MS',
        'Times New Roman',
        'Georgia',
        'Garamond',
        'Courier New',
        'Brush Script MT'
    ]
}) {
    const [collectionHistory, dispatch] = useReducer(historyCollectionReducer, { present: value, past: [], future: [] });
    const collection = collectionHistory?.present || collectionHistory || DEFAULT_VALUE;
    const selected = (collection?.features || []).find((feature) => feature?.id === selectedId);
    const { symbolizerBlock, ruleBlock } = parseBlocks(
        getBlocks({
            exactMatchGeometrySymbol: true,
            enable3dStyleOptions
        }),
        selected
    );

    const MapInteractionsSupport = mapInteractionsSupport;

    useEffect(() => {
        const validFeatures = (collectionHistory?.present?.features || []).filter(validateFeature);
        const invalidFeatures = (collectionHistory?.present?.features || []).filter((feature) => !validateFeature(feature));
        const validFeaturesIds = validFeatures.map(feature => feature.id);
        onChange({
            ...collectionHistory?.present,
            features: validFeatures,
            style: {
                ...collectionHistory?.present?.style,
                format: 'geostyler',
                body: {
                    ...collectionHistory?.present?.style?.body,
                    rules: (collectionHistory?.present?.style?.body?.rules || [])
                        .filter(({ filter }) => validFeaturesIds.includes(filter?.[2]))
                }
            },
            invalidFeatures: invalidFeatures?.length > 0 ? invalidFeatures : null
        }, validateFeature(selected) ? selected : null, collectionHistory?.present);
    }, [collectionHistory?.present]);

    function handleOnChange(getNewValue) {
        dispatch({
            type: UPDATE_ANNOTATIONS_FEATURES,
            callback: (prevCollection) => {
                const newValue = getNewValue(prevCollection);
                return newValue;
            }
        });
    }

    function handleAddFeature(type, properties) {
        onSelectTab('coordinates', selected);
        const id = uuid();
        handleOnChange((prevCollection) => {
            const newFeature = {
                type: 'Feature',
                id,
                properties: {
                    ...properties,
                    id,
                    name: type,
                    annotationType: type
                },
                geometry: null
            };
            return {
                ...prevCollection,
                features: [
                    ...(prevCollection?.features || []),
                    newFeature
                ],
                style: {
                    ...prevCollection?.style,
                    format: 'geostyler',
                    body: {
                        ...prevCollection?.style?.body,
                        rules: [
                            ...(prevCollection?.style?.body?.rules || []),
                            {
                                name: '',
                                filter: ['==', 'id', id],
                                mandatory: type !== 'Point',
                                ruleId: uuid(),
                                symbolizers: [{
                                    symbolizerId: uuid(),
                                    ...createDefaultStyleSymbolizer(newFeature, defaultSymbolizers)
                                }]
                            }
                        ]
                    }
                }
            };
        });
        onSelect(id);
    }

    function computeMeasurement(newFeature) {
        if (newFeature?.properties?.measureType) {
            return computeFeatureMeasurement(newFeature, {
                formatNumber: intl?.formatNumber ? intl.formatNumber : n => n
            });
        }
        return [newFeature];
    }

    function handleUpdateFeatureById(id, updatedFeature, geometryUpdated) {
        handleOnChange((prevCollection) => ({
            ...prevCollection,
            features: (prevCollection?.features || [])
                .filter((feature) => !geometryUpdated ? true : feature?.properties?.measureId !== id)
                .reduce((acc, feature) => [ ...acc, ...(feature?.id !== id
                    ? [feature]
                    : geometryUpdated
                        ? computeMeasurement(updatedFeature)
                        : [updatedFeature])], [])
        }));
    }

    function handleRemoveFeature(id) {
        handleOnChange((prevCollection) => ({
            ...prevCollection,
            features: (prevCollection?.features || [])
                .filter(feature => feature?.id !== id && feature?.properties?.measureId !== id)
        }));
    }

    function handleUpdateCoordinates(coordinates) {
        dispatch({
            type: UPDATE_ANNOTATIONS_FEATURES,
            callback: (prevCollection) => {
                const newCollection = {
                    ...prevCollection,
                    features: (prevCollection.features || [])
                        .filter((feature) => feature?.properties?.measureId !== selectedId)
                        .reduce((acc, feature) => {
                            if (feature?.id !== selectedId) {
                                return [...acc, feature];
                            }
                            const updatedFeature = applyDefaultCoordinates(feature);
                            const newFeature = {
                                ...feature,
                                geometry: {
                                    ...updatedFeature?.geometry,
                                    coordinates: parseUpdatedCoordinates(updatedFeature?.geometry?.type, coordinates)
                                }
                            };
                            return [
                                ...acc,
                                ...(validateFeature(newFeature)
                                    ? computeMeasurement(newFeature)
                                    : [newFeature])
                            ];
                        }, [])
                };
                return newCollection;
            }
        });
    }

    function getFeatureStyle() {
        const { body } = collection?.style || {};
        const { rules = [] } = body || {};
        const featureStyleRules = rules.filter((rule) => rule?.filter?.[2] === selected?.properties?.id);
        return {
            name: 'selected feature style',
            rules: featureStyleRules
        };
    }

    function handleUpdateStyle(rules) {
        handleOnChange((prevCollection) => {
            const style = prevCollection?.style;
            const newRules = (prevCollection.features || []).reduce((acc, feature) => {
                if (feature.id === selected.id) {
                    return [...acc, ...rules.map((rule) => ({ ...rule, filter: rule.filter || ['==', 'id', selected.properties.id] }))];
                }
                const featureRules = (style?.body?.rules || []).filter((rule) => rule?.filter?.[2] === feature?.properties?.id);
                return [...acc,  ...featureRules];
            }, []);
            const newStyle = {
                ...style,
                format: 'geostyler',
                body: {
                    ...style?.body,
                    rules: newRules
                }
            };
            return {
                ...prevCollection,
                style: newStyle
            };
        });
    }

    const annotationsFeatures = (collection?.features || []).filter(feature => feature?.properties?.annotationType);

    return (
        <div className="ms-features-editor">
            <div className="ms-features-editor-list">
                <div className="ms-features-editor-list-header">
                    <ButtonGroup>
                        <Button
                            className="square-button-md no-border"
                            onClick={() => {
                                dispatch({ type: UNDO_ANNOTATIONS_FEATURES });
                            }}
                            disabled={(collectionHistory?.past?.length || 0) === 0}
                        >
                            <Glyphicon glyph="undo"/>
                        </Button>
                        <Button
                            className="square-button-md no-border"
                            onClick={() => {
                                dispatch({ type: REDO_ANNOTATIONS_FEATURES });
                            }}
                            disabled={(collectionHistory?.future?.length || 0) === 0}
                        >
                            <Glyphicon glyph="redo"/>
                        </Button>
                    </ButtonGroup>
                    <ButtonGroup>
                        <Button tooltipId="annotations.titles.marker" className="square-button-md no-border" onClick={() => handleAddFeature('Point')}>
                            <Glyphicon glyph="point-plus"/>
                        </Button>
                        <Button tooltipId="annotations.titles.line" className="square-button-md no-border" onClick={() => handleAddFeature('LineString')}>
                            <Glyphicon glyph="polyline-plus"/>
                        </Button>
                        <Button tooltipId="annotations.titles.polygon" className="square-button-md no-border" onClick={() => handleAddFeature('Polygon')}>
                            <Glyphicon glyph="polygon-plus"/>
                        </Button>
                        <Button tooltipId="annotations.titles.text" className="square-button-md no-border" onClick={() => handleAddFeature('Text', { label: defaultTextLabel || '' })}>
                            <Glyphicon glyph="font-add"/>
                        </Button>
                        <Button tooltipId="annotations.titles.circle" className="square-button-md no-border" onClick={() => handleAddFeature('Circle', { geodesic: !!geodesic?.Circle })}>
                            <Glyphicon glyph="1-circle-add"/>
                        </Button>
                    </ButtonGroup>
                </div>
                {!collection?.features?.length && <div className="ms-features-editor-list-empty"><Message msgId="annotations.addGeometry"/></div>}
                <ul className="ms-features-editor-list-body">
                    {annotationsFeatures.map((feature) => {
                        const id = feature?.id;
                        const isSelected = selectedId === id;
                        return (
                            <li
                                key={id}
                                onClick={() => isSelected
                                    ? () => {}
                                    : onSelect(id, validateFeature(feature) ? feature : null)}
                                className={`ms-features-editor-item ${isSelected ? ' selected' : ''}`}
                                onMouseEnter={() => {
                                    if (selectedId !== id && validateFeature(feature)) {
                                        onHighlight('feature', feature);
                                    }
                                }}
                                onMouseLeave={() => {
                                    onHighlight('feature', null);
                                }}
                            >
                                <div><Glyphicon glyph={getFeatureIcon(feature)}/></div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        value={feature?.properties?.name}
                                        type="text"
                                        onChange={(event) => handleUpdateFeatureById(id, {
                                            ...feature,
                                            properties: {
                                                ...feature?.properties,
                                                name: event.target.value
                                            }
                                        })} />
                                </div>
                                <Glyphicon glyph={validateFeature(feature) ? 'ok-sign text-success' : 'exclamation-mark text-danger'}/>
                                <ButtonGroup>
                                    <Button
                                        disabled={!validateFeature(feature)}
                                        bsStyle={isSelected ? 'primary' : 'default'}
                                        className="square-button-md"
                                        tooltipId="annotations.zoomToGeometry"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onZoomTo(bbox(feature), 'EPSG:4326', maxZoom);
                                        }}>
                                        <Glyphicon glyph="zoom-to" />
                                    </Button>
                                    <Button
                                        className="square-button-md"
                                        bsStyle={isSelected ? 'primary' : 'default'}
                                        tooltipId="annotations.removeGeometry"
                                        onClick={(event) => { event.stopPropagation(); handleRemoveFeature(id); }}
                                    >
                                        <Glyphicon glyph="trash" />
                                    </Button>
                                </ButtonGroup>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {!selected && <div className="ms-features-editor-tools-empty">
                <div>
                    <Glyphicon glyph="comment" />
                    <div><Message msgId="annotations.selectAnnotationFeature"/></div>
                </div>
            </div>}
            {selected && <div className="ms-features-editor-tools">
                <Nav bsStyle="tabs" activeKey={tab}>
                    <NavItem
                        key="coordinates"
                        eventKey="coordinates"
                        onClick={() => onSelectTab('coordinates', selected)}>
                        <Message msgId="annotations.tabCoordinates"/>
                    </NavItem>
                    <NavItem
                        key="style"
                        eventKey="style"
                        onClick={() => onSelectTab('style', selected)}>
                        <Message msgId="annotations.tabStyle"/>
                    </NavItem>
                </Nav>
                <div className="ms-features-editor-tools-body" >
                    {tab === 'coordinates' &&
                    <>
                        <GeometryEditor
                            key={selected.id}
                            enableHeightField={mapType === MapLibraries.CESIUM && !selected?.properties?.geodesic}
                            format={coordinatesFormat}
                            onChangeFormat={onChangeCoordinatesFormat}
                            mapProjection={projection}
                            options={geometryEditorOptions}
                            onHighlightPoint={(point) => {
                                onHighlight('coordinate', point && {
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [point.lon, point.lat]
                                    },
                                    properties: {}
                                });
                            }}
                            onChangeRadius={(radius) => {
                                handleUpdateFeatureById(selected?.id, {
                                    ...selected,
                                    properties: {
                                        ...selected?.properties,
                                        radius
                                    }
                                });
                            }}
                            selected={{
                                ...applyDefaultCoordinates(selected),
                                properties: {
                                    ...selected?.properties,
                                    // the internal validation of GeometryEditor expects valueText as property
                                    valueText: selected?.properties?.label
                                }
                            }}
                            featureType={selected?.properties?.annotationType}
                            renderer={ANNOTATIONS}
                            onChange={handleUpdateCoordinates}
                            onSetInvalidSelected={(type, _value) => {
                                if (type === 'coords') {
                                    handleUpdateCoordinates(_value);
                                }
                            }}
                        />
                        {selected?.properties?.annotationType === 'Text' && (
                            <FormGroup
                                className="ms-annotations-label-input"
                                key="label"
                                controlId={'ms-annotations-label-input'}
                                validationState={!!selected?.properties?.label ? undefined : 'error'}
                            >
                                <ControlLabel>
                                    <Message msgId="annotations.titles.text" />
                                </ControlLabel>
                                <FormControl
                                    type="text"
                                    value={selected?.properties?.label || ''}
                                    onChange={(event) => handleUpdateFeatureById(selected?.id, {
                                        ...selected,
                                        properties: {
                                            ...selected?.properties,
                                            label: event.target.value
                                        }
                                    })}
                                />
                            </FormGroup>
                        )}
                    </>}
                    {tab === 'style' && <div>
                        <RulesEditor
                            ruleBlock={ruleBlock}
                            symbolizerBlock={symbolizerBlock}
                            config={{
                                geometryType: `annotation-${selected?.properties?.annotationType?.toLowerCase()}`,
                                simple: true,
                                fonts,
                                svgSymbolsPath,
                                lineDashOptions
                            }}
                            // reverse rules order to show top rendered style
                            // as first item of the list
                            rules={getFeatureStyle()?.rules && [...getFeatureStyle().rules].reverse()}
                            // changes synchronous updated
                            // reverse the rules to their original order
                            onChange={newRules => handleUpdateStyle([...newRules].reverse())}
                        />
                    </div>}
                </div>
            </div>}
            {MapInteractionsSupport && <MapInteractionsSupport
                key={selected?.id}
                active={!!selected && tab === 'coordinates'}
                map={map}
                mapType={mapType}
                feature={selected}
                geodesic={geodesic}
                onChange={(newFeature) => {
                    handleUpdateFeatureById(selected.id, newFeature, true);
                }}
            />}
        </div>
    );
}

export default injectIntl(FeaturesEditor);
