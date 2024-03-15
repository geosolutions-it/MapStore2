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

import ContextExport from '../ContextExport';
import { EXPORT_CONTEXT } from '../../utils/ControlUtils';

describe('ContextExport plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('displays the export panel when enabled', () => {
        const { Plugin } = getPluginForTest(ContextExport, {
            controls: {
                [EXPORT_CONTEXT]: {
                    enabled: true
                }
            }
        });
        ReactDOM.render(<Plugin/>, document.getElementById('container'));
        const rootDiv = document.querySelector('.export-panel');
        expect(rootDiv).toBeTruthy();
    });
});
