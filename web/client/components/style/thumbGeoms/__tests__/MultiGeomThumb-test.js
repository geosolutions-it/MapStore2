const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-dom/test-utils');
const MultiGeomThumb = require('../MultiGeomThumb');
const {DEFAULT_ANNOTATIONS_STYLES} = require('../../../../utils/AnnotationsUtils');

describe("Test the MultiGeomThumb component", () => {
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
        const cmp = ReactDOM.render(<MultiGeomThumb />, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('create component with only Polygon', () => {
        const style = DEFAULT_ANNOTATIONS_STYLES;
        const cmp = ReactDOM.render(<MultiGeomThumb styleMultiGeom={style} geometry={{features: [{geometry: {type: "Polygon"}}]}}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const rect = TestUtils.findRenderedDOMComponentWithTag(cmp, 'rect');
        const svg = TestUtils.findRenderedDOMComponentWithTag(cmp, 'svg');
        expect(rect).toExist();
        const path = TestUtils.scryRenderedDOMComponentsWithTag(cmp, 'path');
        expect(path.length).toBe(0);
        expect(rect.attributes.width.value).toBe("50");
        expect(rect.attributes.height.value).toBe("50");
        expect(rect.attributes.x.value).toBe("20");
        expect(rect.attributes.y.value).toBe("15");
        expect(svg.attributes.xmlns.value).toBe("http://www.w3.org/2000/svg");
        expect(svg.attributes.viewBox.value).toBe("0 0 100 100");

    });
    it('create component with only MultiPolygon LineString', () => {

        const stroke = {color: "#ffcc33", opacity: 1, weight: 2 };
        const fill = {fillColor: "#FFFFFF", fillOpacity: 0 };
        const style = {...stroke, ...fill};

        const cmp = ReactDOM.render(<MultiGeomThumb styleMultiGeom={style} geometry={{features: [{geometry: {type: "Polygon"}}, {geometry: {type: "LineString"}} ]}}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const rect = TestUtils.findRenderedDOMComponentWithTag(cmp, 'rect');

        const svg = TestUtils.findRenderedDOMComponentWithTag(cmp, 'svg');
        expect(rect).toExist();
        expect(rect.attributes.width.value).toBe("50");
        expect(rect.attributes.height.value).toBe("50");
        expect(rect.attributes.x.value).toBe("40");
        expect(rect.attributes.y.value).toBe("15");
        expect(svg.attributes.xmlns.value).toBe("http://www.w3.org/2000/svg");
        expect(svg.attributes.viewBox.value).toBe("0 0 100 100");

    });
    it('create component with only Circle', () => {
        const style = DEFAULT_ANNOTATIONS_STYLES;
        const cmp = ReactDOM.render(<MultiGeomThumb styleMultiGeom={style} geometry={{features: [{geometry: {type: "Circle"}}]}} properties={{circles: [0]}}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const circle = TestUtils.findRenderedDOMComponentWithTag(cmp, 'circle');

        expect(circle).toExist();
        expect(circle.attributes.cx.value).toBe("50");
        expect(circle.attributes.cy.value).toBe("50");
        expect(circle.attributes.r.value).toBe("25");
        expect(circle.attributes.stroke.value).toBe("#ffcc33");
        expect(circle.attributes.fill.value).toBe("#FFFFFF");
        expect(circle.attributes.opacity.value).toBe("1");
        expect(circle.attributes["stroke-width"].value).toBe("2");
        expect(circle.attributes["fill-opacity"].value).toBe("0");

    });


});
