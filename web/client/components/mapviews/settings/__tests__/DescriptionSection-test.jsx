/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import DescriptionSection from '../DescriptionSection';
import expect from 'expect';

describe('DescriptionSection component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        ReactDOM.render(<DescriptionSection />, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
    });
    it('should show the editor if expanded', () => {
        ReactDOM.render(<DescriptionSection expandedSections={{ description: true }}/>, document.getElementById("container"));
        const sectionNode = document.querySelector('.ms-map-views-section');
        expect(sectionNode).toBeTruthy();
        const editorNode = document.querySelector('.rdw-editor-main');
        expect(editorNode).toBeTruthy();
        const imageToolNode = document.querySelector('.rdw-image-wrapper');
        expect(imageToolNode).toBeTruthy();
        const embedToolNode = document.querySelector('.rdw-embedded-wrapper');
        expect(embedToolNode).toBeTruthy();
    });
});
