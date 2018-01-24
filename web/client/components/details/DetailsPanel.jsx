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
const ContainerDimensions = require('react-container-dimensions').default;
const Dock = require('react-dock').default;
const BorderLayout = require('../layout/BorderLayout');
const {NO_DETAILS_AVAILABLE} = require('../../actions/maps');
const LocaleUtils = require('../../utils/LocaleUtils');
const Spinner = require('react-spinkit');

class DetailsPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        closeGlyph: PropTypes.string,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        style: PropTypes.object,
        onClose: PropTypes.function,
        dockProps: PropTypes.object,
        width: PropTypes.number,
        detailsText: PropTypes.string,
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
        detailsText: "",
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

        return (<ContainerDimensions>
            { ({ width }) =>
                <Dock dockStyle={this.props.dockStyle} {...this.props.dockProps} isVisible={this.props.active} size={this.props.width / width > 1 ? 1 : this.props.width / width} >
                    <Panel id={this.props.id} header={panelHeader} style={this.props.panelStyle} className={this.props.panelClassName}>
                        <BorderLayout>
                            <div className="ms-details-preview-container">
                                    {!this.props.detailsText ?
                                        <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/> :
                                        <div className="ms-details-preview" dangerouslySetInnerHTML={{ __html:
                                                this.props.detailsText === NO_DETAILS_AVAILABLE ? LocaleUtils.getMessageById(this.context.messages, "maps.feedback.noDetailsAvailable") : this.props.detailsText }} />}
                            </div>
                        </BorderLayout>
                    </Panel>
                </Dock>
            }
        </ContainerDimensions>);
    }
}


module.exports = DetailsPanel;
