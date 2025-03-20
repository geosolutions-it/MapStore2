/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, lazy, Suspense } from 'react';
import axios from '../../../libs/ajax';
import Message from '../../../components/I18N/Message';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getInitialSelectedResource } from '../selectors/resources';
import { parseNODATA } from '../utils/ResourcesUtils';
import FlexBox from '../../../components/layout/FlexBox';
import Icon from '../components/Icon';
import Text from '../../../components/layout/Text';
import Spinner from '../../../components/layout/Spinner';

const ResourceAboutEditor = lazy(() => import('./ResourceAboutEditor'));

function ResourceAbout({
    detailsUrl,
    editing,
    resource,
    onChange = () => {}
}) {
    const details = parseNODATA(resource?.attributes?.details || '');
    const [about, setAbout] = useState(detailsUrl ? '' : details);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (detailsUrl) {
            setLoading(true);
            axios.get(detailsUrl)
                .then(({ data }) => {
                    setAbout(data);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [detailsUrl]);

    if (loading || (!about && !editing)) {
        return (
            <FlexBox classNames={["ms-details-message", '_padding-tb-lg']} centerChildren>
                <div>
                    <Text fontSize="xxl" textAlign="center">
                        {loading ? <Spinner /> : <Icon glyph="sheet" type="glyphicon" />}
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
