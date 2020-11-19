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
import ColorMap from '../ColorMapGrid';

describe("Test the ColorMap component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        const cmp = ReactDOM.render(<ColorMap />, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates component with element', (done) => {
        const cmp = ReactDOM.render(<ColorMap entries={[{color: '#9013fe', quantity: 0, label: 'label'}]}/>, document.getElementById("container"));
        expect(cmp).toExist();
        cmp.selectEntry({node: {childIndex: 0}});
        setTimeout(() => {
            cmp.valueChanged();
            done();
        }, 0);
    });

});
