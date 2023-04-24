import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import LocalizedString from '../LocalizedString';
import { IntlProvider, addLocaleData } from 'react-intl';

import { act } from 'react-dom/test-utils';
describe('LocalizedString component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('LocalizedString rendering with defaults', () => {
        ReactDOM.render(<LocalizedString />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
    });
    it('LocalizedString rendering with value', () => {
        ReactDOM.render(<LocalizedString value="test" />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        expect(container.innerText).toBe('test');
    });
    it('LocalizedString rendering with value and locale', () => {
        ReactDOM.render(<IntlProvider locale="en-US"><LocalizedString value={{ "en-US": "EN-US"}} /></IntlProvider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        expect(container.innerText).toBe('EN-US');
    });
    it('LocalizedString rendering with value and locale different from default', () => {
        addLocaleData({ locale: 'it-IT', parentLocale: 'it' }); // this is needed to avoid error: "Missing locale data for locale: "it-IT". Using default locale: "en" as fallback."
        act(() => {
            ReactDOM.render(<IntlProvider locales={{en: {}, it: {}}} locale="it-IT"><LocalizedString value={{ "default": "default", 'it-IT': 'test' }} /></IntlProvider>, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        expect(container.innerText).toBe('test');
    });
});
