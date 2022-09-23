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
import TestUtils from 'react-dom/test-utils';

import describePois from '../../../../test-resources/wfs/describe-pois.json';
import museam from '../../../../test-resources/wfs/museam.json';
import FeatureGrid from '../FeatureGrid';

const spyOn = expect.spyOn;

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
        expect(document.getElementsByClassName('react-grid-HeaderCell-sortable react-grid-HeaderCell-sortable--ascending').length).toBe(0);
        document.getElementsByClassName('react-grid-HeaderCell-sortable')[0].click();
        expect(events.onSort).toHaveBeenCalled();
        expect(document.getElementsByClassName('react-grid-HeaderCell-sortable react-grid-HeaderCell-sortable--ascending').length).toBe(1);
        document.getElementsByClassName('react-grid-HeaderCell-sortable')[0].click();
        expect(document.getElementsByClassName('react-grid-HeaderCell-sortable react-grid-HeaderCell-sortable--ascending').length).toBe(0);
        expect(document.getElementsByClassName('react-grid-HeaderCell-sortable react-grid-HeaderCell-sortable--descending').length).toBe(1);
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
    it('Test the field values are rendered right way in grid cells', () => {
        ReactDOM.render(<FeatureGrid virtualScroll={false}
            describeFeatureType={describePois}
            features={museam.features}/>, document.getElementById("container"));
        let domNode = Array.prototype.filter.call(document.getElementsByClassName("react-grid-Cell"), (element) =>{
            return element;
        });
        expect(domNode).toExist();
        expect(domNode[0].getAttribute('value')).toBe('' + (museam.features[0].properties.NAME));
        expect(domNode[1].getAttribute('value')).toBe('' + (museam.features[0].properties.THUMBNAIL));
        expect(domNode[2].getAttribute('value')).toBe('' + (museam.features[0].properties.MAINPAGE));
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
    it('Test grid with custom grid height props', () => {
        ReactDOM.render(<FeatureGrid  virtualScroll={false}
            gridOpts= {{
                rowHeight: 28,
                headerRowHeight: 28,
                headerFiltersHeight: 28
            }}
            describeFeatureType={describePois} enableColumnFilters features={museam.features}/>, document.getElementById("container"));
        const gridHeaderRows = document.getElementsByClassName('react-grid-HeaderRow');
        const gridRow = document.getElementsByClassName('react-grid-Row');
        expect(gridHeaderRows.length).toBe(2);
        const headerRowHeight = gridHeaderRows[0]?.getAttribute('height');
        expect(Number(headerRowHeight)).toBe(28);
        const headerFiltersHeight = gridHeaderRows[1]?.getAttribute('height');
        expect(Number(headerFiltersHeight)).toBe(28);
        const rowHeight = gridRow[0]?.offsetHeight;
        expect(rowHeight).toBe(28);
    });
    it('Test grid with custom grid height props with no filter', () => {
        ReactDOM.render(<FeatureGrid  virtualScroll={false}
            gridOpts= {{
                rowHeight: 28,
                headerRowHeight: 28
            }}
            describeFeatureType={describePois} enableColumnFilters={false} features={museam.features}/>, document.getElementById("container"));
        const gridHeaderRows = document.getElementsByClassName('react-grid-HeaderRow');
        const gridRow = document.getElementsByClassName('react-grid-Row');
        expect(gridHeaderRows.length).toBe(1);
        const headerRowHeight = gridHeaderRows[0]?.getAttribute('height');
        expect(Number(headerRowHeight)).toBe(28);
        const rowHeight = gridRow[0]?.offsetHeight;
        expect(rowHeight).toBe(28);
    });
    it('Test grid with default header title', () => {
        ReactDOM.render(<FeatureGrid virtualScroll={false}
            describeFeatureType={describePois} enableColumnFilters={false} features={museam.features}/>, document.getElementById("container"));
        const gridHeaderCell = document.getElementsByClassName('react-grid-HeaderCell');
        expect(gridHeaderCell[0].innerText).toBe('NAME');
    });
    it('Test grid with custom header title', () => {
        ReactDOM.render(<FeatureGrid virtualScroll={false}
            options={{propertyName: [{name: "NAME", title: "Some Name", description: "Some description"}]}}
            describeFeatureType={describePois} enableColumnFilters={false} features={museam.features}/>, document.getElementById("container"));
        const gridHeaderCell = document.getElementsByClassName('react-grid-HeaderCell');
        expect(gridHeaderCell[0].innerText).toBe('Some Name');
    });
});
