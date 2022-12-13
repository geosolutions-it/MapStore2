import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Simulate, act, scryRenderedComponentsWithType } from 'react-dom/test-utils';

import {MultiValueSelect, DateControl} from '../AttributeControls';

describe('User and Groups - AttributeControls', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DateControl', () => {
        const format = 'YYYY-MM-DD';
        const value = '2019-01-01';
        const getInput = () => document.querySelector('#container input');
        const handlers = {
            onChange: () => {}
        };
        expect.spyOn(handlers, 'onChange');
        act(() => {
            ReactDOM.render(<DateControl format={format} value={value} onChange={handlers.onChange}/>, document.getElementById('container'));
        });
        expect(getInput().value).toBe(value);
        act(() => {
            Simulate.change(getInput(), { bubbles: true });
            getInput().value = '2019-01-04';
            getInput().dispatchEvent(new Event('blur', { bubbles: true}));
        });
        expect(handlers.onChange).toHaveBeenCalled();
        expect(handlers.onChange.calls[0].arguments[0]).toBe('2019-01-04');
    });
    /*
    it.only('MultiValueSelect', () => {
        const options = [
            {value: '1', label: 'one'},
            {value: '2', label: 'two'},
            {value: '3', label: 'three'}
        ];
        const value = ['1', '2'];
        let cmp;
        const handlers = {
            onChange: () => {}
        };
        expect.spyOn(handlers, 'onChange');
        act(() => {
            cmp = ReactDOM.render(<MultiValueSelect options={options} value={value} onChange={handlers.onChange}/>, document.getElementById('container'));
        }
        );
        const select = document.querySelector('#container .Select');
        expect(select).toExist();
        const values = scryRenderedComponentsWithType(cmp, MultiValueSelect);
        expect(values.length).toBe(1);
        expect(values[0].props.value).toEqual(value);
        expect(values[0].props.options).toEqual(options);
        act(() => {
            Simulate.click(select);
        }
        );
        const optionsList = document.querySelector('#container .Select-menu-outer');
        expect(optionsList).toExist();
        const optionsItems = optionsList.querySelectorAll('.Select-option');
        expect(optionsItems.length).toBe(options.length);
        act(() => {
            Simulate.click(optionsItems[2]);
        }
        );
        expect(handlers.onChange).toHaveBeenCalled();
        expect(handlers.onChange.calls[0].arguments[0]).toEqual(['1', '2', '3']);

    });
    */
});
