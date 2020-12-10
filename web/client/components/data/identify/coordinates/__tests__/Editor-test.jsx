import expect from 'expect';
import {isEmpty} from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import Editor from '../Editor';

describe('Identify Coordinate Editor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Editor rendering with defaults', () => {
        ReactDOM.render(<Editor />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.coord-editor');
        expect(el).toExist();
    });
    it('Test Editor onChange correctly passed and argument mapping', () => {
        const actions = {
            onSubmit: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onSubmit');
        ReactDOM.render(<Editor onSubmit={actions.onSubmit} />, document.getElementById("container"));
        const button = document.querySelector('span > button');
        expect(button.classList.contains('disabled')).toBe(true);
        const latLonFields = document.querySelectorAll('input');
        ReactTestUtils.Simulate.focus(latLonFields[0]);
        ReactTestUtils.Simulate.change(latLonFields[0], { target: { value: 20} }); // <-- trigger event callback
        ReactTestUtils.Simulate.focus(latLonFields[1]);
        ReactTestUtils.Simulate.change(latLonFields[1], { target: { value: 10} }); // <-- trigger event callback
        expect(button.classList.contains('disabled')).toBe(false);
        ReactTestUtils.Simulate.click(button); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(isEmpty(spyonChange.calls[0].arguments[0])).toBe(false);
        expect(spyonChange.calls[0].arguments[0]).toContain({lat: "20", lon: "10"});
    });
    it('Test Editor onChangeFormat correctly passed', () => {
        const actions = {
            onChangeFormat: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChangeFormat');
        ReactDOM.render(<Editor onChangeFormat={actions.onChangeFormat} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector('a > span')); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
    });
});
