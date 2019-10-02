/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button, Glyphicon, Grid, Row, Col} = require('react-bootstrap');

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

module.exports = ({
    position = 'right',
    onClose,
    bsStyle = 'default',
    title = '',
    fullscreen = false,
    showFullscreen = false,
    glyph = 'info-sign',
    additionalRows,
    onFullscreen = () => {}
}) => {
    const closeButton = !onClose ? null : (
        <Button key="ms-header-close" className="square-button ms-close" onClick={onClose} bsStyle={bsStyle}>
            <Glyphicon glyph="1-close"/>
        </Button>
    );
    const glyphButton = showFullscreen ? (
        <Button
            key="ms-header-glyph"
            className="square-button"
            bsStyle={bsStyle}
            onClick={() => onFullscreen(!fullscreen)}>
            <Glyphicon glyph={fullscreenGlyph[position] && fullscreenGlyph[position][fullscreen] || 'resize-full'}/>
        </Button>) :
        (<div
            key="ms-header-glyph"
            className={`square-button ${'bg-' + bsStyle}`}
            style={{display: 'flex'}}>
            <Glyphicon glyph={glyph} className={`${bsStyle === 'default' ? 'text-primary' : '' }`}/>
        </div>
        );
    const buttons = position === 'left' ? [closeButton, glyphButton] : [glyphButton, closeButton];
    return (
        <Grid fluid style={{width: '100%'}} className={'ms-header ms-' + bsStyle}>
            <Row>
                <Col xs={2}>
                    {buttons[0]}
                </Col>
                <Col xs={8}>
                    <h4>{title}</h4>
                </Col>
                <Col xs={2}>
                    {buttons[1]}
                </Col>
            </Row>
            {additionalRows}
        </Grid>
    );
};
