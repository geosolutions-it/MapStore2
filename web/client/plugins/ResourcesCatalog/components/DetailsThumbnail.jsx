/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import Thumbnail from '../../../components/misc/Thumbnail';
import Icon from './Icon';
import Button from '../../../components/layout/Button';
import tooltip from '../../../components/misc/enhancers/tooltip';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
const ButtonWithToolTip = tooltip(Button);

function DetailsThumbnail({
    icon,
    editing,
    thumbnail,
    width,
    height,
    onChange
}) {
    const thumbnailRef = useRef(null);
    const handleUpload = () => {
        const input = thumbnailRef?.current?.querySelector('input');
        if (input) {
            input.click();
        }
    };

    return (
        <FlexBox
            ref={thumbnailRef}
            classNames={[
                'ms-details-thumbnail',
                'ms-resource-card-img',
                'ms-image-colors',
                '_relative'
            ]}
            centerChildren
        >
            {icon && !thumbnail ? <Text fontSize="xxl"><Icon {...icon} /></Text> : null}
            {editing
                ? <>
                    <Thumbnail
                        style={{ position: 'absolute', width: '100%', height: '100%' }}
                        thumbnail={thumbnail}
                        onUpdate={(data) => {
                            onChange(data);
                        }}
                        thumbnailOptions={{
                            contain: false,
                            width,
                            height,
                            type: 'image/jpg',
                            quality: 0.5
                        }}
                    />
                    <FlexBox className="_absolute _margin-sm _corner-tl">
                        <ButtonWithToolTip
                            variant="primary"
                            square
                            onClick={() => handleUpload()}
                            tooltipId="resourcesCatalog.uploadImage"
                            tooltipPosition={"top"}
                        >
                            <Icon glyph="upload" />
                        </ButtonWithToolTip>
                        <ButtonWithToolTip
                            variant="primary"
                            size="xs"
                            square
                            onClick={() => onChange('')}
                            tooltipId="resourcesCatalog.removeThumbnail"
                            tooltipPosition={"top"}
                        >
                            <Icon glyph="trash" />
                        </ButtonWithToolTip>
                    </FlexBox>
                </>
                : <>
                    {thumbnail ? <img src={thumbnail}/> : null}
                </>}
        </FlexBox>
    );
}

export default DetailsThumbnail;
