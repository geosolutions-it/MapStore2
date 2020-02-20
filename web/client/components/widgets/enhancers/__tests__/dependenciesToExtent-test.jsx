/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import expect from 'expect';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import dependenciesToExtent from '../dependenciesToExtent';
import {
    inputDependenciesQuickFiltersAndFilter
} from '../../../../test-resources/widgets/dependenciesToLayersData';
import MapUtils from '../../../../utils/MapUtils';


describe('widgets dependenciesToExtent enhancer', () => {
    let mockAxios;
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('dependenciesToExtent default', (done) => {
        const Sink = dependenciesToExtent(createSink( props => {
            expect(props).toExist();
            expect(props).toEqual({});
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });

    it('dependenciesToExtent fetching bounds and triggering zoom to extent', (done) => {
        const Sink = dependenciesToExtent(createSink( props => {
            expect(props).toExist();
            expect(props.hookRegister).toExist();
            const hook = props.hookRegister.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
            expect(hook).toExist();
            done();
        }));
        mockAxios.onPost().reply(
            200,
            '<?xml version="1.0" encoding="UTF-8"?><ows:BoundingBox xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ows="http://www.opengis.net/ows/1.1" crs="EPSG:4326"><ows:LowerCorner>-124.731422 24.955967</ows:LowerCorner><ows:UpperCorner>-66.969849 49.371735</ows:UpperCorner></ows:BoundingBox>'
        );

        const hookRegister = MapUtils.createRegisterHooks();
        hookRegister.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK, {hookName: MapUtils.ZOOM_TO_EXTENT_HOOK});
        ReactDOM.render(<Sink
            id="id"
            hookRegister={hookRegister}
            mapSync
            dependencies={inputDependenciesQuickFiltersAndFilter}
            map={{
                layers: [{
                    name: "topp:states",
                    url: "/testWPSUrl"
                }]
            }}
        />, document.getElementById("container"));

    });

    it('dependenciesToExtent fetching bounds and triggering zoom to extent, even if layers does not match', (done) => {
        const Sink = dependenciesToExtent(createSink( props => {
            expect(props).toExist();
            expect(props.hookRegister).toExist();
            const hook = props.hookRegister.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
            expect(hook).toExist();
            done();
        }));
        mockAxios.onPost().reply(
            200,
            '<?xml version="1.0" encoding="UTF-8"?><ows:BoundingBox xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ows="http://www.opengis.net/ows/1.1" crs="EPSG:4326"><ows:LowerCorner>-124.731422 24.955967</ows:LowerCorner><ows:UpperCorner>-66.969849 49.371735</ows:UpperCorner></ows:BoundingBox>'
        );

        const hookRegister = MapUtils.createRegisterHooks();
        hookRegister.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK, {hookName: MapUtils.ZOOM_TO_EXTENT_HOOK});
        ReactDOM.render(<Sink
            id="id"
            hookRegister={hookRegister}
            mapSync
            dependencies={inputDependenciesQuickFiltersAndFilter}
            map={{
                layers: [{
                    name: "topp:states",
                    url: "/testWPSUrl"
                }]
            }}
        />, document.getElementById("container"));

    });


});
