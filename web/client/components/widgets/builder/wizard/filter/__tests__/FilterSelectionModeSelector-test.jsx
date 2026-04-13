/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import FilterSelectionModeSelector from '../FilterDataTab/components/FilterSelectionModeSelector';
import { FILTER_SELECTION_MODES } from '../FilterDataTab/constants';

describe('FilterSelectionModeSelector', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('shows warning when Custom is selected and defaultFilter is invalid or missing', () => {
        const container = document.getElementById('container');
        ReactDOM.render(
            <FilterSelectionModeSelector
                value={FILTER_SELECTION_MODES.CUSTOM}
                onChange={() => {}}
                onDefineFilter={() => {}}
                isFilterValid={() => false}
            />,
            container
        );

        const warning = container.querySelector('.ms-filter-custom-filter-warning');
        expect(warning).toExist();
        expect(warning.className).toContain('alert-warning');

        const filterIcon = container.querySelector('.glyphicon-filter');
        expect(filterIcon).toExist();
    });
});
