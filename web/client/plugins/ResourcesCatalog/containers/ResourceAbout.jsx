/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Glyphicon } from 'react-bootstrap';

import axios from '../../../libs/ajax';
import Message from '../../../components/I18N/Message';
import { getInitialSelectedResource } from '../selectors/resources';
import { parseNODATA, DETAILS_DATA_KEY } from '../../../utils/GeostoreUtils';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import Spinner from '../../../components/layout/Spinner';

const ResourceAboutEditor = lazy(() => import('./ResourceAboutEditor'));

/**
 * Checks if a string is a valid resource URL.
 *
 * A valid resource URL:
 * - Ends with `/number` (e.g., `/123`, `/9999`)
 * - Does NOT contain any HTML tags (e.g., `<p>`, `<div>`)
 *
 * @param {string} str - The string to validate.
 * @returns {boolean} `true` if the string is a valid resource URL; otherwise `false`.
 */
const isValidResourceURL = (str) => {
    const regex = /^(?!.*<[^>]+>).*\/\d+$/;
    return regex.test(str);
};

function ResourceAbout({
    detailsUrl,
    editing,
    resource,
    onChange = () => {}
}) {
    const detailsData = resource?.attributes?.[DETAILS_DATA_KEY];
    const about = isValidResourceURL(detailsData) ? '' : (detailsData || '');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (detailsData === undefined && isValidResourceURL(detailsUrl)) {
            setLoading(true);
            axios.get(detailsUrl)
                .then(({ data }) => {
                    onChange({ [`attributes.${DETAILS_DATA_KEY}`]: data }, true);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [detailsUrl, detailsData]);

    if (loading || (!about && !editing)) {
        return (
            <FlexBox classNames={["ms-details-message", '_padding-tb-lg']} centerChildren>
                <div>
                    <Text fontSize="xxl" textAlign="center">
                        {loading ? <Spinner /> : <Glyphicon glyph="sheet" />}
                    </Text>
                    <Text fontSize="lg" textAlign="center">
                        <Message msgId={loading ? 'resourcesCatalog.loadingAbout' : 'resourcesCatalog.noAbout'}/>
                    </Text>
                </div>
            </FlexBox>
        );
    }
    return (
        <div className="_padding-tb-sm" >
            {editing
                ? <Suspense fallback={<Spinner />}>
                    <ResourceAboutEditor
                        value={about}
                        settings={resource?.attributes?.detailsSettings}
                        onChange={onChange}
                    />
                </Suspense>
                : <div dangerouslySetInnerHTML={{ __html: about || '' }} />}
        </div>
    );
}

const ConnectedResourceAbout = connect(
    createStructuredSelector({
        detailsUrl: (state, props) => {
            return parseNODATA(getInitialSelectedResource(state, props)?.attributes?.details);
        }
    })
)(ResourceAbout);

export default ConnectedResourceAbout;
