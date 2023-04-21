import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import LocalizedInput from '../LocalizedInput';
import { Simulate, act } from 'react-dom/test-utils';
import { getSupportedLocales } from '../../../utils/LocaleUtils';


const openModal = (container) => {
    const el = container.querySelector('.input-group-addon > a');
    expect(el).toBeTruthy();
    act(() => {
        Simulate.click(el);
    });
};
const TEST_LOCALES = {it: {code: "it-IT", description: "Italiano"}, en: {code: "en-US", description: "English"}};
const closeModal = (dialog) => {
    dialog.querySelector('.modal-footer > button').click();
};
describe('LocalizedInput component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Rendering with defaults', () => {
        ReactDOM.render(<LocalizedInput />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
    });
    it('Rendering with value', () => {
        ReactDOM.render(<LocalizedInput value="test" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        expect(el.value).toBe('test');
    });
    it('Rendering with value as object', () => {
        ReactDOM.render(<LocalizedInput value={{"default": "test"}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        expect(el.value).toBe('test');
    });
    it('Rendering with value as object and currentLocale, showCurrent = false', () => {
        ReactDOM.render(<LocalizedInput value={{"default": "test", "it-IT": "test"}} currentLocale="it-IT" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        expect(el.value).toBe('test');
        expect(document.querySelectorAll('.input-group-addon').length).toBe(1); // only the default button
    });
    it('Rendering with value as object and currentLocale showCurrent = true', () => {
        ReactDOM.render(<LocalizedInput value={{"default": "test", "it-IT": "test2"}} currentLocale="it-IT" showCurrent/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        expect(el.value).toBe('test2');
        expect(document.querySelectorAll('.input-group-addon').length).toBe(2); // button and current locale flag
    });
    it('Rendering with value as object and currentLocale not found', () => {
        ReactDOM.render(<LocalizedInput value={{"default": "test", "it-IT": "test2"}} currentLocale="en-US" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        expect(el.value).toBe('test');
    });
    it('Rendering with value as object and currentLocale not found and no default', () => {
        ReactDOM.render(<LocalizedInput value={{"it-IT": "test2"}} currentLocale="en-US" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        expect(el.value).toBe('');
    });

    it('Rendering with value as object and currentLocale not found and no default and no translations', () => {
        ReactDOM.render(<LocalizedInput value={{}} currentLocale="en-US" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        expect(el.value).toBe('');
    });
    it('Handling onChange with normal string', () => {
        const actions = {
            onChange: () => {}
        };
        const spy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<LocalizedInput onChange={actions.onChange} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        act(() => {
            el.value = 'test2';
            Simulate.change(el, { target: { value: 'test2' } });
        });
        expect(spy.calls[0].arguments[0]).toBe("test2");
    });
    it('Handling onChange with object', () => {
        const actions = {
            onChange: () => {}
        };
        const spy = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<LocalizedInput onChange={actions.onChange} value={{}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        act(() => {
            el.value = 'test2';
            Simulate.change(el, { target: { value: 'test2' } });
        });
        expect(spy.calls[0].arguments[0]).toEqual({"default": "test2"});
    });
    it('handle dialog open and close', () => {
        ReactDOM.render(<LocalizedInput />, document.getElementById("container"));
        const container = document.getElementById('container');
        openModal(container);
        const dialog = document.querySelector('.modal-dialog');
        expect(dialog).toBeTruthy();
        closeModal(dialog);
        const inputs = dialog.querySelectorAll('input');
        const supportedLocales = Object.entries(getSupportedLocales);
        expect(inputs.length).toBeGreaterThan(supportedLocales.length + 1); // default + supported locales
        expect(document.querySelector('.modal-dialog')).toBeFalsy();
    });
    it('handle dialog open and close locales', () => {
        ReactDOM.render(<LocalizedInput locales={TEST_LOCALES} />, document.getElementById("container"));
        const container = document.getElementById('container');
        openModal(container);
        const dialog = document.querySelector('.modal-dialog');
        const inputs = dialog.querySelectorAll('input');
        expect(inputs.length).toEqual(Object.entries(TEST_LOCALES).length + 1); // default + N locales
        expect(dialog).toBeTruthy();
        closeModal(dialog);
        expect(document.querySelector('.modal-dialog')).toBeFalsy();
    });
    // open dialog, change values in various languages, close dialog, check value
    it('handle dialog open and close with value', () => {
        let val = {};
        act(() => {
            ReactDOM.render(<LocalizedInput value={val} locales={TEST_LOCALES} onChange={vv => {val = vv; }} />, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        openModal(container);
        const dialog = document.querySelector('.modal-dialog');
        expect(dialog).toBeTruthy();

        let inputs = dialog.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThan(1);
        inputs[0].value = 'test';
        Simulate.change(inputs[0], { target: { value: 'test' } });
        const el = container.querySelector('input');
        expect(el).toBeTruthy();
        expect(val).toEqual({"default": "test"});
        act(() => {
            ReactDOM.render(<LocalizedInput value={val} onChange={vv => {val = vv; }} />, document.getElementById("container"));
        });
        inputs = dialog.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThan(1);
        inputs[1].value = 'test2';
        Simulate.change(inputs[1], { target: { value: 'test2' } });

        closeModal(dialog);
        expect(val).toEqual({"default": "test", "it-IT": "test2"});
    });
});

