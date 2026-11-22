/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';

import { setObservableConfig } from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';

import useFile from '../useFile';

setObservableConfig(rxjsConfig);

const Component = useFile(() => <div id="use-file-child" />);
const lineFeature = {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[0, 0], [1, 1]] }
};

describe('longitudinalProfile useFile enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('notifies the missing .prj warning when the line feature is imported', () => {
        const actions = {
            onWarning: () => {},
            onChangeGeometry: () => {},
            onClose: () => {}
        };
        const spy = expect.spyOn(actions, 'onWarning');
        ReactDOM.render(<Component
            {...actions}
            crs="EPSG:3857"
            flattenFeatures={[lineFeature]}
            warnings={[{ type: 'warning', filename: 'a.zip', message: 'shapefile.error.missingPrj' }]}
        />, document.getElementById("container"));
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments[0].message).toBe('shapefile.error.missingPrj');
    });

    it('does not notify when there are no warnings', () => {
        const actions = {
            onWarning: () => {},
            onChangeGeometry: () => {},
            onClose: () => {}
        };
        const spy = expect.spyOn(actions, 'onWarning');
        ReactDOM.render(<Component
            {...actions}
            crs="EPSG:3857"
            flattenFeatures={[lineFeature]}
        />, document.getElementById("container"));
        expect(spy.calls.length).toBe(0);
    });
});
