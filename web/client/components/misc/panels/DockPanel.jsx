/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Dock = require('react-dock').default;
const BorderLayout = require('../../layout/BorderLayout');
const {withState} = require('recompose');
const PanelHeader = require('./PanelHeader');

/**
 * Component for rendering a DockPanel
 * @memberof components.misc.panels
 * @name DockPanel
 * @class
 * @prop {bool} fluid true calculates the size as a fraction of screen width/height
 * @prop {string} className additional class name
 * @prop {string} position side of the screen where the panel is located, top, bottom, left and right
 * @prop {bool} open show/hide component
 * @prop {number} size size of panel 0.0 to 1.0 if fluid instead of px value
 * @prop {object} style style of dock panel
 * @prop {number} zIndex panel z index
 * @prop {function} onClose callback on click close icon
 * @prop {string} bsStyle default or primary
 * @prop {node} title title on header
 * @prop {bool} showFullscreen enable fullscreen
 * @prop {string} glyph glyph displayed on top corner of panel
 * @prop {node} header additional element for header
 * @prop {node} footer footer content
 * @prop {bool} hideHeader hide header
 */

module.exports = withState('fullscreen', 'onFullscreen', false)(
    ({
        fluid,
        className = '',
        fullscreen = false,
        position,
        open,
        size = 550,
        style = {},
        zIndex = 1030,
        onClose,
        bsStyle,
        title,
        showFullscreen = false,
        glyph,
        header,
        footer,
        children,
        onFullscreen = () => {},
        fixed = false,
        resizable = false,
        hideHeader
    }) =>
        <div className={'ms-side-panel ' + (!fixed ? 'ms-absolute-dock ' : '') +  (!resizable ? 'react-dock-no-resize ' : '') + className}>
            <Dock
                fluid={fluid || fullscreen}
                position={position}
                dimMode="none"
                isVisible={open}
                size={fullscreen ? 1 : size}
                dockStyle={style}
                zIndex={zIndex}>
                <BorderLayout
                    header={
                        !hideHeader && open && <PanelHeader
                            position={position}
                            onClose={onClose}
                            bsStyle={bsStyle}
                            title={title}
                            fullscreen={fullscreen}
                            showFullscreen={showFullscreen}
                            glyph={glyph}
                            additionalRows={header}
                            onFullscreen={onFullscreen}/>
                    }
                    footer={open && footer}>
                    {open && children}
                </BorderLayout>
            </Dock>
        </div>
);
