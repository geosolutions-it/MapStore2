
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import QuickTimeSelectors from '../QuickTimeSelectors';
import { DATE_TYPE } from '../../../../utils/FeatureGridUtils';

const quickTimeSelectors = [
    {
        "type": DATE_TYPE.DATE,
        "value": "{today}+P0D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.today"
    },
    {
        "type": DATE_TYPE.DATE,
        "value": "{today}-P1D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.yesterday"
    }
];

describe('QuickTimeSelectors component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('QuickTimeSelectors rendering with defaults', () => {
        ReactDOM.render(<QuickTimeSelectors />, document.getElementById("container"));
        const container = document.getElementById('container');
        const quickTimeSelector = container.querySelector('.quick-time-selector');
        expect(quickTimeSelector).toBeFalsy();
    });
    it('QuickTimeSelectors rendering with quickDateTimeSelectors', () => {
        ReactDOM.render(<QuickTimeSelectors quickDateTimeSelectors={quickTimeSelectors} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const quickTimeSelector = container.querySelector('.quick-time-selector');
        const buttons = container.querySelectorAll('.quick-time-selector .selector-btn');
        expect(quickTimeSelector).toBeTruthy();
        expect(buttons.length).toBe(2);
    });
    it('QuickTimeSelectors onChange date', (done) => {
        const action = {
            onChangeDate: (date) => {
                expect(date).toBeTruthy();
                done();
            }
        };
        ReactDOM.render(<QuickTimeSelectors
            onChangeDate={action.onChangeDate}
            quickDateTimeSelectors={quickTimeSelectors}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const quickTimeSelector = container.querySelector('.quick-time-selector');
        const buttons = container.querySelectorAll('.quick-time-selector .selector-btn');
        expect(quickTimeSelector).toBeTruthy();
        expect(buttons.length).toBe(2);
        TestUtils.Simulate.click(buttons[0]);

    });
    it('QuickTimeSelectors onChange date-time', (done) => {
        const action = {
            onChangeDate: (date) => {
                expect(date).toBeTruthy();
                done();
            },
            onChangeTime: (time) => {
                expect(time.date).toBeTruthy();
                done();
            }
        };
        ReactDOM.render(<QuickTimeSelectors
            onChangeTime={action.onChangeTime}
            onChangeDate={action.onChangeDate}
            type={DATE_TYPE.DATE_TIME}
            quickDateTimeSelectors={quickTimeSelectors}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const quickTimeSelector = container.querySelector('.quick-time-selector');
        const buttons = container.querySelectorAll('.quick-time-selector .selector-btn');
        expect(quickTimeSelector).toBeTruthy();
        expect(buttons.length).toBe(2);
        TestUtils.Simulate.click(buttons[0]);
    });
});
