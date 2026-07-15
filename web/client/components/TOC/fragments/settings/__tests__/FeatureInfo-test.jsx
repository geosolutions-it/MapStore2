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
import { DragDropContext as dragDropContext } from 'react-dnd';
import testBackend from 'react-dnd-test-backend';

import {getAvailableInfoFormat} from '../../../../../utils/MapInfoUtils';
import FeatureInfo from '../FeatureInfo';
import axios from '../../../../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

let mockAxios;

const defaultInfoFormat = getAvailableInfoFormat();
const DndFeatureInfo = dragDropContext(testBackend)(FeatureInfo);
const getFeatureInfoInstance = (props = {}) => TestUtils.findRenderedComponentWithType(
    ReactDOM.render(<DndFeatureInfo {...props}/>, document.getElementById("container")),
    FeatureInfo
);


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
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        mockAxios.restore();
        setTimeout(done);
    });

    it('test rendering', () => {
        getFeatureInfoInstance({formatCards, defaultInfoFormat});
        const views = document.querySelectorAll('[data-id^="feature-info-view-"]');
        expect(views.length).toBe(1);
        expect(views[0].querySelector('input[placeholder="Title"]')).toExist();
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(0);

    });

    it('should display configured views as disabled when identify is disabled', () => {
        ReactDOM.render(<DndFeatureInfo
            element={{
                featureInfo: {
                    disabled: true,
                    views: [
                        { id: 'text-view', title: 'Text identify', type: 'TEXT' },
                        { id: 'properties-view', title: 'Properties identify', type: 'PROPERTIES' }
                    ]
                }
            }}
            formatCards={formatCards}
            defaultInfoFormat={defaultInfoFormat}/>, document.getElementById("container"));

        const views = document.querySelectorAll('[data-id^="feature-info-view-"]');
        expect(views.length).toBe(2);
        expect(views[0].style.opacity).toBe('0.5');
        expect(views[0].querySelector('input[placeholder="Title"]').disabled).toBe(true);
        expect(views[0].querySelector('.Select').classList.contains('is-disabled')).toBe(true);
        expect([...views[0].querySelectorAll('button')].every((button) => button.disabled)).toBe(true);
        expect(document.querySelector('.btn-primary').disabled).toBe(true);
    });

    it('updates the featureInfo view configuration', done => {
        const component = getFeatureInfoInstance({onChange: (key, value) => {
            expect(key).toBe('featureInfo');
            expect(value.disabled).toBe(true);
            expect(value.views.length).toBe(1);
            done();
        }, formatCards, defaultInfoFormat});
        component.updateFeatureInfo(true, component.getViews());
    });
    it('test rendering with supported infoFormats from layer props', () => {
        const component = getFeatureInfoInstance({element: {infoFormats: ["text/html", "text/plain"]}, formatCards, defaultInfoFormat});
        expect(component.getTypeOptions()).toEqual(['TEXT', 'HTML']);
    });
    it('test rendering supported infoFormats for wfs layer', () => {
        const component = getFeatureInfoInstance({element: {type: "wfs"}, formatCards, defaultInfoFormat});
        expect(component.getTypeOptions()).toEqual(['PROPERTIES', 'TEMPLATE']);
    });

    it('test rendering supported infoFormats for wfs layer with only application/json', () => {
        const component = getFeatureInfoInstance({element: {type: "wfs", infoFormats: ["application/json"]}, formatCards, defaultInfoFormat});
        expect(component.getTypeOptions()).toEqual(['PROPERTIES', 'TEMPLATE']);
    });

    it('test rendering supported infoFormats for wfs layer with application/json and text/html', () => {
        const component = getFeatureInfoInstance({element: {type: "wfs", infoFormats: ["application/json", "text/html"]}, formatCards, defaultInfoFormat});
        expect(component.getTypeOptions()).toEqual(['HTML', 'PROPERTIES', 'TEMPLATE']);
    });

    it('test rendering supported infoFormats for wms layer', () => {
        const component = getFeatureInfoInstance({element: {type: "wms"}, formatCards, defaultInfoFormat});
        expect(component.getTypeOptions()).toEqual(['TEXT', 'HTML', 'PROPERTIES', 'TEMPLATE']);
    });

    it('should request WMS GetCapabilities for wms layers', (done) => {

        mockAxios.onGet().reply((req) => {
            try {
                expect(req.url).toBe('/geoserver/wms?service=WMS&version=1.3.0&request=GetCapabilities');
            } catch (e) {
                done(e);
            }
            done();
            return [200, {}];
        });
        ReactDOM.render(<DndFeatureInfo element={{ type: "wms", url: '/geoserver/wms' }}
            formatCards={formatCards}
            defaultInfoFormat={defaultInfoFormat} />, document.getElementById("container"));
        const testComponents = document.getElementsByClassName('test-preview');
        expect(testComponents.length).toBe(0);
    });

    it('should request WFS GetCapabilities for wfs layers', (done) => {

        mockAxios.onGet().reply((req) => {
            try {
                expect(req.url).toBe('/geoserver/wfs?version=1.1.0&service=WFS&request=GetCapabilities');
            } catch (e) {
                done(e);
            }
            done();
            return [200, {}];
        });
        ReactDOM.render(<DndFeatureInfo element={{ type: "wfs", url: '/geoserver/wfs' }}
            formatCards={formatCards}
            defaultInfoFormat={defaultInfoFormat} />, document.getElementById("container"));
        const testComponents = document.getElementsByClassName('test-preview');
        expect(testComponents.length).toBe(0);
    });
});
