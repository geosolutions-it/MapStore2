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

import crossLayerFilter from '../crossLayerFilter';

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
    it('layer with fields', (done) => {
        const actions = {
            setCrossLayerFilterParameter: () => { }
        };
        const spysetCrossLayerFilterParameter = expect.spyOn(actions, 'setCrossLayerFilterParameter');
        const Sink = crossLayerFilter(createSink( props => {
            try {
                expect(props).toExist();
                if (!props.loadingAttributes) {
                    expect(props.attributes).toExist();
                    expect(props.attributes.length).toBe(22);
                    // check alias is used as label for the field "STATE_NAME"
                    expect(props.attributes[0].label).toBe("State Name");
                    expect(spysetCrossLayerFilterParameter).toHaveBeenCalledWith("collectGeometries.queryCollection[geometryName]", "the_geom");
                    done();
                }
            } catch (e) {
                done(e);
            }

        }));
        ReactDOM.render((<Sink
            setCrossLayerFilterParameter={actions.setCrossLayerFilterParameter}
            crossLayerExpanded
            layers={[{
                name: "topp:states",
                fields: [{
                    name: "STATE_NAME",
                    alias: "State Name"
                }, {
                    name: "STATE_FIPS"
                }],
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
