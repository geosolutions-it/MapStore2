/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import { getPluginForTest } from './pluginsTestUtils';

import ContextImport from '../ContextImport';

describe('ContextImport plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('displays the import drag zone when enabled', () => {
        const { Plugin } = getPluginForTest(ContextImport, {
            controls: {
                "import": {
                    enabled: true
                }
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById('container'));
        const rootDiv = document.getElementById('DRAGDROP_IMPORT_ZONE');
        expect(rootDiv).toBeTruthy();
    });
});
