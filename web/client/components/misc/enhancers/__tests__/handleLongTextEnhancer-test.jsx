/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import { handleLongTextEnhancer } from '../handleLongTextEnhancer';
import { StringFormatter } from '../../../data/featuregrid/formatters';

describe("handleLongTextEnhancer enhancer", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('handleLongTextEnhancer by passing formatter as wrapper', () => {
        const EnhancerWithFormatter = ()=> handleLongTextEnhancer(StringFormatter)({ value: "test12334567899999" });
        ReactDOM.render(
            <EnhancerWithFormatter />,
            document.getElementById("container")
        );
        expect(document.getElementById("container").innerHTML).toExist();
        expect(document.getElementsByTagName('span').length).toEqual(2);
        expect(document.getElementsByTagName('span')[1].innerHTML).toExist();
    });

    it('handleLongTextEnhancer with by passing td as wrapper', () => {
        const wrapper = () => (<td>15234568965</td>);
        const EnhancerWithFormatter = ()=> handleLongTextEnhancer(wrapper)({ value: "15234568965" });
        ReactDOM.render(
            <EnhancerWithFormatter />,
            document.getElementById("container")
        );
        expect(document.getElementById("container").innerHTML).toExist();
        expect(document.getElementsByTagName('span').length).toEqual(2);
        expect(document.getElementsByTagName('span')[1].innerHTML).toExist();
    });


    it('handleLongTextEnhancer with by passing span as wrapper', () => {
        const wrapper = () => (<span>15234568965</span>);
        const EnhancerWithFormatter = ()=> handleLongTextEnhancer(wrapper)({ value: "15234568965" });
        ReactDOM.render(
            <EnhancerWithFormatter />,
            document.getElementById("container")
        );
        expect(document.getElementById("container").innerHTML).toExist();
        expect(document.getElementsByTagName('span').length).toEqual(3);
        expect(document.getElementsByTagName('span')[1].innerHTML).toExist();
    });


    it('handleLongTextEnhancer with by passing td div wrapper', () => {
        const wrapper = () => (<div>test</div>);
        const EnhancerWithFormatter = ()=> handleLongTextEnhancer(wrapper)({ value: "test" });
        ReactDOM.render(
            <EnhancerWithFormatter />,
            document.getElementById("container")
        );
        expect(document.getElementById("container").innerHTML).toExist();
        expect(document.getElementsByTagName('span').length).toEqual(2);
        expect(document.getElementsByTagName('span')[1].innerHTML).toExist();
    });
});
