/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import Measure from '../Measure';
import { getPluginForTest } from './pluginsTestUtils';
import { Simulate } from 'react-dom/test-utils';

describe('Measure Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should trigger the correct close action', () => {
        const { Plugin, store } = getPluginForTest(Measure, { controls: { measure: { enabled: true } } });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const measureToolbarNode = document.querySelector('.ms-measure-toolbar');
        expect(measureToolbarNode).toBeTruthy();
        const closeNode = measureToolbarNode.querySelector('.glyphicon-1-close');
        expect(closeNode).toBeTruthy();
        Simulate.click(closeNode.parentNode);
        expect(store.getState().controls.measure.enabled).toBe(false);
    });
});
