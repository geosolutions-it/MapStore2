/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import { getPluginForTest } from './pluginsTestUtils';

import MapCatalog from '../MapCatalog';

describe('MapCatalog plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('MapCatalog with defaults', () => {
        const { Plugin } = getPluginForTest(MapCatalog, {
            controls: {
                mapcatalog: {
                    enabled: true
                }
            }
        });

        ReactDOM.render(<Plugin/>, document.getElementById('container'));
        const rootDiv = document.getElementsByClassName('map-catalog-dock-panel')[0];
        expect(rootDiv).toExist();
    });
});
