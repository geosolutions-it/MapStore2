/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const Message = require('../I18N/Message');
const {Glyphicon, Panel} = require('react-bootstrap');
const Dock = require('react-dock').default;
const BorderLayout = require('../layout/BorderLayout');
const ResizeDetector = require('react-resize-detector').default;

class DetailsPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        closeGlyph: PropTypes.string,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        style: PropTypes.object,
        onClose: PropTypes.func,
        dockProps: PropTypes.object,
        width: PropTypes.number,
        dockStyle: PropTypes.object
    }

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        id: "mapstore-details",
        panelStyle: {
            zIndex: 100,
            overflow: "hidden",
            height: "100%",
            marginBottom: 0
        },
        onClose: () => {},
        active: false,
        panelClassName: "details-panel",
        width: 658,
        closeGlyph: "1-close",
        dockProps: {
            dimMode: "none",
            size: 0.30,
            fluid: true,
            position: "right",
            zIndex: 1030,
            bottom: 0
        },
        dockStyle: {}
    }

    render() {
        const panelHeader = (
            <span>
                <Glyphicon glyph="sheet"/>
                <span className="details-panel-title">
                    <Message msgId="details.title"/>
                </span>
                <button onClick={() => this.props.onClose()} className="details-close close">
                    {this.props.closeGlyph ?
                        <Glyphicon glyph={this.props.closeGlyph} /> :
                        <span>×</span>}</button>
            </span>);

        return (
            <ResizeDetector handleWidth>
                { ({ width }) =>
                    <div className="react-dock-no-resize">
                        <Dock dockStyle={this.props.dockStyle} {...this.props.dockProps} isVisible={this.props.active} fluid size={this.props.width / width > 1 ? 1 : this.props.width / width}>
                            <Panel id={this.props.id} header={panelHeader} style={this.props.panelStyle} className={this.props.panelClassName}>
                                <BorderLayout>
                                    {this.props.children}
                                </BorderLayout>
                            </Panel>
                        </Dock>
                    </div>
                }
            </ResizeDetector>
        );
    }
}


module.exports = DetailsPanel;
