/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import ScaleDenominator from '../ScaleDenominator';

describe('ScaleDenominator', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('create component with defaults', () => {
        const sb = ReactDOM.render(<ScaleDenominator minValue={1000} maxValue={10000}/>, document.getElementById("container"));
        expect(sb).toExist();
        const domNode = ReactDOM.findDOMNode(sb);
        expect(domNode).toExist();

        const comboItems = sb.scales;
        expect(comboItems.length).toBe(23);
        sb.onChange("minDenominator", {value: 1000});
        sb.onChange("minDenominator", {value: 100000});
        sb.onChange("maxDenominator", {value: 100});
    });
});
