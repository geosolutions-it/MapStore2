/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState }  from 'react';
import uniq from 'lodash/uniq';
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
    'wfs': (layer) => layer.url
        ? describeFeatureType(layer.url, layer.name)
            .then((response) => {
                return extractFeatureProperties({
                    describeLayer: {
                        owsType: 'WFS'
                    },
                    describeFeatureType: response
                });
            })
        : Promise.resolve({})
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
    onUpdateNode = () => {}
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
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
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

    return (
        <StyleEditor
            canEdit
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
            config={{
                simple: true,
                fonts
            }}
        />
    );
}
export default VectorStyleEditor;
