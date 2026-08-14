import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Loader from '../../../../misc/Loader';
import { getFileFromDownload } from '../../../../../utils/FileUtils';

const PdfViewer = ({ src, title }) => {
    const [filePath, setFilePath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        let objectURL;
        setFilePath(null);
        setLoading(true);
        setError(false);
        getFileFromDownload(src)
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

    if (loading) {
        return <Loader size={70} style={{ margin: '0 auto' }} />;
    }
    if (error) {
        return <a href={src} target="_blank" rel="noopener noreferrer">{src}</a>;
    }
    return (
        <iframe
            className="ms-feature-info-attribute-media ms-feature-info-attribute-pdf"
            src={filePath}
            title={title}/>
    );
};

PdfViewer.propTypes = {
    src: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
};

export default PdfViewer;
