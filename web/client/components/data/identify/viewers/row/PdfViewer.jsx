/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import Loader from '../../../../misc/Loader';
import tooltip from '../../../../misc/enhancers/tooltip';
import axios from '../../../../../libs/ajax';

const FullscreenButton = tooltip(Button);

const getFileFromDownload = (downloadURL, type) => axios
    .get(downloadURL, { responseType: 'blob' })
    .then(({ data }) => URL.createObjectURL(new Blob([data], { type })));

const PdfViewer = ({ src, className, title }) => {
    const frameRef = useRef(null);
    const [filePath, setFilePath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        let objectURL;
        setFilePath(null);
        setLoading(true);
        setError(false);
        // blob type is pinned to application/pdf
        // so a response carrying HTML cannot be rendered
        getFileFromDownload(src, 'application/pdf')
            .then((url) => {
                if (!mounted) {
                    URL.revokeObjectURL(url);
                    return;
                }
                objectURL = url;
                setFilePath(url);
            })
            .catch(() => mounted && setError(true))
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
            if (objectURL) {
                URL.revokeObjectURL(objectURL);
            }
        };
    }, [src]);

    return (
        <div className={`ms-pdf${className ? ` ${className}` : ''}`}>
            {loading ? <div className="ms-pdf-loading"><Loader size={70} /></div> : null}
            {error ? <div className="ms-pdf-error"><a href={src} target="_blank" rel="noopener noreferrer">{src}</a></div> : null}
            {!loading && !error ? <>
                <iframe
                    ref={frameRef}
                    className="ms-pdf-frame"
                    src={filePath}
                    title={title}/>
                <FullscreenButton
                    className="square-button-md ms-pdf-fullscreen"
                    tooltipId="identifyShowFullscreen"
                    onClick={() => frameRef.current?.requestFullscreen()}>
                    <Glyphicon glyph="resize-full"/>
                </FullscreenButton>
            </> : null}
        </div>
    );
};

PdfViewer.propTypes = {
    src: PropTypes.string.isRequired,
    className: PropTypes.string,
    title: PropTypes.string.isRequired
};

export default PdfViewer;
