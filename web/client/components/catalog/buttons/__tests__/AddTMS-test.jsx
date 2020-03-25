/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from "react-dom/test-utils";

import axios from '../../../../libs/ajax';
import MockAdapter from "axios-mock-adapter";
let mockAxios;

import AddTMS from '../AddTMS';

import TILE_MAP_RESPONSE from 'raw-loader!../../../../test-resources/tms/TileMapSample.xml';
describe('Test AddTMS Button', () => {
    beforeEach(done => {
        document.body.innerHTML = '<div id="container"></div>';
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach(done => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        mockAxios.restore();
        setTimeout(done);
    });
    it('Test AddTMS addLayer', (done) => {
        mockAxios.onGet().reply(() => {
            expect(document.querySelector('#content')).toBeFalsy();
            return [200, TILE_MAP_RESPONSE];
        });
        const actions = {
            addLayer: (layer) => {
                try {
                    expect(layer.type).toBe("tms");
                    expect(layer.title).toBe("Sample Layer");
                    expect(layer.visibility).toBe(true);
                    expect(layer.srs).toBe("EPSG:3857");
                    // the loading spinner is not there and the original content is restored
                    expect(document.querySelector('#content')).toBeTruthy();
                    done();
                } catch (e) {
                    done(e);
                }

            }
        };
        ReactDOM.render(<AddTMS record={{}} service={{}} addLayer={actions.addLayer} ><div id="content"></div></AddTMS>, document.getElementById("container"));

        ReactTestUtils.Simulate.click(document.querySelector('button')); // <-- trigger event callback
    });
});
