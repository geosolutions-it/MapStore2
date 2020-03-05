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
        expect(tb).toBeTruthy();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass(tb, "control-label");
        expect(labels.length).toBe(4);
    });

    it('test ResultProps with preconfigured service', () => {
        const service = {
            displayName: "name of service",
            subTitle: "sub title of service",
            priority: 3,
            launchInfoPanel: "single_layer"
        };
        const tb = ReactDOM.render(<ResultsProps.Element service={service}/>, document.getElementById("container"));
        expect(tb).toBeTruthy();
        const infos = ReactTestUtils.findRenderedDOMComponentWithClass(tb, "priority-info with-top-margin");
        expect(infos).toBeTruthy();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass(tb, "control-label");
        expect(labels.length).toBe(4);
        expect(labels[0].innerText).toBe("search.s_title");
        expect(labels[1].innerText).toBe("search.s_description");
        expect(labels[2].innerText).toBe("search.s_priority3");
        expect(labels[3].innerText).toBe("search.s_launch_info_panel.label");
    });
});
