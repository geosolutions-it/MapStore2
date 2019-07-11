const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const ColorRampItem = require('../ColorRampItem');

describe("Test the ColorRampItem", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates colorramp with defaults', () => {
        ReactDOM.render(<ColorRampItem />, document.getElementById("container"));
        const container = document.getElementById('container');
        const colorRamp = container.querySelector('.color-ramp-item');
        expect(colorRamp).toExist();
    });
    it('colorrampitem with string item equal to blue', () => {
        ReactDOM.render(<ColorRampItem item="blue" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const colorRamp = container.querySelector('.colorname-cell');
        expect(colorRamp.innerHTML).toEqual('blue');
    });
    it('colorrampitem with object item contain name equal to full INTL path', () => {
        const color = 'global.colors.blue';
        ReactDOM.render(<ColorRampItem item={{name: color}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const colorRamp = container.querySelector('span');
        expect(colorRamp.innerHTML).toEqual(color);
    });
    it('colorrampitem with object item contain name without full INTL path', () => {
        const color = 'blue';
        ReactDOM.render(<ColorRampItem item={{name: color}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const colorRamp = container.querySelector('span');
        expect(colorRamp.innerHTML).toEqual(`global.colors.${color}`);
    });
});
