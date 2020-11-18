import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import StylePolyline from '../StylePolyline';

let shapeStyle = {
    color: { r: 0, g: 0, b: 255, a: 1 },
    width: 3,
    fill: { r: 0, g: 0, b: 255, a: 0.1 },
    radius: 10,
    marker: false
};

describe("Test the StylePolyline style component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('create component with default', () => {
        const cmp = ReactDOM.render(<StylePolyline shapeStyle={shapeStyle}/>, document.getElementById("container"));
        expect(cmp).toExist();
    });


});
