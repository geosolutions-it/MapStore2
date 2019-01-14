/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Timeline = require('../TimelineComponent');
const expect = require('expect');

describe('test TimelineComponent module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test TimelineComponent creation', () => {
        const comp = ReactDOM.render(<Timeline />, document.getElementById("container"));
        expect(comp).toExist();

    });
    it('test TimelineComponent re-rendering on props change', () => {
        const actions = {
            rangeChange: () => { }
        };
        const comp = ReactDOM.render(<Timeline currentTime="2016-02-24T12:00:00.000Z" rangechangedHandler={actions.rangeChange} />, document.getElementById("container"));
        const reComp = ReactDOM.render(<Timeline currentTime="2016-02-24T12:00:00.000Z" rangechangedHandler={actions.rangeChange} collapse = {false} items= {[ {id: '1', start: new Date(0), end: new Date(0), type: 'point', content: ''}, {id: '2', start: new Date(970821881894), end: new Date(970821881894), type: 'point', content: ''}] }/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(reComp).toExist();
        const point = document.querySelector('.vis-point');
        expect(point).toExist();
    });

});
