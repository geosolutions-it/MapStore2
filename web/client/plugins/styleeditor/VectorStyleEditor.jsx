/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState }  from 'react';
import { StyleEditor } from './StyleCodeEditor';
import TextareaEditor from '../../components/styleeditor/Editor';
import VisualStyleEditor from '../../components/styleeditor/VisualStyleEditor';
import {
    getEditorMode,
    getVectorDefaultStyle,
    styleValidation,
    getVectorLayerAttributes,
    getVectorLayerGeometryType
} from '../../utils/StyleEditorUtils';
import { getCapabilities } from '../../api/ThreeDTiles';

const editors = {
    visual: VisualStyleEditor,
    textarea: TextareaEditor
};

const capabilitiesRequest = {
    '3dtiles': getCapabilities
};

function VectorStyleEditor({
    element: layer,
    onUpdateNode
}) {

    const request = capabilitiesRequest[layer?.type];
    const [loading, setLoading] = useState(false);

    const style = useRef();
    style.current = layer?.style;

    const [error, setError] = useState();

    function handleClearStyle() {
        setError(null);
        onUpdateNode(layer.id, 'layers', { style: getVectorDefaultStyle(layer) });
    }

    function handleUpdateMetadata(metadata) {
        onUpdateNode(layer?.id, 'layers', {
            style: {
                ...style.current,
                metadata: {
                    ...style.current?.metadata,
                    ...metadata
                }
            }
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
            onUpdateNode(layer?.id, 'layers', {
                style: {
                    ...style.current,
                    body
                }
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
        if (!style.current?.body) {
            handleClearStyle();
        }
    }, [layer.id]);

    useEffect(() => {
        if (!loading && layer.url) {
            setLoading(true);
            request(layer.url)
                .then(({ properties, format } = {}) => {
                    if (isMounted.current) {
                        onUpdateNode(layer.id, 'layers', {
                            properties: {
                                ...properties,
                                ...layer.properties
                            },
                            format: format ? format : layer.format
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
    }, [layer.id, layer.url, request]);

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
        />
    );
}
export default VectorStyleEditor;
