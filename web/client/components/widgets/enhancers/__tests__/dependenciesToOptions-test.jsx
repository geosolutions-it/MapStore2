/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const dependenciesToOptions = require('../dependenciesToOptions');

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
});
