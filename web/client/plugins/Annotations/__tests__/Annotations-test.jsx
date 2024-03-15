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

import AnnotationsPlugin from '../index';
import { createAnnotationId, ANNOTATIONS } from '../utils/AnnotationsUtils';
import { getPluginForTest } from '../../__tests__/pluginsTestUtils';

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
        const id = createAnnotationId('1');
        const { Plugin } = getPluginForTest(AnnotationsPlugin, {
            controls: {
                annotations: {
                    enabled: true
                }
            },
            layers: {
                flat: [
                    {
                        id,
                        rowViewer: ANNOTATIONS,
                        type: 'vector',
                        features: []
                    }
                ],
                selected: [id]
            }
        });
        ReactDOM.render(<Plugin />, document.getElementById('container'));
        const panel = document.querySelector('.ms-annotations-panel');
        expect(panel).toBeTruthy();
    });
});
