/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import MapTemplates from '../MapTemplates';
import { getPluginForTest } from './pluginsTestUtils';

describe('MapTemplates Plugins', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('shows MapTemplates not loaded', () => {
        const { Plugin } = getPluginForTest(MapTemplates, {
            controls: {
                mapTemplates: {
                    enabled: true
                }
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-side-panel')[0]).toExist();
        expect(document.getElementsByClassName('map-templates-loader')[0]).toExist();
        expect(document.getElementsByClassName('map-templates-panel')[0]).toNotExist();
    });
    it('shows MapTemplates loaded', () => {
        const { Plugin } = getPluginForTest(MapTemplates, {
            controls: {
                mapTemplates: {
                    enabled: true
                }
            },
            maptemplates: {
                mapTemplatesLoaded: true
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-side-panel')[0]).toExist();
        expect(document.getElementsByClassName('map-templates-loader')[0]).toNotExist();
        expect(document.getElementsByClassName('map-templates-panel')[0]).toExist();
    });
});
