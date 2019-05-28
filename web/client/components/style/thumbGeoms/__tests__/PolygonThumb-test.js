const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-dom/test-utils');
const PolygonThumb = require('../PolygonThumb');
const {DEFAULT_ANNOTATIONS_STYLES} = require('../../../../utils/AnnotationsUtils');

describe("Test the PolygonThumb component", () => {
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
        const cmp = ReactDOM.render(<PolygonThumb />, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('create component with default style from annotation utils', () => {
        const style = DEFAULT_ANNOTATIONS_STYLES;
        const featureType = "MultiPolygon";
        const cmp = ReactDOM.render(<PolygonThumb styleRect={style[featureType]}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const rect = TestUtils.findRenderedDOMComponentWithTag(cmp, 'rect');
        const svg = TestUtils.findRenderedDOMComponentWithTag(cmp, 'svg');
        expect(rect).toExist();
        expect(rect.attributes.width.value).toBe("50");
        expect(rect.attributes.height.value).toBe("50");
        expect(rect.attributes.x.value).toBe("25");
        expect(rect.attributes.y.value).toBe("25");
        expect(svg.attributes.xmlns.value).toBe("http://www.w3.org/2000/svg");
        expect(svg.attributes.viewBox.value).toBe("0 0 100 100");

    });


});
