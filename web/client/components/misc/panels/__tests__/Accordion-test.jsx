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
const Accordion = require('../Accordion');
const TestUtils = require('react-dom/test-utils');

describe("test Accordion", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test rendering and panels', () => {
        const panels = [
            {
                id: 'panel-001'
            },
            {
                id: 'panel-002'
            }
        ];

        ReactDOM.render(<Accordion activePanel="panel-001" panels={panels}/>, document.getElementById("container"));
        const domComp = document.getElementsByClassName('ms-accordion')[0];
        expect(domComp).toExist();
        const panelsDOM = document.getElementsByClassName('panel');
        expect(panelsDOM.length).toBe(2);
        const selected = document.getElementsByClassName('ms-selected');
        expect(selected.length).toBe(1);
    });

    it('test fill container option', () => {
        const panels = [
            {
                id: 'panel-001'
            },
            {
                id: 'panel-002'
            }
        ];

        ReactDOM.render(<Accordion fillContainer activePanel="panel-001" panels={panels}/>, document.getElementById("container"));
        const domComp = document.getElementsByClassName('ms-accordion')[0];
        expect(domComp).toExist();
        const panelsDOM = document.getElementsByClassName('panel');
        expect(panelsDOM.length).toBe(2);
        const selected = document.getElementsByClassName('ms-selected');
        expect(selected.length).toBe(1);
        const fillContainer = document.getElementsByClassName('ms-fill-container');
        expect(fillContainer.length).toBe(1);
    });

    it('test on select', () => {
        const panels = [
            {
                id: 'panel-001',
                head: {}
            },
            {
                id: 'panel-002',
                head: {}
            }
        ];

        const testHandlers = {
            onSelect: () => {}
        };
        const spyOnSelect = expect.spyOn(testHandlers, 'onSelect');

        ReactDOM.render(<Accordion onSelect={testHandlers.onSelect} activePanel="panel-001" panels={panels}/>, document.getElementById("container"));
        const domComp = document.getElementsByClassName('ms-accordion')[0];
        expect(domComp).toExist();
        const panelsDOM = document.getElementsByClassName('panel');
        expect(panelsDOM.length).toBe(2);
        const panelHead = document.getElementsByClassName('mapstore-side-card')[1];
        TestUtils.Simulate.click(panelHead);

        expect(spyOnSelect).toHaveBeenCalled();
        expect(spyOnSelect).toHaveBeenCalledWith('panel-002');
    });

});
