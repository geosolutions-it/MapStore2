/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import FilterNodeTool from '../FilterNodeTool';
import ReactDOM from 'react-dom';
import expect from 'expect';
import * as TestUtils from 'react-dom/test-utils';
import { layerFilter, emptyLayerFilter }  from '../../../../test-resources/widgets/dependenciesToFiltersData';

const TestItemComponent = ({ glyph, onClick }) => <button className={glyph} onClick={() => onClick()}></button>;

describe('FilterNodeTool', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render component', () => {
        ReactDOM.render(<FilterNodeTool node={layerFilter} itemComponent={TestItemComponent} />, document.getElementById("container"));
        const fNode = document.querySelector('.filter');
        expect(fNode).toBeTruthy();
    });

    it('test cannot render component', () => {
        ReactDOM.render(<FilterNodeTool  node={emptyLayerFilter} itemComponent={TestItemComponent} />,
            document.getElementById("container"));
        const fNode = document.querySelector('.filter');
        expect(fNode).toBeFalsy();
    });

    it('test click handler', () => {
        const actions = {
            onChange: () => {}
        };
        const propertiesChangeHandlerSpy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(
            <FilterNodeTool node={layerFilter} onChange={actions.onChange} itemComponent={TestItemComponent} />,
            document.getElementById("container"));
        const fNode = document.querySelector('.filter');
        TestUtils.Simulate.click(fNode);
        expect(propertiesChangeHandlerSpy).toHaveBeenCalled();
    });

});
