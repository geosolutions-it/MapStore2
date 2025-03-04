import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import Fields from '../Fields';
import { Simulate, act } from 'react-dom/test-utils';
const TEST_FIELDS = [{name: "field1", type: "string"}, {name: "field2", alias: "alias", type: "number"}];
describe('TOC Settings - Fields component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults', () => {
        ReactDOM.render(<Fields />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.layer-fields');
        expect(el).toBeTruthy();
    });
    it('rendering fields', () => {
        const actions = {
            onChange: () => {}
        };
        const spy = expect.spyOn(actions, 'onChange');
        act(() => {
            ReactDOM.render(<Fields fields={TEST_FIELDS} onChange={actions.onChange}/>, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        const el = container.querySelector('.layer-fields');
        expect(el).toBeTruthy();
        const header = container.querySelectorAll('.layer-fields-row-header');
        expect(header.length).toBe(1);
        const rows = container.querySelectorAll('.ms2-border-layout-body .layer-fields-row');
        expect(rows.length).toBe(2);
        rows.forEach((row, index) => {
            const nameInput = row.querySelector('.layer-field-name input');
            expect(nameInput).toBeTruthy();
            expect(nameInput.value).toBe(TEST_FIELDS[index].name);
            expect(nameInput.disabled).toBe(true);
            const aliasInput = row.querySelector('.layer-field-alias input');
            expect(aliasInput).toBeTruthy();
            expect(aliasInput.value).toBe(TEST_FIELDS[index].alias ?? '');
            expect(aliasInput.disabled).toBe(false);
            const typeInput = row.querySelector('.layer-field-type input');
            expect(typeInput).toBeTruthy();
            expect(typeInput.value).toBe(TEST_FIELDS[index].type);
            expect(typeInput.disabled).toBe(true);
        });
        // test alias change
        const aliasInput = rows[1].querySelector('.layer-field-alias input');
        aliasInput.value = 'new alias';
        Simulate.change(aliasInput);
        expect(spy.calls[0].arguments[0]).toBe('field2');
        expect(spy.calls[0].arguments[1]).toBe('alias');
        expect(spy.calls[0].arguments[2]).toBe('new alias');

    });
    it('test loading', () => {
        ReactDOM.render(<Fields loading fields={TEST_FIELDS}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.layer-fields');
        expect(el).toBeTruthy();
        const loading = container.querySelector('.layer-fields-footer .layer-field-loading');
        expect(loading).toBeTruthy();
        // fields are disabled
        const rows = container.querySelectorAll('.ms2-border-layout-body .layer-fields-row');
        expect(rows.length).toBe(2);
        // disabled toolbar buttons
        const buttons = container.querySelectorAll('.layer-fields-toolbar button');
        expect(buttons.length).toBe(2);
        buttons.forEach((button) => {

            expect(button.disabled
                // this workarounds the buttonWithDisabled enhancer.
                || Array.from(button.classList).includes('disabled')).toBe(true);
        });
        rows.forEach((row) => {
            const nameInput = row.querySelector('.layer-field-name input');
            expect(nameInput).toBeTruthy();
            expect(nameInput.disabled).toBe(true);
            const aliasInput = row.querySelector('.layer-field-alias input');
            expect(aliasInput).toBeTruthy();
            expect(aliasInput.disabled).toBe(true);
            const typeInput = row.querySelector('.layer-field-type input');
            expect(typeInput).toBeTruthy();
            expect(typeInput.disabled).toBe(true);
        });
    });
    it('test error', () => {
        ReactDOM.render(<Fields error fields={TEST_FIELDS}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.layer-fields');
        expect(el).toBeTruthy();
        const error = container.querySelector('.layer-fields-footer .layer-fields-error');
        expect(error).toBeTruthy();
    });
    it('test onLoadFields and onClear handlers', () => {
        const actions = {
            onLoadFields: () => {},
            onClear: () => {}
        };
        const spy = expect.spyOn(actions, 'onLoadFields');
        const spy2 = expect.spyOn(actions, 'onClear');
        ReactDOM.render(<Fields
            fields={TEST_FIELDS}
            onClear={actions.onClear}
            onLoadFields={actions.onLoadFields}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.layer-fields-toolbar button');
        expect(el.length).toBe(2);
        const loadButton = el[0];
        expect(loadButton).toBeTruthy();
        loadButton.click();
        expect(spy.calls.length).toBe(1);
        spy.restore();
        const clearButton = el[1];
        expect(clearButton).toBeTruthy();
        clearButton.click();
        // Find and click confirm button in the new dialog structure
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toBeTruthy();
        const buttons = dialog.querySelectorAll('.btn');
        expect(buttons.length).toBe(2);
        // Click the confirm button (second button)
        const confirmButton = buttons[1];
        expect(confirmButton).toBeTruthy();
        Simulate.click(confirmButton);
        expect(spy2.calls.length).toBe(1);
        spy2.restore();
    });
    it('Fields of type geometry are not listed', () => {
        const fields = [{name: "field1", type: "string"}, {name: "field2", alias: "alias", type: "number"}, {name: "geometry", type: "MultiPolygon"}];
        ReactDOM.render(<Fields fields={fields}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const rows = container.querySelectorAll('.ms2-border-layout-body .layer-fields-row');
        expect(rows.length).toBe(2);
    });
});
