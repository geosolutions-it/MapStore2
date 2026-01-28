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
import { Simulate } from 'react-dom/test-utils';
import DefaultFilterInput from '../FilterDataTab/components/DefaultFilterInput';

describe('DefaultFilterInput component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render enable default filter label, switch, and call onDefineFilter when filter button is clicked', () => {
        const container = document.getElementById("container");
        const onDefineFilter = expect.createSpy();

        ReactDOM.render(
            <DefaultFilterInput
                defaultFilterEnabled
                defaultFilter={null}
                onDefaultFilterEnabledChange={() => {}}
                onDefaultFilterChange={() => {}}
                onDefineFilter={onDefineFilter}
            />,
            container
        );

        expect(container.textContent).toContain('widgets.filterWidget.enableDefaultFilter');

        const filterBtn = container.querySelector('.input-group .btn');
        expect(filterBtn).toExist();
        Simulate.click(filterBtn);
        expect(onDefineFilter).toHaveBeenCalled();
    });
});
