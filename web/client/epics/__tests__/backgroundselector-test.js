/*
 * Copyright 2014, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { addBackgroundProperties, REMOVE_BACKGROUND, SET_BACKGROUND_MODAL_PARAMS } from '../../actions/backgroundselector';
import { testEpic } from './epicTestUtils';
import backgroundEpics from '../backgroundselector';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';
import { changeLayerProperties, removeNode } from '../../actions/layers';
let mockAxios;

describe('addBackgroundPropertiesEpic Epics', () => {
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach((done) => {
        mockAxios.restore();
        setTimeout(done);
    });
    const capabilitiesWMSXmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd" version="1.0.0">
<Contents>
  <Layer>
    <Title/>
    <Abstract/>
    <!--Limited list of EPSG projections:-->
    <BoundingBox CRS="CRS:84" minx="-124.73142200000001" miny="-43.648056" maxx="148.47914100000003" maxy="49.371735"/>
    <Layer queryable="1" opaque="0">
      <Name>states_test</Name>
      <Title>states_test</Title>
      <Abstract>states_test</Abstract>
      <KeywordList>
        <Keyword>features</Keyword>
        <Keyword>states</Keyword>
      </KeywordList>
      <CRS>EPSG:4326</CRS>
      <CRS>CRS:84</CRS>
      <EX_GeographicBoundingBox>
        <westBoundLongitude>-124.73142200000001</westBoundLongitude>
        <eastBoundLongitude>-66.969849</eastBoundLongitude>
        <southBoundLatitude>24.955967</southBoundLatitude>
        <northBoundLatitude>49.371735</northBoundLatitude>
      </EX_GeographicBoundingBox>
      <BoundingBox CRS="CRS:84" minx="-124.73142200000001" miny="24.955967" maxx="-66.969849" maxy="49.371735"/>
      <BoundingBox CRS="EPSG:4326" minx="24.955967" miny="-124.73142200000001" maxx="49.371735" maxy="-66.969849"/>
      <Style>
        <Name>polygon</Name>
        <Title>A boring default style</Title>
        <Abstract>A sample style that just prints out a transparent red interior with a red outline</Abstract>
        <LegendURL width="20" height="20">
          <Format>image/png</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://gs-stable.geo-solutions.it/geoserver/topp/ows?service=WMS&amp;request=GetLegendGraphic&amp;format=image%2Fpng&amp;width=20&amp;height=20&amp;layer=states_test"/>
        </LegendURL>
      </Style>
      <Format>image/png</Format>
      <Format>image/jpeg</Format>
      <Format>image/png8</Format>
    </Layer>
  </Layer>
</Contents>
</Capabilities>`;

    const capabilitiesWMTSXmlResponse = `<?xml version="1.0" encoding="UTF-8"?><WMS_Capabilities version="1.3.0" updateSequence="5167" xmlns="http://www.opengis.net/wms" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wms http://gs-stable.geo-solutions.it/geoserver/schemas/wms/1.3.0/capabilities_1_3_0.xsd">
<Capability>
  <Layer>
    <Title/>
    <Abstract/>
    <!--Limited list of EPSG projections:-->
    <BoundingBox CRS="CRS:84" minx="-124.73142200000001" miny="-43.648056" maxx="148.47914100000003" maxy="49.371735"/>
    <Layer queryable="1" opaque="0">
      <Name>states_test</Name>
      <Title>states_test</Title>
      <Abstract>states_test</Abstract>
      <KeywordList>
        <Keyword>features</Keyword>
        <Keyword>states</Keyword>
      </KeywordList>
      <CRS>EPSG:4326</CRS>
      <CRS>CRS:84</CRS>
      <EX_GeographicBoundingBox>
        <westBoundLongitude>-124.73142200000001</westBoundLongitude>
        <eastBoundLongitude>-66.969849</eastBoundLongitude>
        <southBoundLatitude>24.955967</southBoundLatitude>
        <northBoundLatitude>49.371735</northBoundLatitude>
      </EX_GeographicBoundingBox>
      <BoundingBox CRS="CRS:84" minx="-124.73142200000001" miny="24.955967" maxx="-66.969849" maxy="49.371735"/>
      <BoundingBox CRS="EPSG:4326" minx="24.955967" miny="-124.73142200000001" maxx="49.371735" maxy="-66.969849"/>
      <Style>
        <Name>polygon</Name>
        <Title>A boring default style</Title>
        <Abstract>A sample style that just prints out a transparent red interior with a red outline</Abstract>
        <LegendURL width="20" height="20">
          <Format>image/png</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="http://gs-stable.geo-solutions.it/geoserver/topp/ows?service=WMS&amp;request=GetLegendGraphic&amp;format=image%2Fpng&amp;width=20&amp;height=20&amp;layer=states_test"/>
        </LegendURL>
      </Style>
    </Layer>
  </Layer>
</Capability>
</WMS_Capabilities>`;
    const mockState = {
        layers: [
            {
                "format": "image/jpeg",
                "group": "background",
                "name": "osm:osm_simple_light",
                "opacity": 1,
                "title": "OSM Simple Light",
                "type": "wms",
                "id": "osm:osm_simple_light__0",
                "visibility": false
            },
            {
                "type": "terrain",
                "name": "test",
                "group": "background",
                "id": "a9373425-ac53-47fa-aeee-67a20346e981",
                "visibility": true,
                "provider": "cesium",
                "options": {
                    "title": "test",
                    "url": "https://test/terrain",
                    "editable": true
                }
            },
            {
                "type": "terrain",
                "name": "test2",
                "group": "background",
                "id": "a9373425-ac53-47fa-aeee-67a20346e982",
                "visibility": true,
                "provider": "cesium",
                "options": {
                    "title": "test",
                    "url": "https://test/terrain",
                    "editable": true
                }
            },
            {
                "type": "osm",
                "title": "Open Street Map",
                "name": "mapnik",
                "group": "background",
                "id": "mapnik__5",
                "visibility": false
            }
            // Add other layers as needed
        ]
    };
    it('test add normal background layer', (done) => {
        mockAxios.onGet().reply(200, capabilitiesWMSXmlResponse);
        let addBackgroundPropAction = addBackgroundProperties({
            layer: {
                id: "layer01", allowedSRS: {
                    "EPSG:3857": true,
                    "EPSG:900913": true,
                    "EPSG:4326": true
                },
                title: "states_test",
                type: 'wms',
                name: "states_test",
                url: ['/geoserver/wms'],
                group: "background"
            },
            editing: false
        });

        testEpic(backgroundEpics.addBackgroundPropertiesEpic, 2, [addBackgroundPropAction], (res) => {
            const action1 = res[0];
            const action2 = res[1];
            expect(action1).toExist();
            expect(action1.type).toEqual(SET_BACKGROUND_MODAL_PARAMS);
            expect(action1.modalParams.loading).toEqual(true);
            expect(action2).toExist();
            expect(action2.type).toEqual(SET_BACKGROUND_MODAL_PARAMS);
            expect(action2.modalParams.loading).toEqual(false);
            expect(action2.modalParams.capabilities).toExist();
            done();
        }, {});

    });
    it('test add wms as a background layer without enabling remote custom tile grid', (done) => {
        mockAxios.onGet().reply(200, capabilitiesWMSXmlResponse);
        let addBackgroundPropAction = addBackgroundProperties({
            layer: {
                id: "layer01", allowedSRS: {
                    "EPSG:3857": true,
                    "EPSG:900913": true,
                    "EPSG:4326": true
                },
                title: "states_test",
                type: 'wms',
                name: "states_test",
                url: '/geoserver/wms',
                group: "background"
            },
            editing: false
        });

        testEpic(backgroundEpics.addBackgroundPropertiesEpic, 2, [addBackgroundPropAction], (res) => {
            const action1 = res[0];
            const action2 = res[1];
            expect(action1).toExist();
            expect(action1.type).toEqual(SET_BACKGROUND_MODAL_PARAMS);
            expect(action1.modalParams.loading).toEqual(true);
            expect(action2).toExist();
            expect(action2.type).toEqual(SET_BACKGROUND_MODAL_PARAMS);
            expect(action2.modalParams.loading).toEqual(false);
            expect(action2.modalParams.capabilities).toExist();
            done();
        }, {});
    });
    it('test add wms as a background layer with enabling remote custom tile grid', (done) => {
        mockAxios.onGet().replyOnce(200, capabilitiesWMSXmlResponse);
        mockAxios.onGet().replyOnce(200, capabilitiesWMTSXmlResponse);
        let addBackgroundPropAction = addBackgroundProperties({
            layer: {
                id: "layer01", allowedSRS: {
                    "EPSG:3857": true,
                    "EPSG:900913": true,
                    "EPSG:4326": true
                },
                title: "states_test",
                type: 'wms',
                name: "states_test",
                url: '/geoserver/wms',
                group: "background",
                remoteTileGrids: true
            },
            editing: false
        });

        testEpic(backgroundEpics.addBackgroundPropertiesEpic, 2, [addBackgroundPropAction], (res) => {
            const action1 = res[0];
            const action2 = res[1];
            expect(action1).toExist();
            expect(action1.type).toEqual(SET_BACKGROUND_MODAL_PARAMS);
            expect(action1.modalParams.loading).toEqual(true);
            expect(action2).toExist();
            expect(action2.type).toEqual(SET_BACKGROUND_MODAL_PARAMS);
            expect(action2.modalParams.loading).toEqual(false);
            expect(action2.modalParams.capabilities).toExist();
            expect(action2.modalParams.layer.tiled).toEqual(true);
            expect(action2.modalParams.layer.tileGridStrategy).toEqual('custom');
            done();
        }, {});
    });

    it('should remove a background layer that exists and is not terrain', (done) => {
        const backgroundId = 'osm:osm_simple_light__0';
        const action = { type: REMOVE_BACKGROUND, backgroundId };
        testEpic(backgroundEpics.backgroundRemovedEpic, 2, [action], (res) => {
            expect(res[0]).toExist();
            expect(res[0].type).toEqual(removeNode(backgroundId, 'layers').type);
            expect(res[1]).toExist();
            expect(res[1].type).toEqual(changeLayerProperties(mockState.layers[2].id, { visibility: true }).type);
            done();
        }, mockState);
    });

    it('should handle removing a terrain layer', (done) => {
        const backgroundId = 'a9373425-ac53-47fa-aeee-67a20346e981'; // Terrain layer ID
        const action = { type: REMOVE_BACKGROUND, backgroundId };

        testEpic(backgroundEpics.backgroundRemovedEpic, 2, [action], (res) => {
            expect(res[0]).toExist();
            expect(res[0].type).toEqual(removeNode(backgroundId, 'layers').type);
            expect(res[1]).toExist();
            expect(res[1].type).toEqual(changeLayerProperties(mockState.layers[2].id, { visibility: true }).type);
            done();
        }, mockState);
    });
});
