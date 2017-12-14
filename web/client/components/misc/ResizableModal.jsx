/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {Glyphicon} = require('react-bootstrap');
const Dialog = require('./Dialog');
const Toolbar = require('./toolbar/Toolbar');

const sizes = {
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
 * @prop {bool} fullscreen enable fullscreen. Default false
 * @prop {bool} clickOutEnabled click on background overlay to close modal. Default true
 * @prop {string} fullscreenType type of fullscreen sm, lg or md/empty.
 * @prop {function} onClose callback on close.
 * @prop {node} title string or component for header title.
 * @prop {array} buttons array of buttons object see Toolbar.
 * @prop {string} size size of modal sm, lg or md/empty. Default ''
 * @prop {string} bodyClassName custom class for modal body.
 *
 */
class ResizableModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        fullscreen: PropTypes.bool,
        clickOutEnabled: PropTypes.bool,
        fullscreenType: PropTypes.string,
        onClose: PropTypes.func,
        title: PropTypes.node,
        buttons: PropTypes.array,
        size: PropTypes.string,
        bodyClassName: PropTypes.string
    };

    static defaultProps = {
        show: false,
        onClose: () => {},
        title: '',
        clickOutEnabled: true,
        fullscreen: false,
        fullscreenType: 'full',
        buttons: [],
        size: '',
        bodyClassName: ''
    };

    state = {
        fullscreen: 'collapsed'
    };

    render() {
        // TODO VERIFY that the dialog id can be customizable or a fixed value
        const sizeClassName = sizes[this.props.size] || '';
        const fullscreenClassName = this.props.fullscreen && this.state.fullscreen === 'expanded' && fullscreen.className[this.props.fullscreenType] || '';
        return (
            <span className={this.props.show ? "modal-fixed" : ""}>
                <Dialog
                    id="ms-resizable-modal"
                    style={{display: this.props.show ? 'flex' : 'none'}}
                    onClickOut={this.props.clickOutEnabled ? this.props.onClose : () => {}}
                    containerClassName="ms-resizable-modal"
                    draggable={false}
                    modal
                    className={'modal-dialog modal-content' + sizeClassName + fullscreenClassName}>
                    <span role="header">
                        <h4 className="modal-title">
                            <div className="ms-title">{this.props.title}</div>
                            {this.props.fullscreen && fullscreen.className[this.props.fullscreenType] &&
                                <Glyphicon
                                    className="ms-header-btn"
                                    onClick={() => {
                                        this.setState({
                                            fullscreen: this.state.fullscreen === 'expanded' ? 'collapsed' : 'expanded'
                                        });
                                    }}
                                    glyph={fullscreen.glyph[this.state.fullscreen][this.props.fullscreenType]}/>
                            }
                            {this.props.onClose &&
                                <Glyphicon
                                    glyph="1-close"
                                    className="ms-header-btn"
                                    onClick={this.props.onClose}/>
                            }
                        </h4>
                    </span>
                    <div role="body" className={this.props.bodyClassName}>
                        {this.props.children}
                    </div>
                    <div role="footer">
                        <Toolbar buttons={this.props.buttons}/>
                    </div>
                </Dialog>
            </span>
        );
    }
}

module.exports = ResizableModal;
