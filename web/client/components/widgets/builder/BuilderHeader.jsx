/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';

import Message from '../../I18N/Message';
import Button from '../../misc/Button';
import FlexBox from '../../layout/FlexBox';
import Text from '../../layout/Text';

/**
 * Common header component for builder content. With close button and icon
 * @name  BuilderHeader
 * @memberof components.widgets.builder
 * @prop {function} onClose
 */
export default ({onClose = () => {}, children} = {}) =>
    (<FlexBox className="widgets-builder-header" column gap="sm" classNames={['_padding-sm']}>
        <FlexBox centerChildrenVertically >
            <div className="square-button-md">
                <Glyphicon glyph="stats"/>
            </div>
            <FlexBox.Fill component={Text} fontSize="md" className="_padding-lr-sm">
                <Message msgId="widgets.builder.header.title" />
            </FlexBox.Fill>
            <Button onClick={() => onClose()} className="ms-close square-button-md _border-transparent">
                <Glyphicon glyph="1-close"/>
            </Button>
        </FlexBox>
        <div className="text-center">
            {children}
        </div>
    </FlexBox>
    );
