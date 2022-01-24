/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {get} from 'lodash';
import describeStates from '../../../../../../test-resources/wfs/describe-states.json';
import { CLASSIFICATION, DEFAULT_CUSTOM_COLOR, DEFAULT_CUSTOM_LABEL, TEST_LAYER, UNCLASSIFIED_VALUE_CLASSIFICATION, EMPTY_VALUE_CLASSIFICATION } from '../../chart/__tests__/sample_data';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import wfsChartOptions from '../wfsChartOptions';
import BasePanel from '../WPSWidgetOptions';
const WPSWidgetOptions = wfsChartOptions(BasePanel);
describe('WPSWidgetOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('WPSWidgetOptions rendering with defaults', () => {
        ReactDOM.render(<WPSWidgetOptions />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.chart-options-form');
        expect(el).toExist();
    });
    it('Test WPSWidgetOptions onChange for chart context, WPS gs:Aggregate available', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions hasAggregateProcess featureTypeProperties={get(describeStates, "featureTypes[0].properties")} data={{ type: 'bar' }} onChange={actions.onChange} dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(5); // operation is visible
        // simulate change with tab (for react-select)
        ReactTestUtils.Simulate.change(inputs[0], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[0], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("options.groupByAttributes");
        expect(spyonChange.calls[0].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("options.aggregationAttribute");
        expect(spyonChange.calls[1].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[2], { target: { value: 'Count' } });
        ReactTestUtils.Simulate.keyDown(inputs[2], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[2].arguments[0]).toBe("options.aggregateFunction");
        expect(spyonChange.calls[2].arguments[1]).toBe("Count");

        ReactTestUtils.Simulate.change(inputs[4]);
        expect(spyonChange.calls[3].arguments[0]).toBe("legend");
        expect(spyonChange.calls[3].arguments[1]).toBe(true);
    });
    it('Test WPSWidgetOptions onChange for chart context, WPS not available', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions featureTypeProperties={get(describeStates, "featureTypes[0].properties")} data={{ type: 'bar' }} onChange={actions.onChange} dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(4); // operation is not visible
        // simulate change with tab (for react-select)
        ReactTestUtils.Simulate.change(inputs[0], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[0], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("options.groupByAttributes");
        expect(spyonChange.calls[0].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("options.aggregationAttribute");
        expect(spyonChange.calls[1].arguments[1]).toBe("STATE_NAME");


        ReactTestUtils.Simulate.change(inputs[3]);
        expect(spyonChange.calls[2].arguments[0]).toBe("legend");
        expect(spyonChange.calls[2].arguments[1]).toBe(true);
    });
    it('Test WPSWidgetOptions onChange for color classifications on save', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions
            hasAggregateProcess
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            data={{
                type: 'bar',
                autoColorOptions: {
                    classification: CLASSIFICATION,
                    name: 'global.colors.custom'
                },
                options: {
                    classificationAttribute: 'class2'
                }
            }}
            onChange={actions.onChange}
            dependencies={{ viewport: {} }}
            layer={TEST_LAYER}/>,
        document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(5); // operation is visible

        ReactTestUtils.Simulate.change(inputs[3], { target: { value: 'Custom' } });
        ReactTestUtils.Simulate.keyDown(inputs[3], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("autoColorOptions");
        expect(spyonChange.calls[0].arguments[1].name).toBe("global.colors.custom");
        const customColorsSettingsButton = document.getElementsByClassName('custom-color-btn')[0];
        expect(customColorsSettingsButton).toExist();
        ReactTestUtils.Simulate.click(customColorsSettingsButton);
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        expect(colorClassMd).toExist();
        const colorClassMdSaveButton = colorClassMd.getElementsByClassName('btn-save')[0];
        ReactTestUtils.Simulate.click(colorClassMdSaveButton);
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[1].arguments[0]).toBe('autoColorOptions.defaultCustomColor');
        expect(spyonChange.calls[1].arguments[1]).toBe(DEFAULT_CUSTOM_COLOR[0]);

        expect(spyonChange.calls[2].arguments[0]).toBe('options.classificationAttribute');
        expect(spyonChange.calls[2].arguments[1]).toBe('class2');

        expect(spyonChange.calls[3].arguments[0]).toBe('autoColorOptions');
        expect(spyonChange.calls[3].arguments[1]).toEqual({
            classification: CLASSIFICATION,
            defaultClassLabel: DEFAULT_CUSTOM_LABEL[2],
            name: 'global.colors.custom'
        });
        const colorClassMdBody = document.getElementsByClassName('ms-modal-body')[0];
        expect(colorClassMdBody).toNotExist();
    });
    it('Test WPSWidgetOptions onChange for color classifications on discard empty values', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions
            hasAggregateProcess
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            data={{
                type: 'bar',
                autoColorOptions: {
                    classification: UNCLASSIFIED_VALUE_CLASSIFICATION,
                    name: 'global.colors.custom'
                },
                options: {
                    classificationAttribute: 'class2'
                }
            }}
            onChange={actions.onChange}
            dependencies={{ viewport: {} }}
            layer={TEST_LAYER}/>,
        document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(5); // operation is visible

        ReactTestUtils.Simulate.change(inputs[3], { target: { value: 'Custom' } });
        ReactTestUtils.Simulate.keyDown(inputs[3], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("autoColorOptions");
        expect(spyonChange.calls[0].arguments[1].name).toBe("global.colors.custom");
        const customColorsSettingsButton = document.getElementsByClassName('custom-color-btn')[0];
        expect(customColorsSettingsButton).toExist();
        ReactTestUtils.Simulate.click(customColorsSettingsButton);
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        expect(colorClassMd).toExist();
        const colorClassMdCloseButton = colorClassMd.getElementsByClassName('btn-cancel')[0];
        ReactTestUtils.Simulate.click(colorClassMdCloseButton);
        const colorClassConfirmMd = document.getElementsByClassName('modal-dialog')[1];
        expect(colorClassConfirmMd).toExist();
        expect(colorClassConfirmMd.getElementsByClassName('modal-body')[0]
            .getElementsByTagName('span')[0].textContent)
            .toBe('widgets.builder.wizard.classAttributes.confirmModalMessage');
        const confirmBtn = document.getElementsByClassName('modal-footer')[1].getElementsByClassName('btn-primary')[0];
        const cancelBtn = document.getElementsByClassName('modal-footer')[1].getElementsByClassName('btn-default')[0];
        expect(confirmBtn).toExist();
        expect(cancelBtn).toExist();
        ReactTestUtils.Simulate.click(confirmBtn);
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[1].arguments[1]).toEqual(CLASSIFICATION);
    });

    it('Test WPSWidgetOptions onChange for color classifications on discard all empty values', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions
            hasAggregateProcess
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            data={{
                type: 'bar',
                autoColorOptions: {
                    classification: EMPTY_VALUE_CLASSIFICATION,
                    name: 'global.colors.custom'
                },
                options: {
                    classificationAttribute: 'class2'
                }
            }}
            onChange={actions.onChange}
            dependencies={{ viewport: {} }}
            layer={TEST_LAYER}/>,
        document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(5); // operation is visible

        ReactTestUtils.Simulate.change(inputs[3], { target: { value: 'Custom' } });
        ReactTestUtils.Simulate.keyDown(inputs[3], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("autoColorOptions");
        expect(spyonChange.calls[0].arguments[1].name).toBe("global.colors.custom");
        const customColorsSettingsButton = document.getElementsByClassName('custom-color-btn')[0];
        expect(customColorsSettingsButton).toExist();
        ReactTestUtils.Simulate.click(customColorsSettingsButton);
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        expect(colorClassMd).toExist();
        const colorClassMdCloseButton = colorClassMd.getElementsByClassName('btn-cancel')[0];
        ReactTestUtils.Simulate.click(colorClassMdCloseButton);
        const colorClassConfirmMd = document.getElementsByClassName('modal-dialog')[1];
        expect(colorClassConfirmMd).toExist();
        expect(colorClassConfirmMd.getElementsByClassName('modal-body')[0]
            .getElementsByTagName('span')[0].textContent)
            .toBe('widgets.builder.wizard.classAttributes.confirmModalMessage');
        const confirmBtn = document.getElementsByClassName('modal-footer')[1].getElementsByClassName('btn-primary')[0];
        const cancelBtn = document.getElementsByClassName('modal-footer')[1].getElementsByClassName('btn-default')[0];
        expect(confirmBtn).toExist();
        expect(cancelBtn).toExist();
        ReactTestUtils.Simulate.click(confirmBtn);
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[1].arguments[1]).toBe(undefined);
        expect(spyonChange.calls[2].arguments[1]).toExist();
        expect(spyonChange.calls[2].arguments[1].length).toBe(1);
    });

    it('Test WPSWidgetOptions onChange for color classifications on accept empty values', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions
            hasAggregateProcess
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            data={{
                type: 'bar',
                autoColorOptions: {
                    classification: UNCLASSIFIED_VALUE_CLASSIFICATION,
                    name: 'global.colors.custom'
                },
                options: {
                    classificationAttribute: 'class2'
                }
            }}
            onChange={actions.onChange}
            dependencies={{ viewport: {} }}
            layer={TEST_LAYER}/>,
        document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(5); // operation is visible

        ReactTestUtils.Simulate.change(inputs[3], { target: { value: 'Custom' } });
        ReactTestUtils.Simulate.keyDown(inputs[3], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("autoColorOptions");
        expect(spyonChange.calls[0].arguments[1].name).toBe("global.colors.custom");
        const customColorsSettingsButton = document.getElementsByClassName('custom-color-btn')[0];
        expect(customColorsSettingsButton).toExist();
        ReactTestUtils.Simulate.click(customColorsSettingsButton);
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        expect(colorClassMd).toExist();
        const colorClassMdCloseButton = colorClassMd.getElementsByClassName('btn-cancel')[0];
        ReactTestUtils.Simulate.click(colorClassMdCloseButton);
        const colorClassConfirmMd = document.getElementsByClassName('modal-dialog')[1];
        expect(colorClassConfirmMd).toExist();
        expect(colorClassConfirmMd.getElementsByClassName('modal-body')[0]
            .getElementsByTagName('span')[0].textContent)
            .toBe('widgets.builder.wizard.classAttributes.confirmModalMessage');
        const confirmBtn = document.getElementsByClassName('modal-footer')[1].getElementsByClassName('btn-primary')[0];
        const cancelBtn = document.getElementsByClassName('modal-footer')[1].getElementsByClassName('btn-default')[0];
        expect(confirmBtn).toExist();
        expect(cancelBtn).toExist();
        ReactTestUtils.Simulate.click(cancelBtn);
        expect(spyonChange.calls[1]).toNotExist();
        expect(colorClassConfirmMd).toExist();
    });
    it('Test WPSWidgetOptions onChange for counter context', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions hasAggregateProcess formOptions={{
            showColorRamp: false,
            showUom: true,
            showGroupBy: false,
            showLegend: false,
            advancedOptions: false
        }}
        featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
        onChange={actions.onChange} dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(3); // groupBy and legend not visible
        // simulate change with tab (for react-select)
        ReactTestUtils.Simulate.change(inputs[0], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[0], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("options.aggregationAttribute");
        expect(spyonChange.calls[0].arguments[1]).toBe("STATE_NAME");


        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'Count' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("options.aggregateFunction");
        expect(spyonChange.calls[1].arguments[1]).toBe("Count");

        ReactTestUtils.Simulate.change(inputs[2], { target: { value: 'test' } });
        expect(spyonChange.calls[2].arguments[0]).toBe("options.seriesOptions.[0].uom");
        expect(spyonChange.calls[2].arguments[1]).toBe("test");
    });
});
