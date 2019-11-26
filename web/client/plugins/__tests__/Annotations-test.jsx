/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import AnnotationsPlugin from '../Annotations';
import { getPluginForTest } from './pluginsTestUtils';

describe('Annotations Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a Annotations plugin', () => {
        const { Plugin } = getPluginForTest(AnnotationsPlugin, {
            controls: {
                annotations: {
                    enabled: true
                }
            }
        });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const panel = document.querySelector('.ms-annotations-panel');
        expect(panel).toExist();
        // check the annotation panel has the classes that fits even with headers (for embedded or other, not full window size context)
        expect(panel.className.split(" ")).toInclude("ms-side-panel");
        expect(panel.className.split(" ")).toInclude("ms-absolute-dock");
    });
});
