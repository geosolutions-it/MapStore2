/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Dialog = require('../misc/Dialog');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../../components/I18N/Message');

const SavePanel = React.createClass({

    propTypes: {
        isVisible: React.PropTypes.bool,
        title: React.PropTypes.node,
        onClose: React.PropTypes.func,
        getCount: React.PropTypes.func,
        closeGlyph: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            title: <Message msgId="map.saveTitle"/>,
            onClose: () => {}
        };
    },
    render() {

        let sharePanel = (
            <Dialog id="share-panel-dialog" className="modal-dialog modal-content share-win">
                <span role="header">
                    <span className="share-panel-title">
                        <Message msgId="map.saveTitle"/>
                    </span>
                    <button onClick={this.props.onClose} className="print-panel-close close">
                        {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}
                    </button>
                </span>
                <div role="body" className="share-panels">

                </div>
            </Dialog>);

        return this.props.isVisible ? sharePanel : null;
    }
});

module.exports = SavePanel;
