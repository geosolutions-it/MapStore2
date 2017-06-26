const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Glyphicon} = require('react-bootstrap');
const MeasureComponent = require('./MeasureComponent');
const Message = require('../../I18N/Message');
const Dialog = require('../../misc/Dialog');


class MeasureDialog extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        closeGlyph: PropTypes.string,
        onClose: PropTypes.func
    };

    static defaultProps = {
        show: false,
        closeGlyph: "1-close"
    };

    onClose = () => {
        this.props.onClose(false);
    };

    render() {
        return this.props.show ? <Dialog>
            <div key="header" role="header">
                <Glyphicon glyph="1-ruler"/>&nbsp;<Message key="title" msgId="measureComponent.Measure"/>
                <button key="close" onClick={this.onClose} className="close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
            </div>
            <div key="body" className="panel-body" role="body">
            <MeasureComponent id="measure-panel" style={{
                minWidth: "500px"
            }}{...this.props}/>
            </div>
        </Dialog> : null;
    }
}

module.exports = MeasureDialog;
