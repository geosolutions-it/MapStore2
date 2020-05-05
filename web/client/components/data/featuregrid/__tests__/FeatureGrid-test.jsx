/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var expect = require('expect');
const TestUtils = require('react-dom/test-utils');
var FeatureGrid = require('../FeatureGrid');

const spyOn = expect.spyOn;
const museam = require('../../../../test-resources/wfs/museam.json');
const describePois = require('../../../../test-resources/wfs/describe-pois.json');

// TODO FIX ALL THESE TESTS (recompose)
describe('Test for FeatureGrid component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container" style="height:500px"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render with defaults', () => {
        ReactDOM.render(<FeatureGrid/>, document.getElementById("container"));
        expect(document.getElementsByClassName('react-grid-Container').length).toBe(1);
    });
    it('render sample features', () => {
        ReactDOM.render(<FeatureGrid describeFeatureType={describePois} virtualScroll={false} features={museam.features}/>, document.getElementById("container"));
        expect(document.getElementsByClassName('react-grid-HeaderCell').length).toBe(3);
        expect(document.getElementsByClassName('react-grid-Row').length).toBe(1);
    });
    it('render sample features with a tool', () => {
        const tool = {
            key: "test_tool",
            name: '',
            width: 35,
            frozen: true,
            events: {
                onClick: () => {}
            },
            formatter: () => <div className="test-grid-tool" />
        };
        spyOn(tool.events, "onClick");
        ReactDOM.render(<FeatureGrid virtualScroll={false} describeFeatureType={describePois} features={museam.features} tools={[tool]}/>, document.getElementById("container"));
        expect(document.getElementsByClassName('react-grid-HeaderCell').length).toBe(4);
        expect(document.getElementsByClassName('react-grid-Row').length).toBe(1);
        document.getElementsByClassName('test-grid-tool')[0].click();
        expect(tool.events.onClick).toHaveBeenCalled();
    });
    it('hide columns features', () => {
        ReactDOM.render(<FeatureGrid virtualScroll={false} describeFeatureType={describePois} features={museam.features} columnSettings={{NAME: {hide: true}}}/>, document.getElementById("container"));
        expect(document.getElementsByClassName('react-grid-HeaderCell').length).toBe(2);
    });
    it('sort event', () => {
        const events = {
            onSort: () => {}
        };
        spyOn(events, "onSort");
        ReactDOM.render(<FeatureGrid virtualScroll={false} gridEvents={{onGridSort: events.onSort}} describeFeatureType={describePois} features={museam.features}/>, document.getElementById("container"));
        document.getElementsByClassName('react-grid-HeaderCell-sortable')[0].click();
        expect(events.onSort).toHaveBeenCalled();
    });
    //
    // ROW SELECTION EVENTS
    //
    it('row selection event without checkbox', () => {
        const events = {
            onRowsToggled: () => {}
        };
        spyOn(events, "onRowsToggled");
        ReactDOM.render(<FeatureGrid virtualScroll={false} gridEvents={{onRowsToggled: events.onRowsToggled}} gridOpts= {{rowSelection: {
            showCheckbox: false,
            selectBy: {
                keys: {
                    rowKey: 'id',
                    values: []
                }
            }
        }}} describeFeatureType={describePois} features={museam.features}/>, document.getElementById("container"));
        // TODO click on a row
        document.getElementsByClassName('react-grid-Cell')[0].click();
        expect(events.onRowsToggled).toHaveBeenCalled();
    });
    it('row selection event with checkboxes', () => {
        const events = {
            onRowsSelected: () => {},
            onRowsDeselected: () => {},
            onRowsToggled: () => {}
        };
        spyOn(events, "onRowsSelected");
        spyOn(events, "onRowsDeselected");
        spyOn(events, "onRowsToggled");
        ReactDOM.render(<FeatureGrid virtualScroll={false}
            gridEvents={events}
            mode="EDIT"
            describeFeatureType={describePois}
            features={museam.features}
        />, document.getElementById("container"));
        let domNode = document.getElementsByClassName('react-grid-checkbox')[1];
        TestUtils.Simulate.click(domNode);
        expect(events.onRowsSelected).toHaveBeenCalled();
        ReactDOM.render(<FeatureGrid
            virtualScroll={false}
            gridEvents={events}
            mode="EDIT"
            describeFeatureType={describePois}
            features={museam.features}
            select={[{id: museam.features[0].id}]}
        />, document.getElementById("container"));
        domNode = document.getElementsByClassName('react-grid-checkbox')[1];
        TestUtils.Simulate.click(domNode);
        expect(events.onRowsDeselected).toHaveBeenCalled();
    });
    it('temporary changes on field edit', () => {
        const events = {
            onTemporaryChanges: () => {}
        };
        spyOn(events, 'onTemporaryChanges');
        ReactDOM.render(<FeatureGrid virtualScroll={false}
            gridEvents={events}
            mode="EDIT"
            describeFeatureType={describePois}
            features={museam.features}
        />, document.getElementById("container"));
        let domNode = Array.prototype.filter.call(document.getElementsByClassName('react-grid-Cell'),
            element => element.getAttribute('value') === 'museam')[0];
        expect(domNode).toExist();
        TestUtils.Simulate.doubleClick(domNode);
        expect(events.onTemporaryChanges).toHaveBeenCalled();
        expect(events.onTemporaryChanges).toHaveBeenCalledWith(true);
    });
});
