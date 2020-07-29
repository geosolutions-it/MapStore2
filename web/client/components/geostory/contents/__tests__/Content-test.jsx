/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import { ContentTypes, EMPTY_CONTENT, Modes, MediaTypes } from '../../../../utils/GeoStoryUtils';
import Content from '../Content';

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
    it('Content rendering placeholder for title html = undefined', () => {
        ReactDOM.render(<Content type={ContentTypes.TEXT} html={undefined} mode={Modes.EDIT} sectionType="title"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const h1 = container.querySelector('h1');
        expect(h1).toExist();
        expect(h1.innerText).toBe("geostory.builder.defaults.htmlTitlePlaceholder");
    });
    it('Content rendering placeholder for title, html = ""', () => {
        ReactDOM.render(<Content type={ContentTypes.TEXT} html={""} mode={Modes.EDIT} sectionType="title"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const h1 = container.querySelector('h1');
        expect(h1).toExist();
        expect(h1.innerText).toBe("geostory.builder.defaults.htmlTitlePlaceholder");
    });
    it('Content rendering placeholder for paragraph', () => {
        ReactDOM.render(<Content type={ContentTypes.TEXT} html={EMPTY_CONTENT} mode={Modes.EDIT} sectionType="paragraph"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const p = container.querySelector('p');
        expect(p).toExist();
        expect(p.innerText).toBe("geostory.builder.defaults.htmlPlaceholder");
    });
    it('Content rendering Media IMAGE', () => {
        ReactDOM.render(<Content lazy={false} type={ContentTypes.MEDIA} mediaType={MediaTypes.IMAGE} src="http:/" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const imageContent = container.querySelector('.ms-media.ms-media-image');
        expect(imageContent).toExist();
    });
    it('Content rendering Media MAP', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}} >
                <Content lazy={false} type={ContentTypes.MEDIA} mediaType={MediaTypes.MAP} />
            </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const imageContent = container.querySelector('.ms-media.ms-media-map');
        expect(imageContent).toExist();
    });
});
