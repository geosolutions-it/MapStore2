/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import { getPluginForTest } from './pluginsTestUtils';

import DeleteGeoStory from '../DeleteGeoStory';

describe('DeleteGeoStory plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('displays the delete confirm dialog when enabled', () => {
        const { Plugin } = getPluginForTest(DeleteGeoStory, {
            controls: {
                geostoryDelete: {
                    enabled: true
                }
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById('container'));
        const rootDiv = document.getElementById('confirm-dialog');
        expect(rootDiv).toExist();
    });
});
