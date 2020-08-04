var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const InfoButton = require('../../../../components/buttons/InfoButton');
const Dialog = require('../../../../components/misc/Dialog');
const AboutContent = require('./AboutContent');
const {Message} = require('../../../../components/I18N/I18N');
const aboutImg = require('../../../assets/img/Blank.gif');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');

class About extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        modalConfig: PropTypes.object,
        withButton: PropTypes.bool,
        enabled: PropTypes.bool,
        onClose: PropTypes.func
    };

    static defaultProps = {
        style: {
            position: "absolute",
            zIndex: 1000,
            bottom: "-8px",
            right: "0px",
            margin: "8px"
        },
        modalConfig: {
            closeGlyph: "1-close"
        },
        withButton: true,
        enabled: false,
        onClose: () => {}
    };

    render() {
        return this.props.withButton ? (
            <InfoButton
                {...this.props.modalConfig}
                image={aboutImg}
                title={<Message msgId="about_title"/>}
                btnType="image"
                className="map-logo"
                body={
                    <AboutContent/>
                }/>) : (
            <Dialog
                id="mapstore-about"
                style={assign({}, {zIndex: 1992, display: this.props.enabled ? "block" : "none"})}
                modal
                draggable
            >
                <span role="header">
                    <span className="about-panel-title">
                        <Message msgId="about_title"/>
                    </span>
                    <button onClick={this.props.onClose} className="about-panel-close close">
                        {this.props.modalConfig.closeGlyph ? <Glyphicon glyph={this.props.modalConfig.closeGlyph}/> : <span>×</span>}
                    </button>
                </span>
                <div role="body"><AboutContent/></div>
            </Dialog>);
    }
}

module.exports = About;
