/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import NullManagement from '../NullManagement';

describe('NullManagement component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Renders with default strategy', () => {
        const options = [
            { value: "STATE_NAME", label: "State Name", type: "string" },
            { value: "POPULATION", label: "Population", type: "int" }
        ];
        const data = {
            options: {
                groupByAttributes: "STATE_NAME"
            }
        };

        ReactDOM.render(
            <NullManagement
                data={data}
                options={options}
                onChange={() => {}}
            />,
            document.getElementById("container")
        );

        const container = document.getElementById('container');
        const caption = container.querySelector('.ms-wizard-form-caption');
        expect(caption).toExist();

        // Check that placeholder input is NOT visible (default strategy)
        const placeholderFormGroup = container.querySelector('#placeholderForNullGroupByField');
        expect(placeholderFormGroup).toNotExist();
    });

    it('Strategy change to placeholder triggers onChange', () => {
        const actions = {
            onChange: () => {}
        };
        const spyOnChange = expect.spyOn(actions, 'onChange');

        const options = [
            { value: "STATE_NAME", label: "State Name", type: "string" }
        ];
        const data = {
            options: {
                groupByAttributes: "STATE_NAME",
                nullHandling: {
                    groupByAttributes: {
                        strategy: "default"
                    }
                }
            }
        };

        ReactDOM.render(
            <NullManagement
                data={data}
                options={options}
                onChange={actions.onChange}
            />,
            document.getElementById("container")
        );

        const container = document.getElementById('container');
        // Find the Select component's input
        const selectInputs = container.querySelectorAll('.Select-input input');
        expect(selectInputs.length).toBeGreaterThan(0);

        // Simulate selecting "placeholder" option
        const selectInput = selectInputs[0];
        ReactTestUtils.Simulate.change(selectInput, { target: { value: 'placeholder' } });
        ReactTestUtils.Simulate.keyDown(selectInput, { keyCode: 9, key: 'Tab' });

        // Verify onChange was called for strategy
        expect(spyOnChange).toHaveBeenCalled();
        // two calls
        expect(spyOnChange.calls.length).toBe(2); // for strategy and placeholder value update
        const strategyCalls = spyOnChange.calls.filter(call =>
            call.arguments[0] === "options.nullHandling.groupByAttributes.strategy"
        );
        expect(strategyCalls.length).toBeGreaterThan(0);
    });


    it('type detection from groupByFieldOptions works correctly', () => {
        const options = [
            { value: "STATE_NAME", label: "State Name", type: "string" },
            { value: "POPULATION", label: "Population", type: "int" },
            { value: "TIMESTAMP", label: "Timestamp", type: "time" }
        ];
        const data = {
            options: {
                groupByAttributes: "POPULATION",
                nullHandling: {
                    groupByAttributes: {
                        strategy: "placeholder",
                        placeholder: 0
                    }
                }
            }
        };

        ReactDOM.render(
            <NullManagement
                data={data}
                options={options}
                onChange={() => {}}
            />,
            document.getElementById("container")
        );

        const container = document.getElementById('container');
        const placeholderFormGroup = container.querySelector('#placeholderForNullGroupByField');
        expect(placeholderFormGroup).toExist();

        // Should render number input for int type
        const numberInput = placeholderFormGroup.querySelector('input[type="number"]');
        expect(numberInput).toExist();
        expect(numberInput.value).toBe('0');
    });
});

