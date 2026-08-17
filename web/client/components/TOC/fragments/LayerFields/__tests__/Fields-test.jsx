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
        expect(el.classList.contains('layer-fields-with-settings')).toBe(false);
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
    it('optionally renders visibility controls', () => {
        const actions = {
            onChange: () => {}
        };
        const spy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(
            <Fields
                fields={[...TEST_FIELDS, {name: 'hidden', type: 'string', visible: false}]}
                onChange={actions.onChange}
                showVisibility/>,
            document.getElementById('container')
        );
        const container = document.getElementById('container');
        expect(container.querySelector('.layer-fields-toolbar')).toExist();
        const visibilityInputs = container.querySelectorAll('.layer-fields-row .layer-field-visibility input');
        expect(visibilityInputs.length).toBe(3);
        expect(visibilityInputs[0].checked).toBe(true);
        expect(visibilityInputs[2].checked).toBe(false);

        Simulate.change(visibilityInputs[2], {target: {checked: true}});
        expect(spy).toHaveBeenCalledWith('hidden', 'visible', true);
    });
    it('toggles every attribute with the header checkbox', () => {
        const actions = {
            onChangeAll: () => {}
        };
        const spy = expect.spyOn(actions, 'onChangeAll');
        const container = document.getElementById('container');
        const render = (fields) => ReactDOM.render(
            <Fields fields={fields} onChangeAll={actions.onChangeAll} showVisibility/>,
            container
        );
        const headerCheckbox = () => container.querySelector('.layer-fields-row-header .layer-field-visibility input');

        render([{name: 'a', type: 'string', visible: true}, {name: 'b', type: 'string', visible: true}]);
        expect(headerCheckbox().checked).toBe(true);
        expect(headerCheckbox().indeterminate).toBe(false);

        render([{name: 'a', type: 'string', visible: true}, {name: 'b', type: 'string', visible: false}]);
        expect(headerCheckbox().checked).toBe(false);
        expect(headerCheckbox().indeterminate).toBe(true);

        render([{name: 'a', type: 'string', visible: false}, {name: 'b', type: 'string', visible: false}]);
        expect(headerCheckbox().checked).toBe(false);
        expect(headerCheckbox().indeterminate).toBe(false);

        Simulate.change(headerCheckbox(), {target: {checked: true}});
        expect(spy).toHaveBeenCalledWith('visible', true);
    });
    it('shows display settings only after clicking the field settings button', () => {
        ReactDOM.render(
            <Fields
                fields={[{name: 'image', type: 'string'}, {name: 'mimeType', type: 'string'}]}
                showFieldSettings/>,
            document.getElementById('container')
        );
        const container = document.getElementById('container');
        expect(container.querySelector('.layer-field-settings-panel')).toNotExist();
        const settingsButtons = container.querySelectorAll('.layer-field-settings-button');
        expect(settingsButtons.length).toBe(2);
        Simulate.click(settingsButtons[0]);
        expect(container.querySelector('.layer-field-settings-panel')).toExist();
        Simulate.click(settingsButtons[0]);
        expect(container.querySelector('.layer-field-settings-panel')).toNotExist();
    });
    it('allows selecting the feature attribute containing the media type', () => {
        const actions = { onChange: () => {} };
        const spy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(
            <Fields
                fields={[
                    {name: 'media', type: 'string', displayType: 'media'},
                    {name: 'mimeType', alias: {'default': 'MIME type', 'it-IT': 'Tipo MIME'}, type: 'string'},
                    {name: 'title', type: 'string'}
                ]}
                currentLocale="it-IT"
                onChange={actions.onChange}
                showFieldSettings/>,
            document.getElementById('container')
        );
        const settingsButton = document.querySelector('.layer-field-settings-button');
        expect(document.querySelector('.layer-fields').classList.contains('layer-fields-with-settings')).toBe(true);
        Simulate.click(settingsButton);
        const mediaTypeSelect = document.querySelectorAll('.layer-field-settings-panel .Select-control')[1];
        expect(mediaTypeSelect).toBeTruthy();
        Simulate.keyDown(mediaTypeSelect, { key: 'ArrowDown', keyCode: 40 });
        const options = document.querySelectorAll('.Select-option');
        expect(options.length).toBe(2);
        expect(options[0].textContent).toBe('Tipo MIME');
        Simulate.mouseDown(options[0]);
        expect(spy.calls[0].arguments).toEqual(['media', 'mediaTypeAttribute', 'mimeType']);
        spy.restore();
    });
});
