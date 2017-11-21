/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const dependenciesToFilter = require('../dependenciesToFilter');
const filterObj = {
    spatialField: {
        "operation": "INTERSECTS",
        "attribute": "geometry",
        "geometry": {
            "type": "Polygon",
            "projection": "EPSG:4326",
            "coordinates": [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]
        }
    }
};
const filterObjRes1 =
    "<ogc:Filter><ogc:And><ogc:Intersects>"
        + "<ogc:PropertyName>geometry</ogc:PropertyName>"
        + "<gml:Polygon srsName=\"EPSG:4326\"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>"
    + "</ogc:Intersects></ogc:And></ogc:Filter>";
const mergeFilterRes =
    '<ogc:Filter><ogc:And>'
        + '<ogc:Intersects>'
            + '<ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>'
        + '</ogc:Intersects>'
        + '<ogc:Intersects>'
            + '<ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>-1 -1 -1 1 1 1 1 -1 -1 -1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>'
        + '</ogc:Intersects>'
    + '</ogc:And></ogc:Filter>';
describe('widgets dependenciesToFilter enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('dependenciesToFilter default', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(undefined);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('dependenciesToFilter spatial filter', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(filterObjRes1);
            done();
        }));
        ReactDOM.render(<Sink filter={filterObj}/>, document.getElementById("container"));
    });
    it('dependenciesToFilter with mapsync and spatial filter', (done) => {
        const Sink = dependenciesToFilter(createSink( props => {
            expect(props).toExist();
            expect(props.filter).toBe(mergeFilterRes);
            done();
        }));
        ReactDOM.render(<Sink
            mapSync
            geomProp={"geometry"}
            dependencies={ {
            viewport: {"bounds": {"minx": "-1", "miny": "-1", "maxx": "1", "maxy": "1"}, "crs": "EPSG:4326", "rotation": 0}
        } } filter={filterObj}/>, document.getElementById("container"));
    });
});
