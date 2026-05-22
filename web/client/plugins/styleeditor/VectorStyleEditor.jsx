/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState }  from 'react';
import uniq from 'lodash/uniq';
import isEmpty from 'lodash/isEmpty';
import { StyleEditor } from './StyleCodeEditor';
import TextareaEditor from '../../components/styleeditor/Editor';
import VisualStyleEditor from '../../components/styleeditor/VisualStyleEditor';
import {
    getEditorMode,
    getVectorDefaultStyle,
    styleValidation,
    getVectorLayerAttributes,
    getVectorLayerGeometryType,
    extractFeatureProperties,
    getGeometryType
} from '../../utils/StyleEditorUtils';
import {
    layerToGeoStylerStyle,
    flattenFeatures
} from '../../utils/VectorStyleUtils';
import { getCapabilities } from '../../api/ThreeDTiles';
import { describeFeatureType } from '../../api/WFS';
import { classificationVector } from '../../api/StyleEditor';
import SLDService from '../../api/SLDService';
import { classifyGeoJSON, availableMethods } from '../../api/GeoJSONClassification';
import { getLayerJSONFeature } from '../../observables/wfs';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { currentZoomLevelSelector, scalesSelector } from '../../selectors/map';
import { getFlatGeobufGeometryTypeFromOptions } from '../../utils/FlatGeobufLayerUtils';

import {
    getCapabilities as getFlatGeobufCapabilities,
    sniffFlatGeobufFirstFeature
} from '../../api/FlatGeobuf';
import { getRequestConfigurationByUrl } from '../../utils/SecurityUtils';
import { updateUrlParams } from '../../utils/URLUtils';

const { getColors } = SLDService;

const editors = {
    visual: VisualStyleEditor,
    textarea: TextareaEditor
};

const capabilitiesRequest = {
    '3dtiles': (layer) => getCapabilities(layer.url),
    'vector': ({ features = [] }) => {
        const flatFeatures = flattenFeatures(features);
        const properties = flatFeatures.reduce((acc, feature) => ({ ...acc, ...feature?.properties }), {});
        const geometryTypes = uniq(flatFeatures.map((feature) => feature?.geometry?.type).filter(value => value));
        return Promise.resolve({
            properties,
            geometryType: geometryTypes.length === 1 ? getGeometryType({ localType: geometryTypes[0] }) : 'vector'
        });
    },
    'flatgeobuf': (layer) => {
        // Priority to check geometryType:
        //  1. explicit layer.geometryType
        //  2. FGB header from capabilities
        //  3. then sniff the first feature from remote file header
        const layerGeometryType = getFlatGeobufGeometryTypeFromOptions(layer);
        const geometryType = getGeometryType({ localType: layerGeometryType });

        if (layer?.sourceMetadata?.columns) {
            const properties = layer?.sourceMetadata?.columns?.reduce((acc, { name }) => ({ ...acc, [name]: '' }), {}) || {};
            return {
                geometryType,
                properties
            };
        }

        return getFlatGeobufCapabilities(layer.url).then((capabilities) => {
            const optionsProperties = capabilities?.metadata?.columns?.reduce((acc, { name }) => ({ ...acc, [name]: '' }), {}) || {};
            const optionsGeometryType = getFlatGeobufGeometryTypeFromOptions({
                geometryType: layer.geometryType,
                sourceMetadata: capabilities.metadata
            });
            const optionsFirstFeature = {   // hipotetical feature with geometry type from options and properties from metadata, used when sniffing is not needed
                geometry: { type: optionsGeometryType },
                properties: optionsProperties
            };
            const finalize = (firstFeature) => ({
                geometryType: getGeometryType({ localType: firstFeature?.geometry?.type || '' }),
                properties: optionsProperties || firstFeature?.properties || {}
            });
            if (optionsGeometryType && !isEmpty(optionsProperties)) {
                return finalize(optionsFirstFeature);
            }
            const { headers, params } = getRequestConfigurationByUrl(layer.url, layer?.security?.sourceId);
            return sniffFlatGeobufFirstFeature(updateUrlParams(layer.url, params), headers)
                .then(finalize)
                .catch(() => {
                    return {
                        geometryType: optionsGeometryType,
                        properties: optionsProperties
                    };
                });

        }).catch(() => {
            return {
                geometryType: layer.geometryType,
                properties: layer.properties
            };
        });
    },
    'wfs': (layer) => layer.url
        ? describeFeatureType(layer.url, layer.name)
            .then((response) => {
                const featureProps =  extractFeatureProperties({
                    describeLayer: {
                        owsType: 'WFS'
                    },
                    describeFeatureType: response
                });
                return featureProps;
            })
        : Promise.resolve({}),
    'arcgis-feature': (layer) => Promise.resolve({
        geometryType: layer.geometryType,
        properties: {}
    })
};

