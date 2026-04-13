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
import FilterSelectAllOptions from '../FilterSelectAllOptions';

describe('FilterSelectAllOptions', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should hide Clear button when allowEmptySelection is false', () => {
        const container = document.getElementById("container");
        ReactDOM.render(
            <FilterSelectAllOptions
                items={[
                    { id: '1', label: 'Option 1' },
                    { id: '2', label: 'Option 2' }
                ]}
                selectedValues={[]}
                onSelectionChange={() => {}}
                selectionMode="multiple"
                allowEmptySelection={false}
            />,
            container
        );

        // SelectAll label should be present
        expect(container.textContent).toContain('widgets.filterWidget.selectAll');
        // Clear label should NOT be present
        expect(container.textContent).toNotContain('widgets.filterWidget.clear');
    });
});

