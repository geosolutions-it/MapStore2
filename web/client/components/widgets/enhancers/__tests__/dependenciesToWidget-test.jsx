/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const dependenciesToWidget = require('../dependenciesToWidget');

describe('dependenciesToWidget enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('dependency transformation', (done) => {
        const Sink = dependenciesToWidget(createSink( props => {
            expect(props).toExist();
            expect(props.dependencies.x).toBe("a");
            done();
        }));
        ReactDOM.render(<Sink dependenciesMap={{x: "b"}} dependencies={{b: "a"}}/>, document.getElementById("container"));
    });
    it('dependency transformation', (done) => {
        const Sink = dependenciesToWidget(createSink( props => {
            expect(props).toExist();
            expect(props.dependencies.x).toBe("a");
            done();
        }));
        ReactDOM.render(<Sink dependenciesMap={{x: "b"}} dependencies={{
            'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].dependenciesMap': 'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].dependenciesMap',
            'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].mapSync': 'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].mapSync',
            'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].map.viewport': 'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].map.bbox',
            'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].map.center': 'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].map.center',
            'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].map.zoom': 'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].map.zoom',
            'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].map.layers': 'widgets[021cc9d0-387d-11ea-8d47-af9799518b77].map.layers',
            'widgets[068776f0-387d-11ea-8d47-af9799518b77].dependenciesMap': 'widgets[068776f0-387d-11ea-8d47-af9799518b77].dependenciesMap',
            'widgets[068776f0-387d-11ea-8d47-af9799518b77].mapSync': 'widgets[068776f0-387d-11ea-8d47-af9799518b77].mapSync',
            'widgets[068776f0-387d-11ea-8d47-af9799518b77].map.viewport': 'widgets[068776f0-387d-11ea-8d47-af9799518b77].map.bbox',
            'widgets[068776f0-387d-11ea-8d47-af9799518b77].map.center': 'widgets[068776f0-387d-11ea-8d47-af9799518b77].map.center',
            'widgets[068776f0-387d-11ea-8d47-af9799518b77].map.zoom': 'widgets[068776f0-387d-11ea-8d47-af9799518b77].map.zoom',
            'widgets[068776f0-387d-11ea-8d47-af9799518b77].map.layers': 'widgets[068776f0-387d-11ea-8d47-af9799518b77].map.layers',
            'map.dependenciesMap': 'map.dependenciesMap',
            'map.mapSync': 'map.mapSync',
            viewport: 'map.bbox',
            center: 'map.center',
            zoom: 'map.zoom',
            layers: 'layers.flat',
            'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].filter': 'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].filter',
            'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].quickFilters': 'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].quickFilters',
            'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].dependenciesMap': 'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].dependenciesMap',
            'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].mapSync': 'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].mapSync',
            'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].layer': 'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].layer',
            'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].options': 'widgets[13a9bd20-387d-11ea-8d47-af9799518b77].options'
    }}/>, document.getElementById("container"));
    });
});
