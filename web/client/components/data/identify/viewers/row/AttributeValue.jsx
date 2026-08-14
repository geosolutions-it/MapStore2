/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import Image from '../../../../geostory/media/Image';
import Video from '../../../../geostory/media/Video';
import { Modes } from '../../../../../utils/GeoStoryUtils';
import PdfViewer from './PdfViewer';
import { resolveAttributeDisplayType } from '../../../../../utils/FeatureInfoAttributeUtils';
import { isValidURL } from '../../../../../utils/URLUtils';
import { IFRAME_SANDBOX, IFRAME_REFERRER_POLICY } from '../../../../../utils/HtmlSanitizer';

const PanoramaViewer = lazy(() => import('./PanoramaViewer'));

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
        return <Suspense fallback={null}><PanoramaViewer value={value} alt={label}/></Suspense>;
    }
    if (displayType === 'pdf') {
        return isValidURL(value) ? <PdfViewer src={value} title={label}/> : formatAttributeValue(value);
    }
    if (displayType === 'iframe') {
        return isValidURL(value)
            ? <iframe
                className="ms-feature-info-attribute-media ms-feature-info-attribute-iframe"
                src={value}
                title={label}
                sandbox={IFRAME_SANDBOX}
                referrerPolicy={IFRAME_REFERRER_POLICY}/>
            : formatAttributeValue(value);
    }
    if (displayType === 'url') {
        return isValidURL(value)
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
