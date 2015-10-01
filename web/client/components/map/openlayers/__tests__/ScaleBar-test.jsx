/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var ol = require('openlayers');
var ScaleBar = require('../ScaleBar');
var expect = require('expect');

describe('Openlayers ScaleBar component', () => {
    document.body.innerHTML = '<div id="map"></div>';
    let map = new ol.Map({
      layers: [
      ],
      controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
          collapsible: false
        })
      }),
      target: 'map',
      view: new ol.View({
        center: [0, 0],
        zoom: 5
      })
    });

    afterEach((done) => {
        document.body.innerHTML = '<div id="map"></div>';
        map = new ol.Map({
          layers: [
          ],
          controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
              collapsible: false
            })
          }),
          target: 'map',
          view: new ol.View({
            center: [0, 0],
            zoom: 5
          })
        });
        setTimeout(done);
    });

    it('create ScaleBar with defaults', () => {
        const sb = React.render(<ScaleBar map={map}/>, document.body);
        expect(sb).toExist();
        const domMap = map.getViewport();
        const scaleBars = domMap.getElementsByClassName('ol-scale-line');
        expect(scaleBars.length).toBe(1);
    });
});
