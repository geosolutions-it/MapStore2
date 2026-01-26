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
import FilterDataTab from '../FilterDataTab/index';
import { DATA_SOURCE_TYPES } from '../FilterDataTab/constants';

describe('FilterDataTab component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with defaults and have correct number of input groups', () => {
        ReactDOM.render(
            <FilterDataTab
                data={{
                    data: {
                        dataSource: DATA_SOURCE_TYPES.FEATURES,
                        valuesFrom: 'grouped',
                        filterComposition: 'AND'
                    }
                }}
                onChange={() => {}}
                onOpenLayerSelector={() => {}}
                onEditorChange={() => {}}
            />,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-filter-wizard-data-tab');
        expect(el).toExist();

        // Check number of input groups
        const inputGroups = container.querySelectorAll('.input-group');
        expect(inputGroups.length).toBe(7);
    });
});

