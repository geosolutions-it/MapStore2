const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const ShapefileUploadAndStyle = require('../ShapefileUploadAndStyle');

describe("Test the select shapefile component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        const cmp = ReactDOM.render(<ShapefileUploadAndStyle/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates component loading', () => {
        const cmp = ReactDOM.render(<ShapefileUploadAndStyle loading />, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('test parser error', done => {
        const onShapeError = (error) => {
            try {
                expect(error).toBe('shapefile.error.shapeFileParsingError');
            } catch(e) {
                done(e);
            }
            done();
        };

        const cmp = ReactDOM.render(<ShapefileUploadAndStyle useDefaultStyle onShapeError={onShapeError} readFiles={() => {
            return ['{ "error":  }'].map(s => new Promise(() => JSON.parse(s)));
        }} />, document.getElementById("container"));
        expect(cmp).toExist();
        cmp.addShape();
    });

    it('test generic error', done => {
        const onShapeError = (error) => {
            try {
                expect(error).toBe('shapefile.error.genericLoadError');
            } catch(e) {
                done(e);
            }
            done();
        };

        const cmp = ReactDOM.render(<ShapefileUploadAndStyle useDefaultStyle onShapeError={onShapeError} readFiles={() => {
            return ["100"].map(() => new Promise(() => decodeURIComponent('%')));
        }} />, document.getElementById("container"));
        expect(cmp).toExist();
        cmp.addShape();
    });
});
