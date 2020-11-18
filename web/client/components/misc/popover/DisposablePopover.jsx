/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useRef, useState} from 'react';

import {
    Popover,
    Glyphicon
} from 'react-bootstrap';

import Overlay from '../../misc/Overlay';


/**
 * DisposablePopover. A component that renders a icon with a Popover.
 * clicking on the icon opens the info tool. A close button, or clicking
 * on the same icon closes the popup.
 * @prop {string} title the title of popover
 * @prop {string} text the text of popover
 * @prop {string} glyph glyph id for the icon
 * @prop {number} left left prop of popover
 * @prop {number} right right prop of popover
 * @prop {string} placement position of popover
 */
export default function DisposablePopover({
    showOnRender,
    placement,
    id,
    left,
    top,
    title,
    text,
    bsStyle = "info",
    glyph = "question-sign"
}) {
    const [show, setShow] = useState(showOnRender);
    let target = useRef(null);
    return (
        <>
            <Glyphicon
                onClick={() => setShow(!show)}
                ref={r => (target.current = r)}
                style={{
                    cursor: 'pointer'
                }}
                className={`text-${bsStyle}`}
                glyph={glyph} />
            <Overlay
                target={target.current}
                show={show}
                placement={placement}>
                <Popover
                    id={id}
                    placement={placement}
                    positionLeft={left}
                    positionTop={top}
                    title={title}>
                    <Glyphicon glyph="1-close" style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        margin: 8
                    }}onClick={() => setShow(false)} />
                    {text}
                </Popover>
            </Overlay>
        </>
    );
}

/*
    static propTypes = {
        id: PropTypes.string,
        title: PropTypes.string,
        text: PropTypes.string,
        glyph: PropTypes.string,
        bsStyle: PropTypes.string,
        placement: PropTypes.string,
        left: PropTypes.number,
        top: PropTypes.number,
        trigger: PropTypes.oneOfType([PropTypes.array, PropTypes.bool])
    };

    static defaultProps = {
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
    */
