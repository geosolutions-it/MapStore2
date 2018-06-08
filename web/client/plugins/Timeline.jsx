/*
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

// TODO: make step and glyphicon configurable
const selector = createSelector([mapSelector], (map) => ({currentZoom: map && map.zoom, id: "zoomin-btn", step: 1, glyphicon: "plus"}));
const Timeline = require('react-visjs-timeline').default;

const {changeZoomLevel} = require('../actions/map');

const Message = require('../components/I18N/Message');

/**
  * ZoomIn Plugin. Provides button to zoom in
  * @class  ZoomIn
  * @memberof plugins
  * @static
  *
  * @prop {object} cfg.style CSS to apply to the button
  * @prop {string} cfg.className the class name for the button
  *
  */
const ZoomInButton = connect(selector, {
    onZoom: changeZoomLevel
})(() => (<Timeline
        style={{
            bottom: 30,
            left: 90,
            right: 50,
            height: 60,
            position: 'fixed'

        }}
        options={{

            stack: false,
            showMajorLabels: true,
            showCurrentTime: true,
            zoomMin: 10,
            zoomable: true,
            type: 'background',
            format: {
                minorLabels: {
                    minute: 'h:mma',
                    hour: 'ha'
                }
            }
        }}
        groups={[{
            id: "Layer 1",
            title: "Layer 1",
            content: "Layer 1"
        }, {
            id: "Layer 2",
            title: "Layer 2",
            content: "Layer 2"
        }]}
        items={[{
            start: new Date(2018, 7, 15),
            end: new Date(2018, 8, 2),  // end is optional
            group: "Layer 1"
        }, {
            start: new Date(2018, 2, 15),
            end: new Date(2018, 2, 2),  // end is optional
            group: "Layer 1"
            }, {
                start: new Date(2018, 7, 12),
                end: new Date(2018, 8, 6),  // end is optional
                group: "Layer 2"
            }]
} />));

require('./zoom/zoom.css');

const assign = require('object-assign');


module.exports = {
    TimelinePlugin: assign(ZoomInButton, {
        disablePluginIf: "{state('mapType') === 'cesium'}"
    }),
    reducers: {}
};
