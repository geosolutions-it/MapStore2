/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Glyphicon } from 'react-bootstrap';
import 'pannellum/build/pannellum.js';
import 'pannellum/build/pannellum.css';
import Spinner from '../../../../layout/Spinner';

const PanoramaViewer = ({ value, alt = 'Panorama Image' }) => {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let viewer;
        setLoading(true);
        setError(null);
        try {
            viewer = window.pannellum.viewer(containerRef.current, {
                type: 'equirectangular',
                panorama: value,
                autoLoad: true,
                showFullscreenCtrl: false
            });
            viewer.on('load', () => setLoading(false));
            viewer.on('error', (reason) => {
                setError(reason || 'Panorama loading error');
                setLoading(false);
            });
        } catch (reason) {
            setError(reason.message || 'Panorama initialization error');
            setLoading(false);
        }
        return () => viewer?.destroy();
    }, [value]);

    return (
        <div className="ms-feature-info-attribute-panorama">
            {error ? <><img src={value} alt={alt}/><div className="ms-feature-info-attribute-panorama-error"><Alert bsStyle="danger"><Glyphicon glyph="exclamation-sign"/> {error}</Alert></div></> : null}
            {loading && !error ? <div className="ms-feature-info-attribute-panorama-loading"><Spinner /></div> : null}
            <div ref={containerRef} aria-label={alt} className="ms-feature-info-attribute-panorama-viewer"/>
        </div>
    );
};

PanoramaViewer.propTypes = { value: PropTypes.string.isRequired, alt: PropTypes.string };
export default PanoramaViewer;
