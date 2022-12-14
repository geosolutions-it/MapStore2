import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Simulate, act } from 'react-dom/test-utils';

import controls, {CONTROL_TYPES, MultiValueSelect, RemoteSelect, DateControl} from '../AttributeControls';
import axios from '../../../../libs/ajax';

import MockAdapter from 'axios-mock-adapter';

let mockAxios;

describe('User and Groups - AttributeControls', () => {
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    describe('MultiValueSelect', () => {
        const simulateValueSelection = (value) => {
            const classSelectControl = document.getElementsByClassName('Select-control')[0];
            let input = classSelectControl.getElementsByTagName('input')[0];
            expect(input).toExist();
            input.value = value;
            Simulate.change(input);
            const classSelectInput = document.getElementsByClassName('Select-input')[0].childNodes[0];
            Simulate.keyDown(classSelectInput, { key: 'Enter', keyCode: 13 });
        };
        it('with single value', () => {
            const options = [
                {value: '1', label: 'one'},
                {value: '2', label: 'two'},
                {value: '3', label: 'three'}
            ];
            const value = ['1', '2'];
            const handlers = {
                onChange: () => {}
            };
            const spyonChange = expect.spyOn(handlers, 'onChange');
            act(() => {
                ReactDOM.render(<MultiValueSelect options={options} value={value} onChange={handlers.onChange}/>, document.getElementById('container'));

            });
            const select = document.querySelector('#container .Select');
            expect(select).toExist();
            simulateValueSelection(options[1].value);
            expect(spyonChange.calls[0].arguments[0]).toEqual(['2']);
            expect(spyonChange).toHaveBeenCalled();
            // select another value
            simulateValueSelection(options[0].value);
            expect(handlers.onChange.calls[1].arguments[0]).toEqual(['1']);

        });
        it('with multiple values', () => {
            const options = [
                {value: '1', label: 'one'},
                {value: '2', label: 'two'},
                {value: '3', label: 'three'}
            ];
            const value = ['1', '2'];
            const handlers = {
                onChange: () => {}
            };
            expect.spyOn(handlers, 'onChange');
            act(() => {
                ReactDOM.render(<MultiValueSelect options={options} value={value} onChange={handlers.onChange} isMulti multiAttribute />, document.getElementById('container'));

            });
            const select = document.querySelector('#container .Select');
            expect(select).toExist();
            simulateValueSelection(options[2].value);

            expect(handlers.onChange.calls[0].arguments[0]).toEqual(['1', '2', '3']);

        });
    });
    describe('RemoteSelect', () => {
        const source = {
            url: "https://sample.com/data",
            path: 'data',
            valueAttribute: "value",
            labelAttribute: "label"
        };
        const options = [
            {value: '1', label: 'one'},
            {value: '2', label: 'two'},
            {value: '3', label: 'three'}
        ];
        beforeEach(() => {
            mockAxios.onGet().reply(() => {
                return [200, {
                    data: options
                }];
            }
            );
        });
        const simulateValueSelection = (value) => {
            const classSelectControl = document.getElementsByClassName('Select-control')[0];
            let input = classSelectControl.getElementsByTagName('input')[0];
            expect(input).toExist();
            input.value = value;
            Simulate.change(input);
            const classSelectInput = document.getElementsByClassName('Select-input')[0].childNodes[0];
            Simulate.keyDown(classSelectInput, { key: 'Enter', keyCode: 13 });
        };
        it('with single value', (done) => {

            const value = ['1', '2'];
            const handlers = {
                onChange: () => { }
            };
            const spyonChange = expect.spyOn(handlers, 'onChange');
            act(() => {
                ReactDOM.render(<RemoteSelect source={source} value={value} onChange={handlers.onChange} />, document.getElementById('container'));
            });
            setTimeout(() => {
                const select = document.querySelector('#container .Select');
                expect(select).toExist();
                simulateValueSelection(options[1].value);
                expect(spyonChange.calls[0].arguments[0]).toEqual(['2']);
                expect(spyonChange).toHaveBeenCalled();
                simulateValueSelection(options[0].value);
                expect(handlers.onChange.calls[1].arguments[0]).toEqual(['1']);
                done();
            }, 0);

        });
        it('with multiple values', (done) => {
            const value = ['1', '2'];
            const handlers = {
                onChange: () => { }
            };
            expect.spyOn(handlers, 'onChange');
            act(() => {
                ReactDOM.render(<RemoteSelect source={source} value={value} onChange={handlers.onChange} isMulti multiAttribute />, document.getElementById('container'));

            });
            setTimeout(() => {
                const select = document.querySelector('#container .Select');
                expect(select).toExist();
                simulateValueSelection(options[2].value);
                expect(handlers.onChange.calls[0].arguments[0]).toEqual(['1', '2', '3']);
                done();
            }, 0);

        });
    });

    it('DateControl', () => {
        const format = 'YYYY-MM-DD';
        const value = '2019-01-01';
        const getInput = () => document.querySelector('#container input');
        const handlers = {
            onChange: () => { }
        };
        expect.spyOn(handlers, 'onChange');
        act(() => {
            ReactDOM.render(<DateControl format={format} value={value} onChange={handlers.onChange} />, document.getElementById('container'));
        });
        expect(getInput().value).toBe(value);
        act(() => {
            Simulate.change(getInput(), { bubbles: true });
            getInput().value = '2019-01-04';
            getInput().dispatchEvent(new Event('blur', { bubbles: true }));
        });
        expect(handlers.onChange).toHaveBeenCalled();
        expect(handlers.onChange.calls[0].arguments[0]).toBe('2019-01-04');
    });

    describe('AttributeControls', () => {
        const simulateSelectValueSelection = (value) => {
            const classSelectControl = document.getElementsByClassName('Select-control')[0];
            let input = classSelectControl.getElementsByTagName('input')[0];
            expect(input).toExist();
            input.value = value;
            Simulate.change(input);
            const classSelectInput = document.getElementsByClassName('Select-input')[0].childNodes[0];
            Simulate.keyDown(classSelectInput, { key: 'Enter', keyCode: 13 });
        };
        const CHANGE_VALUE_HANDLER = {
            [CONTROL_TYPES.STRING]: (value) => {
                const input = document.querySelector('#container input');
                expect(input).toExist();
                input.value = value;
                Simulate.change(input);
            },
            [CONTROL_TYPES.TEXT]: (value) => {
                const input = document.querySelector('#container textarea');
                expect(input).toExist();
                input.value = value;
                Simulate.change(input);
            },
            [CONTROL_TYPES.SELECT]: (value) => {
                simulateSelectValueSelection(value);
            },
            [CONTROL_TYPES.DATE]: (value) => {
                act(() => {
                    const input = document.querySelector('#container input');
                    Simulate.change(input, { bubbles: true });
                    input.value = value;
                    input.dispatchEvent(new Event('blur', { bubbles: true }));
                });
            }
        };
        const TEST_VALUES = {
            [CONTROL_TYPES.STRING]: 'test',
            [CONTROL_TYPES.TEXT]: 'test',
            [CONTROL_TYPES.SELECT]: 'test',
            [CONTROL_TYPES.DATE]: '2019-01-01'
        };
        const CONTROL_ATTRIBUTES = {
            [CONTROL_TYPES.STRING]: {},
            [CONTROL_TYPES.TEXT]: {},
            [CONTROL_TYPES.SELECT]: {
                options: [
                    { value: "test", label: "test" }, { value: "test2", label: "test2" }
                ]
            },
            [CONTROL_TYPES.DATE]: {
                format: 'YYYY-MM-DD'
            }
        };

        Object.keys(CONTROL_TYPES).forEach((key) => {
            const type = CONTROL_TYPES[key];
            it('with type ' + type, () => {
                const handlers = {
                    onChange: () => { }
                };
                expect.spyOn(handlers, 'onChange');
                act(() => {
                    const Control = controls[type];
                    ReactDOM.render(<Control value="test" controlAttributes={CONTROL_ATTRIBUTES[type]} onChange={handlers.onChange} />, document.getElementById('container'));
                });
                CHANGE_VALUE_HANDLER[type](TEST_VALUES[type]);
                expect(handlers.onChange).toHaveBeenCalled();
                expect(handlers.onChange.calls[0].arguments[0]).toBe(TEST_VALUES[type]);
            });
        });
    });
});
