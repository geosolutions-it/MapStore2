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
const TEST_ITEMS = [{ id: '1', start: new Date(0), end: new Date(0), type: 'point', content: '' }, { id: '2', start: new Date(970821881894), end: new Date(970821881894), type: 'point', content: '' }];
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
        const reComp = ReactDOM.render(<Timeline currentTime="2016-02-24T12:00:00.000Z" rangechangedHandler={actions.rangeChange} collapse={false} items={TEST_ITEMS}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(reComp).toExist();
        const point = document.querySelector('.vis-point');
        expect(point).toExist();
    });
    it('test TimelineComponent readOnly', () => {
        ReactDOM.render(<Timeline readOnly />, document.getElementById("container"));
        expect(document.querySelector('.read-only-timeline')).toExist();
        // TODO: test cursor not dragging
    });
    it('test range items rendered correctly', () => {
        const CURRENT_TIME = "2016-02-24T12:00:00.000Z";
        const actions = {
            rangeChange: () => { }
        };
        const comp = ReactDOM.render(<Timeline currentTime={CURRENT_TIME} rangeItems={[{ id: 'RANGE_1', start: new Date("2016-01-00T00:00:00.000Z"), end: new Date("2017-01-00T00:00:00.000Z"), className: 'ms-current-range', type: 'background'}]} rangechangedHandler={actions.rangeChange} collapse={false} items={TEST_ITEMS} />, document.getElementById("container"));
        expect(comp).toExist();

        const rangeItem = document.querySelector('.ms-current-range');
        expect(rangeItem).toExist();
    });
    it('re-rendering rangeItems do not change current items (optimization)', () => {
        const CURRENT_TIME = "2016-02-24T12:00:00.000Z";
        const RANGE_STATE_1 = [{ id: 'RANGE_1', start: new Date("2016-01-01T00:00:00.000Z"), end: new Date("2017-01-01T00:00:00.000Z"), type: 'background', className: "TEST_RANGE"}];
        const RANGE_STATE_2 = [{ id: 'RANGE_1', start: new Date("2015-01-01T00:00:00.000Z"), end: new Date("2016-01-01T00:00:00.000Z"), type: 'background', className: "TEST_RANGE"}];
        const actions = {
            rangeChange: () => { }
        };

        ReactDOM.render(<Timeline currentTime={CURRENT_TIME} rangeItems={RANGE_STATE_1} rangechangedHandler={actions.rangeChange} collapse={false} items={TEST_ITEMS} />, document.getElementById("container"));
        const point1 = document.querySelector('.vis-point');
        // expect(point0).toBe(point1);
        expect(document.querySelector('.TEST_RANGE')).toExist();
        ReactDOM.render(<Timeline currentTime={CURRENT_TIME} rangeItems={RANGE_STATE_2} rangechangedHandler={actions.rangeChange} collapse={false} items={TEST_ITEMS} />, document.getElementById("container"));
        const point2 = document.querySelector('.vis-point');
        expect(point1).toBe(point2); // change the range items do not change other items
        expect(document.querySelector('.TEST_RANGE')).toExist();
        // remove range
        ReactDOM.render(<Timeline currentTime={CURRENT_TIME} rangechangedHandler={actions.rangeChange} collapse={false} items={TEST_ITEMS} />, document.getElementById("container"));
        expect(document.querySelector('.TEST_RANGE')).toNotExist();
        const point3 = document.querySelector('.vis-point');
        expect(point1).toBe(point3); // change the range items do not change other items
        // add range
        ReactDOM.render(<Timeline currentTime={CURRENT_TIME} rangeItems={RANGE_STATE_1} rangechangedHandler={actions.rangeChange} collapse={false} items={TEST_ITEMS} />, document.getElementById("container"));
        expect(document.querySelector('.TEST_RANGE')).toExist();

    });


});
