import React from 'react';
import ReactDOM from 'react-dom';
// import moment from 'moment';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import Hours from '../Hours';

describe('Hours component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Hours rendering with defaults', () => {
        ReactDOM.render(<Hours />, document.getElementById("container"));
        const container = document.getElementById('container');
        const hour = container.querySelector('.rw-list-option');
        expect(hour).toExist();
    });

    it('Hours call on select when mouse click time', () => {
        const actions = {
            onSelect: () => {}
        };
        const spyOnSelect = expect.spyOn(actions, 'onSelect');
        ReactDOM.render(<Hours {...actions} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const hour = container.querySelector('.rw-list-option');
        TestUtils.Simulate.click(hour);
        expect(spyOnSelect).toHaveBeenCalled();
    });

    it('Hours call on select on enter key press', () => {
        const actions = {
            onSelect: () => {}
        };
        let timeRef;
        const spyOnSelect = expect.spyOn(actions, 'onSelect');
        const handleKeyDown = (event) => {
            timeRef.handleKeyDown(event);
        };
        ReactDOM.render(<div onKeyDown={handleKeyDown}><Hours {...actions} ref={ref => {timeRef = ref;}} /></div>, document.getElementById("container"));

        const container = document.getElementById('container');
        const hour = container.querySelector('.rw-list-option');
        TestUtils.Simulate.keyDown(hour, {key: 'ArrowDown'});
        TestUtils.Simulate.keyDown(hour, {key: 'Enter'});
        expect(spyOnSelect).toHaveBeenCalled();
    });
});
