/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useRef } from 'react';

import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Popover, Glyphicon } from 'react-bootstrap';
import Overlay from '../../misc/Overlay';
import OverlayTrigger from '../../misc/OverlayTrigger';

/**
 * InfoPopover. A component that renders a icon with a Popover.
 * @prop {string} title the title of popover
 * @prop {string} text the text of popover
 * @prop {string} glyph glyph id for the icon
 * @prop {number} left left prop of popover
 * @prop {number} right right prop of popover
 * @prop {string} placement position of popover
 * @prop {object} popoverStyle style for popover wrapper
 * @prop {boolean|String[]} trigger ['hover', 'focus'] by default. false always show the popover. Array with hover, focus and/or click string to specify events that trigger popover to show.
 */
const InfoPopover = ({
    id,
    title,
    text,
    glyph,
    bsStyle,
    placement,
    left,
    top,
    trigger,
    popoverStyle
}) => {
    const targetRef = useRef(null);
    // bumped on window resize to force Overlay/Position to recompute layout
    const [, setResizeTick] = useState(0);

    useEffect(() => {
        let timeoutId;
        const onResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setResizeTick(t => t + 1), 100);
        };
        window.addEventListener('resize', onResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const renderPopover = () => (
        <Popover
            id={id}
            placement={placement}
            positionLeft={left}
            positionTop={top}
            title={title}
            style={popoverStyle}>
            {text}
        </Popover>
    );

    const renderContent = () => (
        <Glyphicon
            ref={button => { targetRef.current = button; }}
            className={`text-${bsStyle}`}
            glyph={glyph} />
    );

    const effectiveTrigger = trigger === true ? ['hover', 'focus'] : trigger;

    return (
        <span className="mapstore-info-popover">
            {trigger
                ? (<OverlayTrigger trigger={effectiveTrigger} placement={placement} shouldUpdatePosition overlay={renderPopover()}>
                    {renderContent()}
                </OverlayTrigger>)
                : [
                    renderContent(),
                    <Overlay placement={placement} show shouldUpdatePosition target={() => ReactDOM.findDOMNode(targetRef.current)}>
                        {renderPopover()}
                    </Overlay>
                ]}
        </span>
    );
};

InfoPopover.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    text: PropTypes.string,
    glyph: PropTypes.string,
    bsStyle: PropTypes.string,
    placement: PropTypes.string,
    left: PropTypes.number,
    top: PropTypes.number,
    trigger: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
    popoverStyle: PropTypes.object
};

InfoPopover.defaultProps = {
    id: '',
    title: '',
    text: '',
    placement: 'right',
    left: 200,
    top: 50,
    glyph: "question-sign",
    bsStyle: 'info',
    trigger: ['hover', 'focus']
};

export default InfoPopover;
