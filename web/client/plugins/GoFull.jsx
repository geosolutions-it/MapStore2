/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const {Button, Glyphicon, Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../components/misc/OverlayTrigger');
const Message = require('../components/I18N/Message');
const {mapSelector} = require('../selectors/map');
const {createSelector} = require('reselect');
const ConfigUtils = require('../utils/ConfigUtils');

const mapIdSelector = createSelector([(state) => {let map = mapSelector(state); return map && map.mapId; }], mapId => ({mapId}));
/**
 * GoFull plugins. Shows a button that opens full MapStore2 in a new tab. Try to find the `originalUrl` in configuration or tries to guess the mapId and creates the proper URL.
 * This plugins hides automatically if the originalUrl is not present in configuration and if the urlRegex do not match.
 * @prop {string} cfg.glyph the glyph icon for the button
 * @prop {string} cfg.tooltip messageId of the tooltip to use
 * @prop {string} cfg.urlRegex. A regex to parse the current location.href. This regex must match if the originalUrl is not defined.
 * @prop {string} cfg.urlReplaceString. The template to create the url link. Uses the `urlRegex` groups to create the final URL
 * @memberof plugins
 * @class
 */
const GoFull = React.createClass({
    propTypes: {
        glyph: React.PropTypes.string,
        tooltip: React.PropTypes.string,
        urlRegex: React.PropTypes.string,
        urlReplaceString: React.PropTypes.string,
        mapId: React.PropTypes.string,
        originalUrl: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            glyph: "share",
            tooltip: "fullscreen.viewLargerMap",
            urlRegex: "^(.*?)embedded.html.*?#\\/(\\d?)",
            urlReplaceString: "\\$1#/viewer/leaflet/\\$2"
        };
    },

    render() {
        if (!this.display()) return <noscript></noscript>;
        return (<OverlayTrigger placement="left" overlay={<Tooltip id="gofull-tooltip"><Message msgId={this.props.tooltip}/></Tooltip>}>
                    <Button className="square-button" bsStyle="primary" onClick={() => this.openFull(this.generateUrl())}>
                        <Glyphicon glyph={this.props.glyph}/>
                    </Button>
                </OverlayTrigger>);
    },
    display() {
        let regex = this.generateRegex();
        return this.props.originalUrl || ConfigUtils.getConfigProp("originalUrl") || location.href.match(regex);
    },
    openFull(url) {
        if (url) {
            window.open(url, '_blank');
        }
    },
    generateRegex() {
        return new RegExp(this.props.urlRegex);
    },

    generateUrl() {
        let orig = this.props.originalUrl || ConfigUtils.getConfigProp("originalUrl");
        if (orig) {
            return orig;
        }
        let regex = this.generateRegex();
        if (location.href.match(regex)) {
            let next = location.href;
            return next.replace(regex, "$1#/viewer/leaflet/$2");
        }
    }
});

const GoFullPlugin = connect(mapIdSelector)(GoFull);


const assign = require('object-assign');


module.exports = {
    GoFullPlugin: assign(GoFullPlugin, {
        Toolbar: {
            name: 'gofull',
            position: 1,
            toolStyle: "primary",
            tooltip: "fullscreen.viewLargerMap",
            tool: true,
            priority: 1
        }
    }),
    reducers: {}
};
