/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { Glyphicon } from 'react-bootstrap';
import Button from '../../misc/Button';
import FlexBox from '../../layout/FlexBox';
import Text from '../../layout/Text';

/* eslint-disable */
const fullscreenGlyph = {
    bottom: {
        true: 'chevron-down',
        false: 'chevron-up'
    },
    top: {
        true: 'chevron-up',
        false: 'chevron-down'
    },
    right: {
        true: 'chevron-right',
        false: 'chevron-left'
    },
    left: {
        true: 'chevron-left',
        false: 'chevron-right'
    }
};

/* eslint-enable */

/**
 * Component for rendering a PanelHeader
 * @memberof components.misc.panels
 * @name PanelHeader
 * @class
 * @prop {string} position side of the screen where the panel is located, top, bottom, left and right
 * @prop {function} onClose callback on click close icon
 * @prop {string} bsStyle default or primary
 * @prop {node} title title on header
 * @prop {bool} fullscreen current fullscreen state
 * @prop {bool} showFullscreen enable fullscreen
 * @prop {string} glyph glyph displayed on top corner of header
 * @prop {node} additionalRows additional element for header
 * @prop {function} onFullscreen return state of fullscreen
 */

export default ({
    position = 'right',
    onClose,
    title = '',
    fullscreen = false,
    showFullscreen = false,
    glyph = 'info-sign',
    additionalRows,
    onFullscreen = () => {}
}) => {
    const closeButton = !onClose ? null : (
        <Button key="ms-header-close" className="ms-close square-button-md _border-transparent" onClick={onClose}>
            <Glyphicon glyph="1-close"/>
        </Button>
    );
    const glyphButton = showFullscreen ? (
        <Button
            key="ms-header-glyph"
            className="square-button-md _border-transparent"
            onClick={() => onFullscreen(!fullscreen)}>
            <Glyphicon glyph={fullscreenGlyph[position] && fullscreenGlyph[position][fullscreen] || 'resize-full'}/>
        </Button>) : glyph ?
        (<div
            key="ms-header-glyph"
            className={`square-button-md _border-transparent`}>
            <Glyphicon glyph={glyph}/>
        </div>
        ) : null;
    return (
        <FlexBox classNames={['ms-header', '_padding-sm']} gap="sm" column>
            <FlexBox centerChildrenVertically>
                {glyphButton}
                <FlexBox.Fill component={Text} fontSize="md" className="_padding-lr-sm">
                    {title}
                </FlexBox.Fill>
                {closeButton}
            </FlexBox>
            {additionalRows}
        </FlexBox>
    );
};
