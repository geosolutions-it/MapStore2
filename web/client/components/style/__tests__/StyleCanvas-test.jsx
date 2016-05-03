const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const StyleCanvas = require('../StyleCanvas');

let shapeStyle = {
    color: { r: 0, g: 0, b: 255, a: 1 },
    width: 3,
    fill: { r: 0, g: 0, b: 255, a: 0.1 },
    radius: 10,
    marker: false
};

describe("Test the StyleCanvas style component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test component drawing polygon', () => {
        const cmp = ReactDOM.render(<StyleCanvas shapeStyle={shapeStyle} geomType="Polygon"/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('test component drawing line', () => {
        const cmp = ReactDOM.render(<StyleCanvas shapeStyle={shapeStyle} geomType="Polyline"/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('test component drawing point', () => {
        const cmp = ReactDOM.render(<StyleCanvas shapeStyle={shapeStyle} geomType="Point"/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('test component drawing marker', () => {
        const cmp = ReactDOM.render(<StyleCanvas shapeStyle={shapeStyle} geomType="Marker"/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

});
