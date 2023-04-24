import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Simulate, act } from 'react-dom/test-utils';
import LocalizedHeaderRenderer from '../LocalizedHeaderRenderer';
import { IntlProvider } from 'react-intl';


describe('LocalizedHeaderRenderer component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('LocalizedHeaderRenderer rendering with defaults', () => {
        ReactDOM.render(<LocalizedHeaderRenderer />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.innerHTML).toEqual("");
    });
    it('LocalizedHeaderRenderer rendering with string title', () => {
        act(() => {
            ReactDOM.render(<LocalizedHeaderRenderer column={{name: 'name', title: 'title', description: 'description'}} />, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        expect(container.innerHTML).toEqual("title");
        act(() => {
            ReactDOM.render(<LocalizedHeaderRenderer column={{name: 'name', description: 'description'}} />, document.getElementById("container"));
        });
        expect(document.getElementById('container').innerHTML).toEqual("name");

    });
    it('LocalizedHeaderRenderer rendering with localized title', () => {
        act(() => {
            ReactDOM.render(<LocalizedHeaderRenderer column={{name: 'name', title: {"default": 'title', 'en-US': 'title_en'}, description: 'description'}} />, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        expect(container.innerHTML).toEqual("title");
        act(() => {
            ReactDOM.render(<IntlProvider locale="en-US">
                <LocalizedHeaderRenderer column={{name: 'name', title: {"default": 'title', 'en-US': 'title_en'}, description: 'description'}} />
            </IntlProvider>, document.getElementById("container"));
        });
        expect(document.getElementById('container').innerHTML).toEqual("title_en");
    });
    it('LocalizedHeaderRenderer rendering with tooltip', () => {
        act(() => {
            ReactDOM.render(<LocalizedHeaderRenderer column={{name: 'name', title: 'title', description: 'description', showTitleTooltip: true}} />, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        const el = container.querySelector('span');
        expect(el.innerHTML).toEqual("title");
        act(() => {
            Simulate.mouseOver(el, { bubbles: true });
        });
        const tooltip = document.querySelector('.tooltip-inner');
        expect(tooltip.innerHTML).toEqual("description");
    });
});
