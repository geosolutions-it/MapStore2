/*
 * Copyright 2026, GeoSolutions
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import FilterDropdownList from '../FilterDropdownList';

describe('FilterDropdownList', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should apply scrollable values styles only when there are selected values', () => {
        const container = document.getElementById("container");
        const items = [
            { id: '1', label: 'Alabama' },
            { id: '2', label: 'Arizona' }
        ];

        // empty selection => no modifier class and no CSS variable
        ReactDOM.render(
            <FilterDropdownList
                items={items}
                selectionMode="multiple"
                selectedValues={[]}
                layoutMaxHeight={100}
                onSelectionChange={() => {}}
            />,
            container
        );
        const listNodeEmpty = container.querySelector('.ms-filter-widget-dropdown-list');
        expect(listNodeEmpty).toExist();
        expect(listNodeEmpty.className).toNotContain('ms-filter-widget-dropdown-list--scrollable-values');
        expect(listNodeEmpty.style.getPropertyValue('--filter-widget-dropdown-value-max-height')).toBe('');

        // with selection => modifier class and CSS variable set
        ReactDOM.render(
            <FilterDropdownList
                items={items}
                selectionMode="multiple"
                selectedValues={['1']}
                layoutMaxHeight={100}
                onSelectionChange={() => {}}
            />,
            container
        );
        const listNodeSelected = container.querySelector('.ms-filter-widget-dropdown-list');
        expect(listNodeSelected).toExist();
        expect(listNodeSelected.className).toContain('ms-filter-widget-dropdown-list--scrollable-values');
        expect(listNodeSelected.style.getPropertyValue('--filter-widget-dropdown-value-max-height')).toBe('100px');
        // sanity: react-select wrapper uses passed className + multi modifier
        expect(container.querySelector('.ms-filter-widget-dropdown.Select--multi')).toExist();
    });

    it('should not apply scrollable styles when layoutMaxHeight is missing', () => {
        const container = document.getElementById("container");
        const items = [
            { id: '1', label: 'Alabama' },
            { id: '2', label: 'Arizona' }
        ];

        ReactDOM.render(
            <FilterDropdownList
                items={items}
                selectionMode="multiple"
                selectedValues={['1']}
                onSelectionChange={() => {}}
            />,
            container
        );

        const listNode = container.querySelector('.ms-filter-widget-dropdown-list');
        expect(listNode).toExist();
        expect(listNode.className).toNotContain('ms-filter-widget-dropdown-list--scrollable-values');
        expect(listNode.style.getPropertyValue('--filter-widget-dropdown-value-max-height')).toBe('');
        expect(container.querySelector('.ms-filter-widget-dropdown.Select--multi')).toExist();
    });
});

