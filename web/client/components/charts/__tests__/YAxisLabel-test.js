/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import YAxisLabel from '../YAxisLabel';

describe('YAxisLabel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('YAxisLabel rendering with defaults', () => {
        ReactDOM.render(<YAxisLabel />, document.getElementById("container"));
        const container = document.getElementById('container');
        const text = container.querySelector('text');
        expect(text).toExist();
    });

    it('YAxisLabel rendering with a big number as label', () => {
        ReactDOM.render(<YAxisLabel payload={{value: 123456789}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const text = container.querySelector('text');
        expect(text).toExist();
        expect(text.innerText).toBe("123.5 M");
    });

    it('YAxisLabel rendering with a small number as label', () => {
        ReactDOM.render(<YAxisLabel payload={{value: 1234}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const text = container.querySelector('text');
        expect(text).toExist();
        expect(text.innerText).toBe("1.2 K");
    });

    it('YAxisLabel rendering with a string as label', () => {
        ReactDOM.render(<YAxisLabel payload={{value: "123456789"}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const text = container.querySelector('text');
        expect(text).toExist();
        expect(text.innerText).toBe("123456789");
    });
});
