/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const requestBuilder = require('../RequestBuilder');

const TEST_REQUEST_V2 = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"><fes:Filter><fes:And><fes:Or><fes:PropertyIsEqualTo><fes:ValueReference>highway_system</fes:ValueReference><fes:Literal>state</fes:Literal></fes:PropertyIsEqualTo></fes:Or></fes:And></fes:Filter></wfs:Query></wfs:GetFeature>';

const TEST_REQUEST_V1_POLY = '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"><wfs:Query typeName="ft_name_test" srsName="EPSG:4326"><ogc:Filter><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>1,1 1,2 2,2 2,1 1,1</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>';
describe('RequestBuilder Operators', () => {
    it('RequestBuilder WFS 2.0', () => {
        const {filter, and, or, getFeature, property, query} = requestBuilder({wfsVersion: "2.0"});
        expect(
            getFeature(query("ft_name_test",
                filter(and(or(property("highway_system").equalTo("state"))))
            ))
        ).toBe(TEST_REQUEST_V2);
    });
    it('RequestBuilder WFS 1.0.0', () => {
        const geom = {
            "type": "Polygon",
            "projection": "EPSG:4326",
            "coordinates": [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]
        };
        const {filter, getFeature, property, query} = requestBuilder({wfsVersion: "1.0.0"});
        expect(
            getFeature(query("ft_name_test",
                filter(property("geometry").intersects(geom))
            ))
        ).toBe(TEST_REQUEST_V1_POLY);
    });
    it('RequestBuilder WFS - 1.1.0 Polygon', () => {
        let geom = {
            "type": "Polygon",
            "projection": "EPSG:4326",
            "coordinates": [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]
        };
        const {filter, getFeature, property, query} = requestBuilder({wfsVersion: "1.1.0"});
        let expected = '<wfs:GetFeature service="WFS" version="1.1.0" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"><wfs:Query typeName="ft_name_test" srsName="EPSG:4326"><ogc:Filter><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>';
        expect(
            getFeature(query("ft_name_test",
                filter(property("geometry").intersects(geom))
            ))
        ).toBe(expected);

        // test change srsName
        let geom2 = {
            "type": "Polygon",
            "projection": "EPSG:3857",
            "coordinates": [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]
        };
        let expected2 = '<wfs:GetFeature service="WFS" version="1.1.0" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"><wfs:Query typeName="ft_name_test" srsName="EPSG:3857"><ogc:Filter><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:3857"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>';
        expect(
            getFeature(query("ft_name_test",
                filter(property("geometry").intersects(geom2)),
                {srsName: "EPSG:3857"}
            ))
        ).toBe(expected2);

        // params
        let geom3 = {
            "type": "Polygon",
            "projection": "EPSG:3857",
            "coordinates": [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]
        };
        let expected3 = '<wfs:GetFeature service="WFS" version="1.1.0" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" outputFormat="application/json"><wfs:Query typeName="ft_name_test" srsName="EPSG:3857"><ogc:Filter><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:3857"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>';
        expect(
            getFeature(query("ft_name_test",
                filter(property("geometry").intersects(geom3)),
                {srsName: "EPSG:3857"}
            ), {outputFormat: "application/json"})
        ).toBe(expected3);
    });
});
