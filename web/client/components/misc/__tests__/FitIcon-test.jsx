/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const FitIcon = require('../FitIcon');
describe('FitIcon component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container" style="width: 100px; height: 50px"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('FitIcon rendering with defaults', () => {
        ReactDOM.render(<FitIcon />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.glyphicon');
        expect(el).toExist();
        expect(el.style.fontSize).toBe("100px");
    });
    it('FitIcon rendering with iconFit', () => {
        ReactDOM.render(<FitIcon iconFit/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.glyphicon');
        expect(el).toExist();
        expect(el.style.fontSize).toBe("50px");
    });
    it('FitIcon rendering with padding and margin', () => {
        ReactDOM.render(<FitIcon iconFit padding="2" margin="1"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.glyphicon');
        expect(el).toExist();
        expect(el.style.fontSize).toBe("44px");
        expect(el.style.padding).toBe("2px");
        expect(el.style.margin).toBe("1px");
    });
});
