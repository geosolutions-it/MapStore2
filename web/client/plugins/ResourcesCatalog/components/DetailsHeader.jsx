/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Glyphicon } from 'react-bootstrap';

import Button from '../../../components/layout/Button';
import Spinner from '../../../components/layout/Spinner';
import DetailsThumbnail from './DetailsThumbnail';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import { getResourceInfo } from '../../../utils/ResourcesUtils';

function DetailsHeader({
    resource,
    editing,
    onChangeThumbnail,
    onClose,
    tools,
    loading,
    thumbnailComponent = DetailsThumbnail,
    children
}) {

    const [titleNodeRef, titleInView] = useInView();

    const {
        icon,
        title,
        thumbnailUrl
    } = getResourceInfo(resource);

    const Thumbnail = thumbnailComponent;

    return (
        <>
            <div className="ms-details-header _sticky _corner-tl">
                <FlexBox
                    centerChildrenVertically
                    gap="sm"
                    classNames={[
                        'ms-main-colors',
                        '_absolute',
                        '_padding-md',
                        ...(titleInView ? ['_pointer-events-none'] : [])
                    ]}
                    style={{ width: '100%', ...(titleInView && { background: 'transparent' }) }}>
                    <FlexBox.Fill>
                        <Text ellipsis >
                            {(!titleInView && title) ? <><Glyphicon {...icon} />{' '}</> : null}
                            {(!titleInView && title) ? title : null}
                        </Text>
                    </FlexBox.Fill>
                    {(!titleInView && title) ? tools : null}
                    <div className="_pointer-events-auto">
                        <Button
                            variant="default"
                            onClick={onClose}
                            square
                            borderTransparent
                        >
                            <Glyphicon glyph="1-close" />
                        </Button>
                    </div>
                </FlexBox>
            </div>
            <Thumbnail
                editing={editing}
                icon={icon}
                key={resource?.id}
                resource={resource}
                thumbnail={thumbnailUrl}
                width={640}
                height={130}
                onChange={onChangeThumbnail}
            />
            <div ref={titleNodeRef}></div>
            <FlexBox className="ms-details-header-info" gap="sm" classNames={['_padding-md']}>
                <FlexBox.Fill>
                    <Text fontSize="lg">
                        {!loading ? <Glyphicon {...icon} /> : <Spinner />}{' '}
                        {title}
                    </Text>
                </FlexBox.Fill>
                {tools}
            </FlexBox>
            {children}
        </>
    );
}

export default DetailsHeader;
