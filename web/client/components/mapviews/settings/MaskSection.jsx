/*
 * Copyright 2022, GeoSolutions Sas.
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
import { getTitle } from '../../../utils/TOCUtils';
import {
    DefaultViewValues,
    mergeViewLayers
} from '../../../utils/MapViewsUtils';
import FormControl from '../../misc/DebouncedFormControl';
import Section from './Section';
import Message from '../../I18N/Message';

function MaskSection({
    view,
    expandedSections = {},
    onExpandSection,
    onChange,
    resources,
    vectorLayers,
    updateLayerRequest,
    locale
}) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const maskLayerData = resources?.find(resource => resource.id === view?.mask?.resourceId)?.data;
    const vectorLayer = vectorLayers?.find(layer => layer.id === maskLayerData?.id);
    const maskLayer = maskLayerData ? { ...maskLayerData, ...vectorLayer } : undefined;

    const mask = view?.mask;
    const offset = view?.mask?.offset ?? DefaultViewValues.MASK_OFFSET;
    const enabled = !!mask?.enabled;
    const inverse = !!mask?.inverse;

    function handleUpdateLayer({
        layer,
        inverse: newInverse,
        offset: newOffset
    }) {
        setError(false);
        if (!layer) {
            return onChange({ mask: { ...mask, resourceId: undefined } });
        }
        setLoading(true);
        return updateLayerRequest({
            layer,
            inverse: newInverse,
            offset: newInverse ? newOffset : 0
        }).then((resourceId) => {
            onChange({ mask: { ...mask, resourceId, inverse: newInverse, offset: newOffset } });
            setLoading(false);
        }).catch(() => {
            setError(true);
            onChange({ mask: { ...mask, resourceId: undefined } });
            setLoading(false);
        });
    }

    const maskIsPolygonError = maskLayerData?.collection?.features
        ? !maskLayerData.collection.features.find(({ geometry }) => ['Polygon', 'MultiPolygon'].includes(geometry.type))
        : false;

    const checkIfOtherVectorLayersAreVisible = mergeViewLayers(vectorLayers, view)?.find(layer => !!layer.visibility);

    return (
        <Section
            title={<Message msgId="mapViews.mask" />}
            initialExpanded={expandedSections.mask}
            onExpand={(expanded) => onExpandSection({ mask: expanded })}
        >
            {checkIfOtherVectorLayersAreVisible && <Alert bsStyle="warning" style={{ marginTop: 8 }}>
                <Message msgId="mapViews.maskOtherVisibleLayerWarning"/>
            </Alert>}
            <FormGroup controlId="map-views-mask-enable">
                <Checkbox
                    checked={enabled}
                    disabled={loading}
                    onChange={() => onChange({ mask: { ...mask, enabled: !enabled } })}
                >
                    <Message msgId="mapViews.maskEnable" />
                </Checkbox>
            </FormGroup>
            <FormGroup
                controlId="map-views-mask-layer"
            >
                <ControlLabel><Message msgId="mapViews.maskLayer" /></ControlLabel>
                <Select
                    disabled={!enabled}
                    isLoading={loading}
                    value={maskLayer ? { value: maskLayer?.id, label: getTitle(maskLayer?.title, locale) || maskLayer?.name || maskLayer?.id } : undefined}
                    options={vectorLayers?.map((layer) => ({
                        label: getTitle(layer.title, locale) || layer.name || layer.id,
                        value: layer.id,
                        layer
                    }))}
                    onChange={(option) => handleUpdateLayer({
                        layer: option?.layer,
                        inverse,
                        offset
                    })}
                />
                {maskIsPolygonError && <Alert bsStyle="danger" style={{ marginTop: 8 }}>
                    <Message msgId="mapViews.maskLayerPolygonError"/>
                </Alert>}
                {error && <Alert bsStyle="danger" style={{ marginTop: 8 }}>
                    <Message msgId="mapViews.resourceLayerRequestError"/>
                </Alert>}
            </FormGroup>
            <FormGroup controlId="map-views-mask-inverse">
                <Checkbox
                    checked={inverse}
                    disabled={!enabled || !maskLayer || loading}
                    onChange={() => handleUpdateLayer({
                        layer: maskLayer,
                        inverse: !inverse,
                        offset
                    })}
                >
                    <Message msgId="mapViews.maskInverse" />
                </Checkbox>
            </FormGroup>
            <FormGroup controlId="map-views-mask-inverse-offset">
                <ControlLabel><Message msgId="mapViews.maskInverseOffset" /></ControlLabel>
                <FormControl
                    min={0}
                    className="distance-field"
                    disabled={!enabled || !maskLayer || !inverse || loading}
                    type="number"
                    value={offset}
                    onChange={(value) => handleUpdateLayer({
                        layer: maskLayer,
                        inverse,
                        offset: value
                    })}
                />
            </FormGroup>
            {loading && <div className="ms-map-views-loading-mask"/>}
        </Section>
    );
}

export default MaskSection;
