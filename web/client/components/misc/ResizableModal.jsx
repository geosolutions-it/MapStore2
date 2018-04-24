/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {Glyphicon} = require('react-bootstrap');
const Dialog = require('./Dialog');
const Toolbar = require('./toolbar/Toolbar');
const {withState} = require('recompose');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const LoadingSpinner = require('./LoadingSpinner');


const sizes = {
    xs: ' ms-xs',
    sm: ' ms-sm',
    md: '',
    lg: ' ms-lg'
};

const fullscreen = {
    className: {
        vertical: ' ms-fullscreen-v',
        horizontal: ' ms-fullscreen-h',
        full: ' ms-fullscreen'
    },
    glyph: {
        expanded: {
            vertical: 'resize-vertical',
            horizontal: 'resize-horizontal',
            full: 'resize-small'
        },
        collapsed: {
            vertical: 'resize-vertical',
            horizontal: 'resize-horizontal',
            full: 'resize-full'
        }
    }
};

/**
 * Component for rendering a responsive dialog modal.
 * @memberof components.ResizableModal
 * @class
 * @prop {bool} show show modal. Default false
 * @prop {bool} showFullscreen enable fullscreen. Default false
 * @prop {bool} clickOutEnabled click on background overlay to close modal. Default true
 * @prop {string} fullscreenType type of fullscreen sm, lg or md/empty.
 * @prop {function} onClose callback on close.
 * @prop {node} title string or component for header title.
 * @prop {array} buttons array of buttons object see Toolbar.
 * @prop {string} size size of modal sm, lg or md/empty. Default ''
 * @prop {string} bodyClassName custom class for modal body.
 * @prop {bool} draggable enable modal drag.
 */

const ResizableModal = ({
    show = false,
    loading,
    onClose = () => {},
    title = '',
    clickOutEnabled = true,
    showClose = true,
    disabledClose = false,
    showFullscreen = false,
    fullscreenType = 'full',
    buttons = [],
    size = '',
    bodyClassName = '',
    children,
    draggable = false,
    fullscreenState,
    onFullscreen,
    fade = false
}) => {
    const sizeClassName = sizes[size] || '';
    const fullscreenClassName = showFullscreen && fullscreenState === 'expanded' && fullscreen.className[fullscreenType] || '';
    const dialog = show ? (
        <div className={'modal-fixed ' + (draggable ? 'ms-draggable' : '')}>
            <Dialog
                id="ms-resizable-modal"
                style={{display: 'flex'}}
                onClickOut={clickOutEnabled ? onClose : () => {}}
                containerClassName="ms-resizable-modal"
                draggable={draggable}
                modal
                className={'modal-dialog modal-content' + sizeClassName + fullscreenClassName}>
                <span role="header">
                    <h4 className="modal-title">
                        <div className="ms-title">{title}</div>
                        {showFullscreen && fullscreen.className[fullscreenType] &&
                            <Glyphicon
                                className="ms-header-btn"
                                onClick={() => onFullscreen(fullscreenState === 'expanded' ? 'collapsed' : 'expanded')}
                                glyph={fullscreen.glyph[fullscreenState][fullscreenType]}/>
                        }
                        {showClose && onClose &&
                            <Glyphicon
                                glyph="1-close"
                                className="ms-header-btn"
                                onClick={onClose}
                                disabled={disabledClose}/>
                        }
                    </h4>
                </span>
                <div role="body" className={bodyClassName}>
                    {children}
                </div>
                <div role="footer">
                    {loading ? <LoadingSpinner style={{
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        margin: 18
                    }}/> : null}
                    <Toolbar buttons={buttons}/>
                </div>
            </Dialog>
        </div>) : null;
    return fade ?
        (<ReactCSSTransitionGroup
            transitionName="ms-resizable-modal-fade"
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
            {dialog}
        </ReactCSSTransitionGroup>) : dialog;
};

module.exports = withState('fullscreenState', 'onFullscreen', 'collapsed')(ResizableModal);
