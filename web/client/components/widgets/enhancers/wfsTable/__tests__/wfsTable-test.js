/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const { createSink, setObservableConfig} = require('recompose');
const expect = require('expect');
const wfsTable = require('../index');

const rxjsConfig = require('recompose/rxjsObservableConfig').default;
setObservableConfig(rxjsConfig);


describe('wfsTable enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('retrieve WFS describeFeatureType and features', (done) => {
        const Sink = wfsTable(createSink( props => {
            expect(props).toExist();
            if (props.describeFeatureType) {
                expect(props.describeFeatureType.featureTypes).toExist();
            }
            if (props.features && props.features.length > 0) {
                expect(props.features.length > 0).toBe(true);
                done();
            }
        }));
        ReactDOM.render(<Sink layer={{
            name: "pois",
            describeFeatureTypeURL: "base/web/client/test-resources/wfs/describe-pois.json",
            search: {
                type: "wfs",
                url: "base/web/client/test-resources/wfs/museam.json"
            }
        }} />, document.getElementById("container"));
    });
    it('retrieve WFS describeFeatureType with virtualScroll', (done) => {
        let triggered = false;
        const Sink = wfsTable(createSink(props => {
            expect(props).toExist();
            if (props.describeFeatureType) {
                expect(props.describeFeatureType.featureTypes).toExist();
            }
            if (props.pages && props.features.length > 0 && props.pages[0] === 0 && !triggered) {
                expect(props.pages[1]).toBe(20);
                triggered = true;
                props.pageEvents.moreFeatures({startPage: 2, endPage: 3});
            } else if (props.pages && props.features.length > 0 && props.pages[0] === 40) {
                expect(props.pages[1]).toBe(60);
                done();
            }
        }));
        ReactDOM.render(<Sink virtualScroll layer={{
            name: "pois",
            describeFeatureTypeURL: "base/web/client/test-resources/wfs/describe-pois.json",
            search: {
                type: "wfs",
                url: "base/web/client/test-resources/wfs/museam.json"
            }
        }} />, document.getElementById("container"));
    });

});
