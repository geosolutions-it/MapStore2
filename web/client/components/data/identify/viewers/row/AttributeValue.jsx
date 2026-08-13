import React from 'react';
import PropTypes from 'prop-types';
import Image from '../../../../geostory/media/Image';
import Video from '../../../../geostory/media/Video';
import { Modes } from '../../../../../utils/GeoStoryUtils';
import PanoramaViewer from './PanoramaViewer';
import PdfViewer from './PdfViewer';
import {
    isSafeFeatureInfoURL,
    resolveAttributeDisplayType
} from '../../../../../utils/FeatureInfoAttributeUtils';

export const formatAttributeValue = (value) => {
    if (typeof value === 'string') {
        return value;
    }
    if (value === undefined || value === null) {
        return '';
    }
    return JSON.stringify(value);
};

const AttributeValue = ({ value, attribute = {}, mediaTypeValue }) => {
    const displayType = resolveAttributeDisplayType({ value, attribute, mediaTypeValue });
    if (typeof value !== 'string' || displayType === 'string') {
        return formatAttributeValue(value);
    }
    const label = typeof attribute.alias === 'string'
        ? attribute.alias
        : attribute.name || value;
    if (displayType === 'image') {
        return <div className="ms-feature-info-attribute-media ms-feature-info-attribute-image"><Image src={value} altText={label} enableFullscreen fit="contain"/></div>;
    }
    if (displayType === 'video') {
        return <div className="ms-feature-info-attribute-media ms-feature-info-attribute-video"><Video src={value} mode={Modes.VIEW} inView fit="contain"/></div>;
    }
    if (displayType === 'audio') {
        return <audio className="ms-feature-info-attribute-media" src={value} controls><a href={value}>{value}</a></audio>;
    }
    if (displayType === 'panorama') {
        return <PanoramaViewer value={value} alt={label}/>;
    }
    if (displayType === 'pdf') {
        return isSafeFeatureInfoURL(value) ? <PdfViewer src={value} title={label}/> : formatAttributeValue(value);
    }
    if (displayType === 'iframe') {
        return isSafeFeatureInfoURL(value)
            ? <iframe
                className="ms-feature-info-attribute-media ms-feature-info-attribute-iframe"
                src={value}
                title={label}
                sandbox="allow-scripts allow-same-origin"/>
            : formatAttributeValue(value);
    }
    if (displayType === 'url') {
        return isSafeFeatureInfoURL(value)
            ? <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
            : formatAttributeValue(value);
    }
    return formatAttributeValue(value);
};

AttributeValue.propTypes = {
    value: PropTypes.any,
    attribute: PropTypes.object,
    mediaTypeValue: PropTypes.any
};

export default AttributeValue;
