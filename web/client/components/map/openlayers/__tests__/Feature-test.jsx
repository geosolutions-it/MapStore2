/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const ol = require('openlayers');
const Feature = require('../Feature.jsx');
const expect = require('expect');
require('../../../../utils/openlayers/Layers');
require('../plugins/VectorLayer');

describe('Test Feature', () => {
    document.body.innerHTML = '<div id="map"></div>';
    let map;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
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

    afterEach((done) => {
        map.setTarget(null);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('adding a feature to a vector layer', () => {
        var options = {
            crs: 'EPSG:4326',
            features: {
              type: 'FeatureCollection',
              crs: {
                'type': 'name',
                'properties': {
                  'name': 'EPSG:4326'
                }
              },
              features: [
                  {
                     type: 'Feature',
                      geometry: {
                          type: 'Polygon',
                          coordinates: [[
                              [13, 43],
                              [15, 43],
                              [15, 44],
                              [13, 44]
                          ]]
                      },
                      properties: {
                          'name': "some name"
                      }
                  }
              ]
          }
        };
        const source = new ol.source.Vector({
            features: []
        });
        const msId = "some value";
        let container = new ol.layer.Vector({
           msId,
           source: source,
           visible: true,
           zIndex: 1
       });
        const geometry = options.features.features[0].geometry;
        const type = options.features.features[0].type;
        const properties = options.features.features[0].properties;

        // create layers
        let layer = ReactDOM.render(
            <Feature type="vector"
                 options={options}
                 geometry={geometry}
                 type={type}
                 properties={properties}
                 msId={msId}
                 container={container}
                 featuresCrs={"EPSG:4326"}
                 crs={"EPSG:4326"}
                 />, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(container.getSource().getFeatures().length === 1 );
    });
});
