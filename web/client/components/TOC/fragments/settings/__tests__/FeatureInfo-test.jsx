/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const expect = require('expect');
const ReactDOM = require('react-dom');
const FeatureInfo = require('../FeatureInfo');
const MapInfoUtils = require('../../../../../utils/MapInfoUtils');
const defaultInfoFormat = MapInfoUtils.getAvailableInfoFormat();
const TestUtils = require('react-dom/test-utils');

const formatCards = {
    TEXT: {
        titleId: 'layerProperties.textFormatTitle',
        descId: 'layerProperties.textFormatDescription',
        glyph: 'ext-txt',
        body: () => <div className="test-preview"/>
    },
    HTML: {
        titleId: 'layerProperties.htmlFormatTitle',
        descId: 'layerProperties.htmlFormatDescription',
        glyph: 'ext-html',
        body: () => <div className="test-preview"/>
    },
    PROPERTIES: {
        titleId: 'layerProperties.propertiesFormatTitle',
        descId: 'layerProperties.propertiesFormatDescription',
        glyph: 'ext-json',
        body: () => <div className="test-preview"/>
    },
    TEMPLATE: {
        titleId: 'layerProperties.templateFormatTitle',
        descId: 'layerProperties.templateFormatDescription',
        glyph: 'ext-empty',
        body: () => <div className="test-preview"/>
    }
};

describe("test FeatureInfo", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test rendering', () => {
        ReactDOM.render(<FeatureInfo formatCards={formatCards} defaultInfoFormat={defaultInfoFormat} />, document.getElementById("container"));
        const testComponent = document.getElementsByClassName('test-preview');
        expect(testComponent.length).toBe(4);
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(0);

    });

    it('test changes on click', done => {
        ReactDOM.render(<FeatureInfo onChange={(key, value) => {
            expect(key).toBe('featureInfo');
            expect(value.format).toBe('TEXT');
            done();
        }} formatCards={formatCards} defaultInfoFormat={defaultInfoFormat}/>, document.getElementById("container"));
        const testComponent = document.getElementsByClassName('test-preview');
        expect(testComponent.length).toBe(4);
        const sideCards = document.getElementsByClassName('mapstore-side-card');
        expect(sideCards.length).toBe(4);
        TestUtils.Simulate.click(sideCards[0]);
    });
});
