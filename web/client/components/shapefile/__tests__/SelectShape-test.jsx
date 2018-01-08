const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const SelectShape = require('../SelectShape');
const b64toBlob = require('b64-to-blob');

const TestUtils = require('react-dom/test-utils');

global.window.URL = {
    createObjectURL: function createObjectURL(arg) {
        return 'data://' + arg.name;
    }
};

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
        const cmp = ReactDOM.render(<SelectShape/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates component loading', () => {
        const cmp = ReactDOM.render(<SelectShape loading />, document.getElementById("container"));
        expect(cmp).toExist();
        const dom = ReactDOM.findDOMNode(cmp);
        expect(dom.className.indexOf('btn') !== -1).toBe(true);
    });

    it('creates component not loading', () => {
        const cmp = ReactDOM.render(<SelectShape text="TEST" loading={false} />, document.getElementById("container"));
        expect(cmp).toExist();
        const dom = ReactDOM.findDOMNode(cmp);
        expect(dom.className.indexOf('btn') !== -1).toBe(false);
        expect(dom.innerHTML.indexOf('TEST') !== -1).toBe(true);
    });

    it('upload file', (done) => {
        const handler = () => {
            done();
        };
        const cmp = ReactDOM.render(<SelectShape onShapeChoosen={handler}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const dom = ReactDOM.findDOMNode(cmp);
        expect(dom.getElementsByTagName('input').length).toBe(1);
        const content = TestUtils.findRenderedDOMComponentWithClass(cmp, 'dropzone-content');
        const files = [{
            name: 'file1.zip',
            size: 1111,
            type: 'application/zip'
        }];
        TestUtils.Simulate.drop(content, { dataTransfer: { files } });
    });

    it('upload KML file', (done) => {
        const handler = () => {
            done();
        };
        const cmp = ReactDOM.render(<SelectShape onShapeChoosen={handler}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const dom = ReactDOM.findDOMNode(cmp);
        expect(dom.getElementsByTagName('input').length).toBe(1);
        const content = TestUtils.findRenderedDOMComponentWithClass(cmp, 'dropzone-content');
        const files = [{
            name: 'file1.kml',
            size: 1111,
            type: 'application/vnd.google-earth.kml+xml'
        }];
        TestUtils.Simulate.drop(content, { dataTransfer: { files } });
    });

    it('upload KMZ file', (done) => {
        const handler = () => {
            done();
        };
        const cmp = ReactDOM.render(<SelectShape onShapeChoosen={handler}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const dom = ReactDOM.findDOMNode(cmp);
        expect(dom.getElementsByTagName('input').length).toBe(1);
        const content = TestUtils.findRenderedDOMComponentWithClass(cmp, 'dropzone-content');
        const files = [{
            name: 'file1.kmz',
            size: 1111,
            type: 'application/vnd.google-earth.kmz'
        }];
        TestUtils.Simulate.drop(content, { dataTransfer: { files } });
    });

    it('upload GPX file', (done) => {
        const handler = () => {
            done();
        };
        const cmp = ReactDOM.render(<SelectShape onShapeChoosen={handler}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const dom = ReactDOM.findDOMNode(cmp);
        expect(dom.getElementsByTagName('input').length).toBe(1);
        const content = TestUtils.findRenderedDOMComponentWithClass(cmp, 'dropzone-content');
        const files = [{
            name: 'file1.gpx',
            size: 1111,
            type: ''
        }];
        TestUtils.Simulate.drop(content, { dataTransfer: { files } });
    });

    it('upload wrong mime, right file', (done) => {
        const handler = () => {
            done();
        };
        const cmp = ReactDOM.render(<SelectShape onShapeChoosen={handler}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const dom = ReactDOM.findDOMNode(cmp);
        expect(dom.getElementsByTagName('input').length).toBe(1);
        const content = TestUtils.findRenderedDOMComponentWithClass(cmp, 'dropzone-content');
        const files = [b64toBlob('UEsDBAoAAAAAACGPaktDvrfoAQAAAAEAAAAKAAAAc2FtcGxlLnR4dGFQSwECPwAKAAAAAAAhj2pLQ7636AEAAAABAAAACgAkAAAAAAAAACAAAAAAAAAAc2FtcGxlLnR4dAoAIAAAAAAAAQAYAGILh+1EWtMBy3f86URa0wHLd/zpRFrTAVBLBQYAAAAAAQABAFwAAAApAAAAAAA=', 'application/pdf')];
        files[0].name = 'test.zip';
        TestUtils.Simulate.drop(content, { dataTransfer: { files } });
    });

    it('upload wrong file', (done) => {
        const handler = () => {
            done();
        };
        const cmp = ReactDOM.render(<SelectShape onShapeError={handler}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const dom = ReactDOM.findDOMNode(cmp);
        expect(dom.getElementsByTagName('input').length).toBe(1);
        const content = TestUtils.findRenderedDOMComponentWithClass(cmp, 'dropzone-content');
        const files = [{
            name: 'file1.pdf',
            size: 1111,
            type: 'application/pdf'
        }];
        TestUtils.Simulate.drop(content, { dataTransfer: { files } });
    });
});
