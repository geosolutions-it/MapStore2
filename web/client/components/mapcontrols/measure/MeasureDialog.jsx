/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');
const React = require('react');
const MeasureComponent = require('./MeasureComponent');
const DockablePanel = require('../../misc/panels/DockablePanel');

class MeasureDialog extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        closeGlyph: PropTypes.string,
        onClose: PropTypes.func,
        style: PropTypes.object
    };

    static defaultProps = {
        show: false,
        closeGlyph: "1-close",
        style: {
            // Needs map layout selector see Identify Plugin
            height: 'calc(100% - 30px)'
        }
    };

    onClose = () => {
        this.props.onClose(false);
    };

    render() {
        return this.props.show ? (
            <DockablePanel
            dock
            bsStyle="primary"
            position="right"
            title="Measure"
            glyph="1-ruler"
            size={660}
            open={this.props.show}
            onClose={this.onClose}
            style={this.props.style}>
                <MeasureComponent id="measure-panel" {...this.props}/>
            </DockablePanel>
        ) : null;
    }
}

module.exports = MeasureDialog;
