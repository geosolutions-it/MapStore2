/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const ResultsProps = require('../ResultsProps');

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

    it('test ResultProps creation', () => {
        const tb = ReactDOM.render(<ResultsProps.Element/>, document.getElementById("container"));
        expect(tb).toExist();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass(tb, "control-label");
        expect(labels.length).toBe(4);
    });

    it('test ResultProps with preconfigured service', () => {
        const service = {
            displayName: "name of service",
            subTitle: "sub title of service",
            priority: 3,
            launchInfoPanel: "single_layer",
            openFeatureInfoButtonEnabled: true
        };
        const tb = ReactDOM.render(<ResultsProps.Element service={service}/>, document.getElementById("container"));
        expect(tb).toExist();
        const infos = ReactTestUtils.findRenderedDOMComponentWithClass(tb, "priority-info with-top-margin");
        expect(infos).toExist();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass(tb, "control-label");
        expect(labels.length).toBe(4);
        expect(labels[0].innerText).toBe("search.s_title");
        expect(labels[1].innerText).toBe("search.s_description");
        expect(labels[2].innerText).toBe("search.s_priority3");
        expect(labels[3].innerText).toBe("search.s_launch_info_panel.label");
        const singleLayerOptions = document.getElementsByClassName('checkbox');
        expect(singleLayerOptions.length).toBe(2);
        Array.prototype.forEach.call(singleLayerOptions, (optionElem, idx) => {
            const inputElem = optionElem.getElementsByTagName('input')[0];
            expect(inputElem).toExist();
            expect(inputElem.checked).toBe(idx === 0);
        });
    });

    it('test ResultProps single layer options reset when launchInfoPanel is changed', () => {
        const handlers = {
            onPropertyChange: () => {}
        };
        const service = {
            displayName: "name of service",
            subTitle: "sub title of service",
            priority: 3,
            launchInfoPanel: "single_layer",
            openFeatureInfoButtonEnabled: true,
            forceSearchLayerVisibility: true
        };
        const alteredService = {
            displayName: "name of service",
            subTitle: "sub title of service",
            priority: 3,
            launchInfoPanel: "all_layers",
            openFeatureInfoButtonEnabled: false,
            forceSearchLayerVisibility: false
        };
        const spy = expect.spyOn(handlers, 'onPropertyChange');
        const tb = ReactDOM.render(<ResultsProps.Element
            service={service}
            launchInfoPanelSelectOptions={{
                // force select menu to open state
                ref: (select) => { if (select) select.setState({ isOpen: true }); }
            }}
            onPropertyChange={handlers.onPropertyChange}/>, document.getElementById("container"));
        expect(tb).toExist();
        const singleLayerOptions = document.getElementsByClassName('checkbox');
        expect(singleLayerOptions.length).toBe(2);
        Array.prototype.forEach.call(singleLayerOptions, optionElem => {
            const inputElem = optionElem.getElementsByTagName('input')[0];
            expect(inputElem).toExist();
            expect(inputElem.checked).toBe(true);
        });
        const launchInfoPanelSelect = document.getElementsByClassName('Select')[0];
        expect(launchInfoPanelSelect).toExist();
        const launchInfoPanelSelectOptions = launchInfoPanelSelect.getElementsByClassName('Select-option');
        expect(launchInfoPanelSelectOptions.length).toBe(3);
        ReactTestUtils.Simulate.mouseDown(launchInfoPanelSelectOptions[1]);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments[0]).toBe('service');
        expect(spy.calls[0].arguments[1]).toEqual(alteredService);
    });
});
