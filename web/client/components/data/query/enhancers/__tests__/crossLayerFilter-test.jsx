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
const crossLayerFilter = require('../crossLayerFilter');

describe('crossLayerFilter enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('crossLayerFilter WFS Capabilities', (done) => {
        const Sink = crossLayerFilter(createSink( props => {
            expect(props).toExist();
            if (!props.loadingCapabilities) {
                expect(props.errorObj).toNotExist();
                done();
            }

        }));
        ReactDOM.render((<Sink
            crossLayerExpanded
            searchUrl="base/web/client/test-resources/wfs/states-capabilities.xml"
        />), document.getElementById("container"));
    });
    it('crossLayerFilter not supported', (done) => {
        const Sink = crossLayerFilter(createSink( props => {
            expect(props).toExist();
            if (!props.loadingCapabilities) {
                expect(props.errorObj).toExist();
                done();
            }

        }));
        ReactDOM.render((<Sink
            crossLayerExpanded
            searchUrl="base/web/client/test-resources/wfs/states-capabilities-nocoll.xml"
        />), document.getElementById("container"));
    });

    it('crossLayerFilter WFS Attributes retrival', (done) => {
        const actions = {
            setCrossLayerFilterParameter: () => { }
        };
        const spysetCrossLayerFilterParameter = expect.spyOn(actions, 'setCrossLayerFilterParameter');
        const Sink = crossLayerFilter(createSink( props => {
            expect(props).toExist();
            if (!props.loadingAttributes) {
                expect(props.attributes).toExist();
                expect(props.attributes.length).toBe(22);
                expect(spysetCrossLayerFilterParameter).toHaveBeenCalledWith("collectGeometries.queryCollection[geometryName]", "the_geom");
                done();
            }

        }));
        ReactDOM.render((<Sink
            setCrossLayerFilterParameter={actions.setCrossLayerFilterParameter}
            crossLayerExpanded
            layers={[{
                name: "topp:states",
                search: {
                    url: "base/web/client/test-resources/wfs/describe-states.json"
                }
            }]}
            crossLayerFilter={{
                collectGeometries: {
                    queryCollection: {
                        typeName: "topp:states"
                    }
                }
            }}
            searchUrl="base/web/client/test-resources/wfs/states-capabilities.xml"
        />), document.getElementById("container"));
    });
});
