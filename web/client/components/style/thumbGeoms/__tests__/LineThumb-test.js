import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import {DEFAULT_ANNOTATIONS_STYLES} from '../../../../utils/AnnotationsUtils';
import LineThumb from '../LineThumb';

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
        const style = DEFAULT_ANNOTATIONS_STYLES.LineString;
        const cmp = ReactDOM.render(<LineThumb styleRect={style}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const path = TestUtils.findRenderedDOMComponentWithTag(cmp, 'path');
        expect(path).toExist();
        expect(path.attributes.d.value).toBe("M25 75 L50 50 L75 75 L100 75");
        expect(path.attributes["stroke-linecap"].value).toBe("round");
        expect(path.attributes["stroke-linejoin"].value).toBe("round");
        expect(path.attributes["stroke-width"].value).toBe(style.weight.toString());
        expect(path.attributes.stroke.value).toBe(style.color.toString());

    });


});
