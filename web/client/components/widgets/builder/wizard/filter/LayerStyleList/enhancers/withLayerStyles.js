/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect } from 'react';
import { getLayerCapabilities } from '../../../../../../../observables/wms';
import { getLayerOptions } from '../../../../../../../utils/WMSUtils';

/**
 * Enhancer that fetches layer styles from capabilities API and passes them as props
 * @param {React.Component} Component - The component to enhance
 * @returns {React.Component} Enhanced component with styles, loading, and error props
 */
export default (Component) => (props) => {
    const { layer, styles: stylesProp, stylesLoading: loadingProp, stylesError: errorProp } = props;
    const [styles, setStyles] = useState(stylesProp || []);
    const [loading, setLoading] = useState(loadingProp || false);
    const [error, setError] = useState(errorProp || null);

    useEffect(() => {
        // If styles are provided as props, use them and don't fetch
        if (stylesProp !== undefined) {
            setStyles(stylesProp || []);
            setLoading(loadingProp || false);
            setError(errorProp || null);
            return () => {};
        }

        if (!layer || layer.type !== 'wms' || !layer.url || !layer.name) {
            setStyles([]);
            setLoading(false);
            setError(null);
            return () => {};
        }

        // If styles are already available in the layer, use them
        if (layer.availableStyles && layer.availableStyles.length > 0) {
            setStyles(layer.availableStyles);
            setLoading(false);
            setError(null);
            return () => {};
        }

        // Otherwise, fetch capabilities
        setLoading(true);
        setError(null);
        setStyles([]);

        let cancelled = false;
        const subscription = getLayerCapabilities(layer).subscribe(
            (layerCapability) => {
                if (cancelled) {
                    return;
                }
                if (layerCapability) {
                    const layerOptions = getLayerOptions(layerCapability);
                    const availableStyles = layerOptions.availableStyles || [];
                    setStyles(availableStyles);
                    setLoading(false);
                    setError(null);
                } else {
                    setLoading(false);
                    setError('No layer capabilities found');
                }
            },
            (err) => {
                if (cancelled) {
                    return;
                }
                setLoading(false);
                setError(err?.message || 'Unable to load layer styles');
                setStyles([]);
            }
        );

        return () => {
            cancelled = true;
            if (subscription && subscription.unsubscribe) {
                subscription.unsubscribe();
            }
        };
    }, [layer, stylesProp, loadingProp, errorProp]);

    return (
        <Component
            {...props}
            styles={styles}
            stylesLoading={loading}
            stylesError={error}
        />
    );
};

