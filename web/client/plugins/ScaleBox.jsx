/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');

const {mapSelector} = require('../selectors/map');
const {changeZoomLevel} = require('../actions/map');

const HelpWrapper = require('./HelpWrapper');
const Message = require('./Message');
const ScaleBox = require("../components/mapcontrols/scale/ScaleBox");

const selector = createSelector([mapSelector], (map) => ({
    currentZoomLvl: map && map.zoom
}));

const ScaleBoxPlugin = React.createClass({
    render() {
        return (<HelpWrapper
            key="scalebox-help"
            helpText={<Message msgId="helptexts.scaleBox"/>}>
                <ScaleBox key="scaleBox" {...this.props}/>
        </HelpWrapper>);
    }
});


module.exports = {
    ScaleBoxPlugin: connect(selector, {
        onChange: changeZoomLevel
    })(ScaleBoxPlugin),
    reducers: {}
};
