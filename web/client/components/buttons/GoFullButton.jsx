const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const {Button, Glyphicon, Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../misc/OverlayTrigger');
const Message = require('../I18N/Message');

const ConfigUtils = require('../../utils/ConfigUtils');

/**
 * Button for Go to Full MapStore2.
 * @prop {string} cfg.glyph the glyph icon for the button
 * @prop {string} cfg.tooltip messageId of the tooltip to use
 * @prop {string} cfg.urlRegex. A regex to parse the current location.href. This regex must match if the originalUrl is not defined.
 * @prop {string} cfg.urlReplaceString. The template to create the url link. Uses the `urlRegex` groups to create the final URL
 * @memberof components.buttons
 * @class
 */
class GoFullButton extends React.Component {
    static propTypes = {
        glyph: PropTypes.string,
        tooltip: PropTypes.string,
        urlRegex: PropTypes.string,
        urlReplaceString: PropTypes.string,
        originalUrl: PropTypes.string
    };

    static defaultProps = {
        glyph: "share",
        tooltip: "fullscreen.viewLargerMap",
        urlRegex: "^(.*?)embedded.html.*?#\\/(\\d?)",
        urlReplaceString: "$1#/viewer/leaflet/$2"
    };

    render() {
        if (!this.display()) return null;
        return (<OverlayTrigger placement="left" overlay={<Tooltip id="gofull-tooltip"><Message msgId={this.props.tooltip}/></Tooltip>}>
            <Button className="square-button" bsStyle="primary" onClick={() => this.openFull(this.generateUrl())}>
                <Glyphicon glyph={this.props.glyph}/>
            </Button>
        </OverlayTrigger>);
    }

    display = () => {
        let regex = this.generateRegex();
        return this.props.originalUrl || ConfigUtils.getConfigProp("originalUrl") || location.href.match(regex);
    };

    openFull = (url) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    generateRegex = () => {
        return new RegExp(this.props.urlRegex);
    };

    generateUrl = () => {
        let orig = this.props.originalUrl || ConfigUtils.getConfigProp("originalUrl");
        if (orig) {
            return orig;
        }
        let regex = this.generateRegex();
        if (location.href.match(regex)) {
            let next = location.href;
            return next.replace(regex, this.props.urlReplaceString);
        }
        return null;
    };
}

module.exports = GoFullButton;
