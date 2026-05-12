/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import CatalogCard from '../datasets/CatalogCard';

describe('CatalogCard component', () => {
    const record = {
        identifier: 'id-1',
        title: 'Layer 1',
        description: 'Layer description',
        references: []
    };

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with minimal record', () => {
        ReactDOM.render(<CatalogCard
            includeAddToMap={false}
            multiSelect={false}
            loadingRecords={false}
            filters={{}}
            record={record}
            onToggle={() => {}}
            onAdd={() => {}}
        />, document.getElementById('container'));
        const card = document.querySelector('.ms-catalog-card');
        expect(card).toBeTruthy();
    });

    it('calls onToggle when checkbox changes', () => {
        const actions = {
            onToggle: () => {}
        };
        const spyOnToggle = expect.spyOn(actions, 'onToggle');

        ReactDOM.render(<CatalogCard
            includeAddToMap={false}
            multiSelect
            loadingRecords={false}
            isChecked={false}
            filters={{}}
            record={record}
            onToggle={actions.onToggle}
            onAdd={() => {}}
        />, document.getElementById('container'));

        const checkbox = document.querySelector('.ms-catalog-card input[type="checkbox"]');
        expect(checkbox).toBeTruthy();
        TestUtils.Simulate.change(checkbox, { target: { checked: true }, stopPropagation: () => {} });

        expect(spyOnToggle).toHaveBeenCalled();
        expect(spyOnToggle.calls[0].arguments[0]).toEqual(record);
        expect(spyOnToggle.calls[0].arguments[1]).toBe(true);
    });

    it('calls onToggle when card is clicked', () => {
        const actions = {
            onToggle: () => {}
        };
        const spyOnToggle = expect.spyOn(actions, 'onToggle');

        ReactDOM.render(<CatalogCard
            includeAddToMap={false}
            multiSelect={false}
            loadingRecords={false}
            isChecked={false}
            filters={{}}
            record={record}
            onToggle={actions.onToggle}
            onAdd={() => {}}
        />, document.getElementById('container'));

        const resourceCard = document.querySelector('.ms-resource-card');
        expect(resourceCard).toBeTruthy();
        TestUtils.Simulate.click(resourceCard);

        expect(spyOnToggle).toHaveBeenCalled();
        expect(spyOnToggle.calls[0].arguments[0]).toEqual(record);
        expect(spyOnToggle.calls[0].arguments[1]).toBe(true);
    });

    it('calls onAdd when add button is clicked', () => {
        const actions = {
            onAdd: () => {}
        };
        const spyOnAdd = expect.spyOn(actions, 'onAdd');

        ReactDOM.render(<CatalogCard
            includeAddToMap
            multiSelect={false}
            loadingRecords={false}
            filters={{}}
            record={record}
            onToggle={() => {}}
            onAdd={actions.onAdd}
        />, document.getElementById('container'));

        const addButton = document.querySelector('.ms-catalog-card .square-button-md');
        expect(addButton).toBeTruthy();
        TestUtils.Simulate.click(addButton, { stopPropagation: () => {} });

        expect(spyOnAdd).toHaveBeenCalled();
        expect(spyOnAdd.calls[0].arguments[0].identifier).toBe('id-1');
    });

    it('does not render checkbox when card is disabled', () => {
        ReactDOM.render(<CatalogCard
            includeAddToMap={false}
            multiSelect
            loadingRecords={false}
            disabled
            filters={{}}
            record={record}
            onToggle={() => {}}
            onAdd={() => {}}
        />, document.getElementById('container'));

        const inputs = document.querySelectorAll('.ms-catalog-card input[type="checkbox"]');
        expect(inputs.length).toBe(0);
        const card = document.querySelector('.ms-catalog-card.disabled');
        expect(card).toBeTruthy();
    });
});
