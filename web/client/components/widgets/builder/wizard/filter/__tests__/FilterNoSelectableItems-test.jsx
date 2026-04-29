/*
 * Copyright 2026, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import FilterNoSelectableItems from '../FilterNoSelectableItems';

describe('FilterNoSelectableItems component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render Glyphicon with info-sign and message for no selectable items', () => {
        const container = document.getElementById("container");

        ReactDOM.render(<FilterNoSelectableItems />, container);

        const glyphicon = container.querySelector('.glyphicon-info-sign');
        expect(glyphicon).toExist();

        expect(container.textContent).toContain('widgets.filterWidget.noSelectableItems');
    });

    it('should apply optional className to the root element', () => {
        const container = document.getElementById("container");
        const customClass = 'ms-filter-view-no-selectable-items';

        ReactDOM.render(
            <FilterNoSelectableItems className={customClass} />,
            container
        );

        const root = container.firstElementChild;
        expect(root).toExist();
        expect(root.className).toContain(customClass);
    });
});
