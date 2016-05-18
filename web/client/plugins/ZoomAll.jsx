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

const selector = createSelector([mapSelector, state => state.mapInitialConfig], (map, mapInitialConfig) => ({mapConfig: map, mapInitialConfig: mapInitialConfig}));

const {changeMapView} = require('../actions/map');

const ZoomToMaxExtentButton = connect(selector, {
    changeMapView
})(require('../components/buttons/ZoomToMaxExtentButton'));

const HelpWrapper = require('./help/HelpWrapper');
const Message = require('../components/I18N/Message');

require('./zoomall/zoomall.css');

const ZoomAllPlugin = React.createClass({
    render() {
        return (<HelpWrapper
            key="zoomall-help"
            helpText={<Message msgId="helptexts.zoomToMaxExtentButton"/>}>
            <ZoomToMaxExtentButton
                key="zoomToMaxExtent" useInitialExtent={true}/>
        </HelpWrapper>);
    }
});

module.exports = {
    ZoomAllPlugin,
    reducers: {}
};
