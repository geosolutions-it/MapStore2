/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useState, useEffect } from 'react';
import { describeFeatureType } from '../../../../../../../observables/wfs';
import { describeFeatureTypeToAttributes } from '../../../../../../../utils/FeatureTypeUtils';

// Inline utility functions
const getLayerKey = (layer, layerId = null) => {
    if (layer && typeof layer === 'object') {
        return layer.id || layer.name || layerId;
    }
    return layerId;
};

const mapAttributesToOptions = (attributes = []) => {
    return attributes.map(attribute => ({
        value: attribute.value || attribute.attribute || attribute.name,
        label: attribute.label || attribute.alias || attribute.value || attribute.attribute || attribute.name
    }));
};

/**
 * Custom hook for loading layer attributes from WFS describeFeatureType.
 *
 * @param {object|null} selectedLayer - Selected layer object
 * @param {boolean} hasLayerSelection - Whether a valid layer is selected
 * @returns {object} { attributeOptions, isLoading, error }
 */
export const useLayerAttributes = (selectedLayer, hasLayerSelection = false) => {
    const [attributes, setAttributes] = useState({ key: null, options: [] });
    const [attributesLoading, setAttributesLoading] = useState(false);
    const [attributesError, setAttributesError] = useState(null);

    const selectedLayerKey = getLayerKey(selectedLayer);

    useEffect(() => {
        let cancelled = false;

        // Early returns for edge cases
        if (!selectedLayerKey || !hasLayerSelection) {
            setAttributesLoading(false);
            setAttributesError(null);
            setAttributes({ key: null, options: [] });
            return () => {};
        }

        if (!selectedLayer?.name) {
            // Layer missing required name property
            setAttributesLoading(false);
            setAttributesError('Selected layer is missing a valid name');
            setAttributes({ key: null, options: [] });
            return () => {};
        }

        // Fetch attributes from WFS
        setAttributesLoading(true);
        setAttributesError(null);
        setAttributes({ key: null, options: [] });

        const subscription = describeFeatureType({ layer: selectedLayer }).subscribe(
            (response = {}) => {
                if (cancelled) {
                    return;
                }

                const featureAttributes = describeFeatureTypeToAttributes(
                    response?.data,
                    selectedLayer?.fields || []
                );
                const options = mapAttributesToOptions(featureAttributes);

                setAttributes({
                    key: selectedLayerKey,
                    options
                });
                setAttributesLoading(false);
            },
            (error = {}) => {
                if (cancelled) {
                    return;
                }

                setAttributes({ key: null, options: [] });
                setAttributesLoading(false);
                setAttributesError(error?.message || 'Unable to load attributes');
            }
        );

        return () => {
            cancelled = true;
            if (subscription && subscription.unsubscribe) {
                subscription.unsubscribe();
            }
        };
    }, [selectedLayerKey, hasLayerSelection, selectedLayer]);

    // Get attributes for current layer
    const attributeOptions = selectedLayerKey && attributes.key === selectedLayerKey
        ? attributes.options
        : [];

    return {
        attributeOptions,
        isLoading: attributesLoading && !attributeOptions.length,
        error: attributesError
    };
};

