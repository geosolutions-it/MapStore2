/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import WFSOptionalProps from '../WFSOptionalProps';

describe("test ResultProps component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test WFSOptionalProps creation', () => {
        const wfsOptionalProps = ReactDOM.render(<WFSOptionalProps.Element/>, document.getElementById("container"));
        expect(wfsOptionalProps).toExist();
        const labels = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, "control-label");
        expect(labels.length).toBe(3);
    });

    it('test WFSOptionalProps with preconfigured service', () => {
        let service = {
            type: "wfs",
            name: "Tiger road",
            subTitle: "Roads",
            priority: 3,
            options: {
                sortBy: "NAME",
                srsName: "EPSG:4326"
            }
        };
        let wfsOptionalProps = ReactDOM.render(<WFSOptionalProps.Element service={service}/>, document.getElementById("container"));
        expect(wfsOptionalProps).toExist();
        const labels = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, "control-label");
        expect(labels.length).toBe(3);
        expect(labels[0].innerText).toBe('search.s_sort');
        expect(labels[1].innerText).toBe('search.s_max_features');
        expect(labels[2].innerText).toBe('search.s_max_zoom');
        const inputs = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, 'form-control');
        expect(inputs.length).toBe(1);
        expect(inputs[0].value).toBe('NAME');
        let sliders = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, 'slider-label');
        expect(sliders.length).toBe(2);
        let maxFeatures = sliders[0].innerText;
        let maxZoomLevel = sliders[1].innerText;
        expect(maxFeatures).toBe('1');
        expect(maxZoomLevel).toBe('21');

        service = {
            type: "wfs",
            name: "Tiger road",
            subTitle: "Roads",
            priority: 3,
            options: {
                sortBy: "NAME",
                maxFeatures: 11,
                srsName: "EPSG:4326",
                maxZoomLevel: 8
            }
        };
        wfsOptionalProps = ReactDOM.render(<WFSOptionalProps.Element service={service}/>, document.getElementById("container"));
        expect(wfsOptionalProps).toExist();
        sliders = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, 'slider-label');
        maxFeatures = sliders[0].innerText;
        maxZoomLevel = sliders[1].innerText;
        expect(maxFeatures).toBe('11');
        expect(maxZoomLevel).toBe('8');
    });

    it('test WFSOptionalProps onPropertyChange for Sort by', () => {
        const service = {
            type: "wfs",
            name: "Tiger road",
            subTitle: "Roads",
            priority: 3,
            options: {
                sortBy: "NAME",
                srsName: "EPSG:4326",
                maxZoomLevel: 8
            }
        };

        const actions = {
            onPropertyChange: () => { }
        };
        const spyOnPropertyChange = expect.spyOn(actions, 'onPropertyChange');

        const wfsOptionalProps = ReactDOM.render(<WFSOptionalProps.Element service={service} onPropertyChange={actions.onPropertyChange}/>, document.getElementById("container"));
        expect(wfsOptionalProps).toExist();
        const inputs = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, 'form-control');
        inputs[0].value = 'TEST';
        TestUtils.Simulate.change(inputs[0]);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[0].arguments[1].options.sortBy).toBe('TEST');
    });

    it('test WFSOptionalProps onPropertyChange for Max zoom level', () => {
        const service = {
            type: "wfs",
            name: "Tiger road",
            subTitle: "Roads",
            priority: 3,
            options: {
                sortBy: "NAME",
                srsName: "EPSG:4326",
                maxZoomLevel: 8
            }
        };

        const actions = {
            onPropertyChange: () => { }
        };
        const spyOnPropertyChange = expect.spyOn(actions, 'onPropertyChange');

        const wfsOptionalProps = ReactDOM.render(<WFSOptionalProps.Element service={service} onPropertyChange={actions.onPropertyChange}/>, document.getElementById("container"));
        expect(wfsOptionalProps).toExist();
        const sliders = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, "noUi-target" );
        expect(sliders).toExist();
        expect(sliders.length).toBe(2);
        wfsOptionalProps.updateSliderProps("maxZoomLevel", [23]);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[0].arguments[1]).toEqual({...service, options: { ...service.options, maxZoomLevel: 23}});
    });

    it('test WFSOptionalProps onPropertyChange for Max features', () => {
        const service = {
            type: "wfs",
            name: "Tiger road",
            subTitle: "Roads",
            priority: 3,
            options: {
                sortBy: "NAME",
                srsName: "EPSG:4326",
                maxZoomLevel: 21,
                maxFeatures: 5
            }
        };

        const actions = {
            onPropertyChange: () => { }
        };
        const spyOnPropertyChange = expect.spyOn(actions, 'onPropertyChange');

        const wfsOptionalProps = ReactDOM.render(<WFSOptionalProps.Element service={service} onPropertyChange={actions.onPropertyChange}/>, document.getElementById("container"));
        expect(wfsOptionalProps).toExist();
        const sliders = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, "noUi-target" );
        expect(sliders).toExist();
        expect(sliders.length).toBe(2);
        wfsOptionalProps.updateSliderProps("maxFeatures", [10]);
        expect(spyOnPropertyChange).toHaveBeenCalled();
        expect(spyOnPropertyChange.calls[0].arguments[1].options).toEqual({ ...service.options, maxFeatures: 10});
    });
});
