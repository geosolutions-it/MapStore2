/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import {getAvailableInfoFormat} from '../../../../../utils/MapInfoUtils';
import FeatureInfo from '../FeatureInfo';

const defaultInfoFormat = getAvailableInfoFormat();


const formatCards = {
    HIDDEN: {
        titleId: 'layerProperties.hideFormatTitle',
        descId: 'layerProperties.hideFormatDescription',
        glyph: 'hide-marker',
        body: () => <div className="test-preview"/>
    },
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
    it('test rendering with supported infoFormats from layer props', () => {
        ReactDOM.render(<FeatureInfo element={{infoFormats: ["text/html", "text/plain"]}} formatCards={formatCards} defaultInfoFormat={defaultInfoFormat} />, document.getElementById("container"));
        const testComponent = document.getElementsByClassName('test-preview');
        expect(testComponent.length).toBe(2);
    });
    it('test rendering supported infoFormats for wfs layer', () => {
        ReactDOM.render(<FeatureInfo element={{type: "wfs"}}
            formatCards={formatCards}
            defaultInfoFormat={{
                HIDDEN: "text/html",
                ...defaultInfoFormat
            }} />, document.getElementById("container"));
        const testComponents = document.getElementsByClassName('test-preview');
        expect(testComponents.length).toBe(3);
        const sideCards = document.querySelectorAll('.mapstore-side-card-title span span');
        expect(sideCards.length).toBe(3);
        expect(sideCards[0].textContent).toBe('layerProperties.hideFormatTitle');
        expect(sideCards[1].textContent).toBe('layerProperties.propertiesFormatTitle');
        expect(sideCards[2].textContent).toBe('layerProperties.templateFormatTitle');
    });

    it('test rendering supported infoFormats for wms layer', () => {
        ReactDOM.render(<FeatureInfo  element={{type: "wms"}}
            formatCards={formatCards}
            defaultInfoFormat={{
                HIDDEN: "text/html",
                ...defaultInfoFormat
            }} />, document.getElementById("container"));
        const testComponent = document.getElementsByClassName('test-preview');
        expect(testComponent.length).toBe(5);
        const sideCards = document.querySelectorAll('.mapstore-side-card-title span span');
        expect(sideCards.length).toBe(5);
        expect(sideCards[0].textContent).toBe('layerProperties.hideFormatTitle');
        expect(sideCards[1].textContent).toBe('layerProperties.textFormatTitle');
        expect(sideCards[2].textContent).toBe('layerProperties.htmlFormatTitle');
        expect(sideCards[3].textContent).toBe('layerProperties.propertiesFormatTitle');
        expect(sideCards[4].textContent).toBe('layerProperties.templateFormatTitle');
    });
});
