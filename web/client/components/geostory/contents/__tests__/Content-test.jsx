/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import expect from 'expect';
import Content from '../Content';
import { ContentTypes, EMPTY_CONTENT, Modes } from '../../../../utils/GeoStoryUtils';

describe('Content component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Content rendering with defaults (dummy content)', () => {
        ReactDOM.render(<Content />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content');
        expect(el).toExist();
    });
    it('Content rendering text', () => {
        ReactDOM.render(<Content type={ContentTypes.TEXT} html={"<p id=\"SOME_TEXT\"></p>"} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#SOME_TEXT'); // TODO: it should be content-text
        expect(el).toExist();
    });
    it('Content rendering placeholder for title', () => {
        ReactDOM.render(<Content type={ContentTypes.TEXT} html={EMPTY_CONTENT} mode={Modes.EDIT} sectionType="title"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const h1 = container.querySelector('h1');
        expect(h1).toExist();
        expect(h1.innerText).toBe("geostory.builder.defaults.htmlTitlePlaceholder");
    });
    it('Content rendering placeholder for paragraph', () => {
        ReactDOM.render(<Content type={ContentTypes.TEXT} html={EMPTY_CONTENT} mode={Modes.EDIT} sectionType="paragraph"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const h1 = container.querySelector('h1');
        expect(h1).toExist();
        expect(h1.innerText).toBe("geostory.builder.defaults.htmlPlaceholder");
    });

});