function VectorStyleEditor({
    element: layer,
    enable3dStyleOptions,
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
    ],
    onUpdateNode = () => {},
    scales = [],
    zoom = 0
}) {

    const request = capabilitiesRequest[layer?.type];
    const [loading, setLoading] = useState(false);

    const style = useRef();

    const [error, setError] = useState();

    function handleClearStyle() {
        setError(null);
        onUpdateNode(layer.id, 'layers', { style: getVectorDefaultStyle(layer) });
    }

    function handleUpdateMetadata(metadata) {
        style.current = {
            ...style.current,
            metadata: {
                ...style.current?.metadata,
                ...metadata
            }
        };
        onUpdateNode(layer?.id, 'layers', {
            style: { ...style.current }
        });
    }

    function handleUpdateStyle(body) {
        const format = style?.current?.format;
        const validationError = styleValidation[format] && styleValidation[format](body, layer);
        if (validationError) {
            return setError(validationError);
        }
        if (body) {
            setError(null);
            style.current = {
                ...style.current,
                body
            };
            onUpdateNode(layer?.id, 'layers', {
                style: { ...style.current }
            });
        } else {
            handleClearStyle();
        }
        return null;
    }

    function handleError(newError) {
        if (newError?.isEmpty) {
            handleClearStyle();
        }
        if (newError.name === 'SyntaxError') {
            setError(newError);
        }
    }

    const isMounted = useRef();
    const geojson = useRef();
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            geojson.current = undefined;
        };
    }, []);

    useEffect(() => {
        if (!loading && request) {
            setLoading(true);
            (request
                ? request(layer)
                : Promise.resolve(layer))
                .then(({ properties, format, geometryType } = {}) => {
                    const newLayer = {
                        ...layer,
                        properties: {
                            ...properties,
                            ...layer.properties
                        },
                        format: format ? format : layer.format,
                        geometryType: geometryType ? geometryType : layer.geometryType
                    };
                    return newLayer;
                })
                .then((newLayer) => layerToGeoStylerStyle(newLayer).then((updatedStyle) => ({ ...newLayer, style: updatedStyle })))
                .then(({
                    properties,
                    format,
                    geometryType,
                    style: updatedStyle
                } = {}) => {
                    if (isMounted.current) {
                        const newStyle = !updatedStyle?.body ? getVectorDefaultStyle(layer) : updatedStyle;
                        style.current = newStyle;
                        setError(null);
                        onUpdateNode(layer.id, 'layers', {
                            properties,
                            format,
                            geometryType,
                            style: newStyle
                        });
                        setLoading(false);
                    }
                })
                .catch(() => {
                    if (isMounted.current) {
                        setLoading(false);
                    }
                });
        }
    }, [layer.id, request]);

    const { format, metadata, body } = style.current || {};
    const { editorType, styleJSON } = metadata || {};

    function getLayerFeatureCollection() {
        if (geojson.current) {
            return Promise.resolve(geojson.current);
        }
        if (layer.type === 'vector') {
            return Promise.resolve({ type: 'FeatureCollection', features: layer.features });
        }
        if (layer.type === 'flatgeobuf') {
            return Promise.resolve({ type: 'FeatureCollection', features: layer.features });
        }
        if (layer.type === 'wfs') {
            return getLayerJSONFeature(layer).toPromise().then(({ features }) => {
                geojson.current = { type: 'FeatureCollection', features };
                return geojson.current;
            });
        }
        if (layer.type === 'arcgis-feature') {
            return Promise.resolve({ type: 'FeatureCollection', features: layer.features || [] });
        }
        return Promise.resolve({ type: 'FeatureCollection', features: [] });
    }

    const supportedLayers = ['vector', 'wfs', 'arcgis-feature'];

    return (
        <StyleEditor
            canEdit
            layer={layer}
            code={!loading && body}
            error={error}
            editorType={editorType || 'textarea'}
            editors={editors}
            format={format}
            attributes={getVectorLayerAttributes(layer)}
            mode={getEditorMode(format)}
            geometryType={getVectorLayerGeometryType(layer)}
            defaultStyleJSON={styleJSON ? JSON.parse(styleJSON) : null}
            onUpdateMetadata={handleUpdateMetadata}
            onChange={handleUpdateStyle}
            onError={handleError}
            exactMatchGeometrySymbol
            enable3dStyleOptions={enable3dStyleOptions}
            getColors={getColors}
            methods={availableMethods}
            styleUpdateTypes={{
                classificationVector: (options) => {
                    return classificationVector({
                        ...options,
                        classificationRequest: ({ params }) => getLayerFeatureCollection()
                            .then((collection) => classifyGeoJSON(collection, params))
                    });
                }
            }}
            config={{
                simple: !supportedLayers.includes(layer?.type),
                supportedSymbolizerMenuOptions: ['Simple', 'Extrusion', 'Classification'],
                fonts,
                enableFieldExpression: supportedLayers.includes(layer.type),
                scales,
                zoom: Math.round(zoom)   // passing this for showing arrow of current scale for ScaleDenominator
            }}
        />
    );
}
const ConnectedVectorStyleEditor = connect(createSelector([scalesSelector, currentZoomLevelSelector], (scales, zoom) => ({
    scales: scales.map(scale => Math.round(scale)),
    zoom
})))(VectorStyleEditor);
export default ConnectedVectorStyleEditor;
