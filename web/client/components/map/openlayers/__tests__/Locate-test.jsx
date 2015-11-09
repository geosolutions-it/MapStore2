/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var React = require('react/addons');
var ol = require('openlayers');
var Locate = require('../Locate');


describe('Openlayers Locate component', () => {
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
    it('create Locate with defaults', () => {
        const ov = React.render(<Locate map={map}/>, document.body);
        expect(ov).toExist();
    });
});
