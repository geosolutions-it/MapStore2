/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('../utils/PluginsUtils');
const {createSelector} = require('reselect');

const {mapSelector} = require('../selectors/map');
const {isCesium} = require('../selectors/maptype');
const {changeZoomLevel} = require('../actions/map');

const HelpWrapper = require('./help/HelpWrapper');
const Message = require('./locale/Message');
const ScaleBox = require("../components/mapcontrols/scale/ScaleBox");

const mapUtils = require('../utils/MapUtils');

const selector = createSelector([mapSelector, isCesium], (map, hide) => ({
    currentZoomLvl: map && map.zoom,
    hide,
    scales: mapUtils.getScales(
        map && map.projection || 'EPSG:3857',
        map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI || null
     )
}));

require('./scalebox/scalebox.css');


/**
  * ScaleBox Plugin. Provides a selector for the scale of the map.
  * @class  ScaleBox
  * @memberof plugins
  * @static
  *
  * @prop {object} cfg.style CSS to apply to the scalebox
  * @prop {Boolean} cfg.readOnly the selector is readonly
  * @prop {string} cfg.label label for the selector
  * @prop {Boolean} cfg.useRawInput set true if you want to use an normal html input object
  *
  */
const ScaleBoxPlugin = React.createClass({
    propTypes: {
        hide: React.PropTypes.bool,
        id: React.PropTypes.string,
        style: React.PropTypes.object,
        scales: React.PropTypes.array,
        currentZoomLvl: React.PropTypes.number,
        onChange: React.PropTypes.func,
        readOnly: React.PropTypes.bool,
        label: React.PropTypes.string,
        template: React.PropTypes.func,
        useRawInput: React.PropTypes.bool
    },
    render() {
        const {hide, ...scaleBoxProps} = this.props;
        return !hide && (<HelpWrapper id="mapstore-scalebox-container"
            key="scalebox-help"
            helpText={<Message msgId="helptexts.scaleBox"/>}>
                <ScaleBox key="scaleBox" {...scaleBoxProps}/>
        </HelpWrapper>);
    }
});


module.exports = {
    ScaleBoxPlugin: connect(selector, {
        onChange: changeZoomLevel
    })(ScaleBoxPlugin),
    reducers: {}
};
