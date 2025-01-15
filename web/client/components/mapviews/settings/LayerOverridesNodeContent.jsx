/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import {
    Checkbox,
    FormGroup,
    ControlLabel,
    Alert
} from 'react-bootstrap';
import Select from 'react-select';
import { formatClippingFeatures } from '../../../utils/MapViewsUtils';
import Message from '../../I18N/Message';
import { getTitle } from '../../../utils/LayersUtils';
import PropTypes from 'prop-types';

/**
 * LayerOverridesNodeContent render additional content inside the layer node in toc for map views
 * @prop {object} node layer object
 * @prop {object} config optional configuration available for the nodes
 * @prop {function} onChange return the changes of this node
 */
function LayerOverridesNodeContent({
    node = {},
    config,
    onChange
}) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const isClippingSupported = !!['3dtiles', 'terrain'].includes(node.type);

    if (!isClippingSupported) {
        return null;
    }

    const {
        updateLayerRequest,
        vectorLayers,
        resources,
        locale
    } = config?.mapViews || {};

    const vectorLayersOptions = vectorLayers
        ?.filter((layer) => {
            if (layer.type === 'wfs') {
                return true;
            }
            if (layer.type === 'vector') {
                return !!layer?.features?.find(({ geometry }) => ['Polygon'].includes(geometry?.type));
            }
            return false;
        })
        .map((layer) => ({
            label: getTitle(layer.title, locale) || layer.name || layer.id,
            value: layer.id,
            layer
        }));

    function handleUpdateLayer({ layer: resourceLayer }) {
        setError(false);
        if (!resourceLayer) {
            return onChange({
                clippingLayerResourceId: undefined,
                clippingPolygonFeatureId: undefined,
                clippingPolygonUnion: undefined
            });
        }
        setLoading(true);
        return updateLayerRequest({ layer: resourceLayer })
            .then((clippingLayerResourceId) => {
                onChange({ clippingLayerResourceId });
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }

    const _clippingLayerResource = resources?.find(({ id }) => id === node.clippingLayerResourceId)?.data;
    const vectorLayer = vectorLayers?.find(({ id }) => id === _clippingLayerResource?.id);
    const clippingFeatures = _clippingLayerResource?.collection?.features || vectorLayer?.features;
    const clippingLayerResource = _clippingLayerResource
        ? {
            value: _clippingLayerResource?.id,
            label: getTitle(vectorLayer?.title, locale) || vectorLayer?.name || vectorLayer?.id,
            resource: _clippingLayerResource
        } : undefined;

    const formattedClippingFeatures = formatClippingFeatures(clippingFeatures);

    return (
        <div className="ms-map-views-layer-clipping">
            <FormGroup
                controlId={`map-views-layer-clipping-source-${node.id}`}
            >
                <ControlLabel><Message msgId="mapViews.clippingSourceLayer"/></ControlLabel>
                <Select
                    isLoading={loading}
                    value={clippingLayerResource}
                    options={vectorLayersOptions}
                    onChange={(option) => handleUpdateLayer({ layer: option?.layer })}
                />
                {error && <Alert bsStyle="danger" style={{ marginTop: 8 }}>
                    <Message msgId="mapViews.resourceLayerRequestError"/>
                </Alert>}
            </FormGroup>
            <FormGroup
                controlId={`map-views-layer-clipping-feature-id-${node.id}`}
            >
                <ControlLabel><Message msgId="mapViews.clippingFeature"/></ControlLabel>
                <Select
                    value={node.clippingPolygonFeatureId ? { value: node.clippingPolygonFeatureId, label: node.clippingPolygonFeatureId } : undefined}
                    disabled={!node.clippingLayerResourceId}
                    options={formattedClippingFeatures?.map((feature) => ({ value: feature.id, label: feature.id, feature }))}
                    onChange={(option) => onChange({ clippingPolygonFeatureId: option?.feature?.id })}
                />
                {(!!node.clippingLayerResourceId && formattedClippingFeatures?.length === 0) && <Alert bsStyle="danger" style={{ marginTop: 8 }}>
                    <Message msgId="mapViews.clipPolygonFeaturesNotAvailable"/>
                </Alert>}
            </FormGroup>
            <FormGroup controlId={`map-views-layer-clipping-inverse-${node.id}`}>
                <Checkbox
                    checked={!!node.clippingPolygonUnion}
                    disabled={!node.clippingPolygonFeatureId || loading}
                    onChange={() => onChange({ clippingPolygonUnion: !node.clippingPolygonUnion })}>
                    <Message msgId="mapViews.clippingInverse"/>
                </Checkbox>
            </FormGroup>
            {loading && <div className="ms-map-views-loading-mask"/>}
        </div>
    );
}

LayerOverridesNodeContent.propTypes = {
    node: PropTypes.object,
    config: PropTypes.object,
    onChange: PropTypes.func
};

export default LayerOverridesNodeContent;
