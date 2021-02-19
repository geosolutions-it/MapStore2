/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ToggleFilter from '../ToggleFilter';
import ReactDOM from 'react-dom';
import expect from 'expect';
import * as TestUtils from 'react-dom/test-utils';
import { layerFilter, emptyLayerFilter }  from '../../../../test-resources/widgets/dependenciesToFiltersData';

describe('Test Toggle filter', () => {
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

        const tf = ReactDOM.render(
            <ToggleFilter node={layerFilter} propertiesChangeHandler={() => {}} />,
            document.getElementById("container"));
        expect(tf).toExist();
        const tfNode = ReactDOM.findDOMNode(tf);
        expect(tfNode.className.indexOf('toc-filter-icon') >= 0).toBe(true);
    });

    it('test cannot render component', () => {
        const propertiesChangeHandler = {
            callBack: () => {}
        };
        const tf = ReactDOM.render(<ToggleFilter  node={emptyLayerFilter} propertiesChangeHandler={propertiesChangeHandler.callBack} />,
            document.getElementById("container"));

        expect(tf).toExist();
        const tfNode = ReactDOM.findDOMNode(tf);
        expect(tfNode).toNotExist();
    });

    it('test click handler', () => {
        const propertiesChangeHandler = {
            callBack: () => {}
        };
        const propertiesChangeHandlerSpy = expect.spyOn(propertiesChangeHandler, 'callBack');
        const tf = ReactDOM.render(
            <ToggleFilter node={layerFilter}
                propertiesChangeHandler={propertiesChangeHandler.callBack} />,
            document.getElementById("container"));
        expect(tf).toExist();

        const tfNode = ReactDOM.findDOMNode(tf);
        TestUtils.Simulate.click(tfNode);
        expect(propertiesChangeHandlerSpy).toHaveBeenCalled();

    });

});
