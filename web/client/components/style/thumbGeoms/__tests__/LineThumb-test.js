const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-dom/test-utils');
const LineThumb = require('../LineThumb');
const {DEFAULT_ANNOTATIONS_STYLES} = require('../../../../utils/AnnotationsUtils');

describe("Test the LineThumb component", () => {
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
        const cmp = ReactDOM.render(<LineThumb />, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('create component with default style from annotation utils', () => {
        const style = DEFAULT_ANNOTATIONS_STYLES;
        const featureType = "MultiLineString";
        const cmp = ReactDOM.render(<LineThumb styleRect={style[featureType]}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const path = TestUtils.findRenderedDOMComponentWithTag(cmp, 'path');
        expect(path).toExist();
        expect(path.attributes.d.value).toBe("M25 75 L50 50 L75 75 L100 75");
        expect(path.attributes["stroke-linecap"].value).toBe("round");
        expect(path.attributes["stroke-linejoin"].value).toBe("round");
        expect(path.attributes["stroke-width"].value).toBe(style[featureType].weight.toString());
        expect(path.attributes.stroke.value).toBe(style[featureType].color.toString());
        expect(path.attributes.fill.value).toBe(style[featureType].fillColor.toString());

    });


});
