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

    it('handleLongTextEnhancer with defaults [with no formatter]', () => {
        const Enhancer = handleLongTextEnhancer();
        ReactDOM.render(
            <Enhancer value={"test12334567899999"} />,
            document.getElementById("container")
        );
        expect(document.getElementById("container").innerHTML).toExist();
        expect(document.getElementsByTagName('span').length).toEqual(2);
        expect(document.getElementsByTagName('span')[1].innerHTML).toExist();
    });

    it('handleLongTextEnhancer with formatter', () => {
        const EnhancerWithFormatter = handleLongTextEnhancer(StringFormatter);
        ReactDOM.render(
            <EnhancerWithFormatter value={"test12334567899999"} />,
            document.getElementById("container")
        );
        expect(document.getElementById("container").innerHTML).toExist();
        expect(document.getElementsByTagName('span').length).toEqual(2);
        expect(document.getElementsByTagName('span')[1].innerHTML).toExist();
    });
});
