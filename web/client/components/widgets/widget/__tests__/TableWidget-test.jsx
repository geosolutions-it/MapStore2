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
import ReactTestUtils from 'react-dom/test-utils';
import { compose, defaultProps } from 'recompose';
import { waitFor } from '@testing-library/react';

import describePois from '../../../../test-resources/wfs/describe-pois.json';
import museam from '../../../../test-resources/wfs/museam.json';
import tableWidget from '../../enhancers/tableWidget';
import TableWidgetComp from '../TableWidget';

const TableWidget = compose(
    defaultProps({ canEdit: true }),
    tableWidget
)(TableWidgetComp);

describe('TableWidget component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('TableWidget rendering with defaults', () => {
        ReactDOM.render(<TableWidget />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-card');
        expect(el).toExist();
        expect(container.querySelector('.glyphicon-pencil')).toExist();
        expect(container.querySelector('.glyphicon-trash')).toExist();
    });
    it('view only mode', () => {
        ReactDOM.render(<TableWidget canEdit={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toNotExist();
        expect(container.querySelector('.glyphicon-trash')).toNotExist();
    });
    it('Test TableWidget onEdit callback', () => {
        const actions = {
            onEdit: () => { }
        };
        const spyonEdit = expect.spyOn(actions, 'onEdit');
        ReactDOM.render(<TableWidget onEdit={actions.onEdit} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.glyphicon-pencil');
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonEdit).toHaveBeenCalled();
    });
    it('TableWidget loading', () => {
        ReactDOM.render(<TableWidget loading />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.loader-container');
        expect(el).toExist();
    });
    it('TableWidget empty', (done) => {
        ReactDOM.render(<TableWidget describeFeatureType={describePois} features={[]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        waitFor(() =>expect( container.querySelector('.react-grid-Empty')).toBeTruthy())
            .then(() => done());
    });
    it('TableWidget with default gridOpts', () => {
        ReactDOM.render(<TableWidget
            virtualScroll={false} describeFeatureType={describePois} enableColumnFilters features={museam.features}/>, document.getElementById("container"));
        const gridHeaderRows = document.getElementsByClassName('react-grid-HeaderRow');
        expect(gridHeaderRows.length).toBe(2);
        const headerRowHeight = gridHeaderRows[0]?.getAttribute('height');
        expect(Number(headerRowHeight)).toBe(28);
        const headerFiltersHeight = gridHeaderRows[1]?.getAttribute('height');
        expect(Number(headerFiltersHeight)).toBe(28);
    });
    it('TableWidget with custom gridOpts', () => {
        ReactDOM.render(<TableWidget
            gridOpts={{ headerRowHeight: 35, headerFiltersHeight: 35}}
            virtualScroll={false} describeFeatureType={describePois} enableColumnFilters features={museam.features}/>, document.getElementById("container"));
        const gridHeaderRows = document.getElementsByClassName('react-grid-HeaderRow');
        expect(gridHeaderRows.length).toBe(2);
        const headerRowHeight = gridHeaderRows[0]?.getAttribute('height');
        expect(Number(headerRowHeight)).toBe(35);
        const headerFiltersHeight = gridHeaderRows[1]?.getAttribute('height');
        expect(Number(headerFiltersHeight)).toBe(35);
    });
    it('TableWidget onAddFilter', (done) => {
        const _d = {...describePois, featureTypes: [{...describePois.featureTypes[0], properties: [...describePois.featureTypes[0].properties, {
            "name": "FLOAT",
            "maxOccurs": 1,
            "minOccurs": 0,
            "nillable": true,
            "type": "xsd:number",
            "localType": "number"
        }]}]};
        ReactTestUtils.act(()=>{
            ReactDOM.render(<TableWidget enableColumnFilters id={1} updateProperty={(id, path, attribute)=>{
                try {
                    expect(id).toBe(1);
                    expect(path).toBe("quickFilters.FLOAT");
                    expect(attribute.value).toBe(12);
                    expect(attribute.rawValue).toBe('> 12');
                    expect(attribute.operator).toBe('>');
                    expect(attribute.type).toBe('number');
                } catch (e) {
                    done(e);
                }
                done();
            }} describeFeatureType={_d} features={[]} />, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        const filterFields = container.querySelectorAll("input");
        expect(filterFields.length).toBe(4);
        ReactTestUtils.Simulate.change(filterFields[3], {target: {value: '> 12'}});
    });
});
