/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';

import dependenciesToOptions from '../dependenciesToOptions';

describe('widgets dependenciesToOptions enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('dependenciesToOptions default', (done) => {
        const Sink = dependenciesToOptions(createSink( props => {
            expect(props).toExist();
            expect(props.options).toBe(undefined);
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('dependenciesToOptions default', (done) => {
        const options = {
            a: "a"
        };
        const Sink = dependenciesToOptions(createSink( props => {
            expect(props).toExist();
            expect(props.options).toBe(options);
            done();
        }));
        ReactDOM.render(<Sink options={options}/>, document.getElementById("container"));
    });
    it('dependenciesToOptions with viewParams', (done) => {
        const options = {
            a: "a"
        };
        const Sink = dependenciesToOptions(createSink( props => {
            expect(props).toExist();
            expect(props.options.a).toBe("a");
            expect(props.options.viewParams).toBe("a:b");
            done();
        }));
        ReactDOM.render(<Sink
            mapSync
            geomProp={"geometry"}
            // this is the layer saved in config (copy)
            layer={{id: 1}}
            dependencies={ {
            // retrieves the view params from layers (original list)
                layers: [{
                    id: 1,
                    params: { viewParams: "a:b" }
                }]
            } }
            options={options}/>, document.getElementById("container"));
    });
    it('dependenciesToOptions for selected charts', (done) => {
        const options = {
            a: "a"
        };
        const Sink = dependenciesToOptions(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.options).toBeTruthy();
            expect(props.options.a).toBe("a");
            expect(props.options.viewParams).toBe("a:b");
            expect(props.layerOptions).toBeTruthy();
            expect(props.layerOptions.length).toBe(1);
            expect(props.layerOptions[0].options).toBeTruthy();
            done();
        }));
        ReactDOM.render(<Sink
            mapSync
            geomProp={"geometry"}
            selectedChartId={1}
            layerOptions={[{chartId: 1, layer: {name: "test", id: 1} }]}
            layer={{id: 1}}
            dependencies={ {
                layers: [{
                    id: 1,
                    params: { viewParams: "a:b" }
                }]
            } }
            options={options}
        />, document.getElementById("container"));
    });
    it('dependenciesToOptions for charts', (done) => {
        const options = {
            a: "a"
        };
        const Sink = dependenciesToOptions(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.options).toBeTruthy();
            expect(props.options.a).toBe("a");
            expect(props.options.viewParams).toBeTruthy();
            expect(props.layerOptions).toBeTruthy();
            expect(props.layerOptions[0].options).toBeFalsy();
            done();
        }));
        ReactDOM.render(<Sink
            mapSync
            geomProp={"geometry"}
            layerOptions={[{chartId: 1, layer: {name: "test", id: 1} }]}
            layer={{id: 1}}
            dependencies={ {
                layers: [{
                    id: 1,
                    params: { viewParams: "a:b" }
                }]
            } }
            options={options}
        />, document.getElementById("container"));
    });
});
