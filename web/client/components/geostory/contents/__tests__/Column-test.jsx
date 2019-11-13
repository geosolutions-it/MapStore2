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
import Column from '../Column';
import { ContentTypes, Modes, MediaTypes } from '../../../../utils/GeoStoryUtils';

describe('Column component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Column rendering with defaults', () => {
        ReactDOM.render(<Column />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-column-contents');
        expect(el).toExist();
    });
    it('Column rendering contents', () => {
        ReactDOM.render(<Column contents={[{ type: ContentTypes.TEXT, html: '<p id="TEST_HTML">something</p>' }]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#TEST_HTML');
        expect(el).toExist();
    });
    it('Column edit mode has add button', () => {
        ReactDOM.render(<Column mode={Modes.EDIT} contents={[{ type: ContentTypes.TEXT, html: '<p id="TEST_HTML">something</p>' }]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.add-bar');
        expect(el).toExist();
    });
    describe('Column contents has proper toolbars', () => {
        it('text', () => {
            // text content should contain only delete button
            ReactDOM.render(<Column mode={Modes.EDIT} contents={[{ type: ContentTypes.TEXT, html: '<p id="TEST_HTML">something</p>' }]} />, document.getElementById("container"));
            const textToolbar = document.querySelector('.ms-content-toolbar .btn-group');
            expect(textToolbar).toExist();
            expect(textToolbar.querySelectorAll('button').length).toBe(1);
            expect(textToolbar.querySelector('button .glyphicon-trash')).toExist(); // align tool
        });
        it('media', () => {
            // media and image contents must have edit, resize and align tools
            ReactDOM.render(<Column mode={Modes.EDIT} contents={[{ type: ContentTypes.MEDIA }]} />, document.getElementById("container"));
            let mediaToolbar = document.querySelector('.ms-content-toolbar .btn-group');
            expect(mediaToolbar).toExist();

        });
        it('image', () => {
            // TODO:  check (empty) media button (Should be type: media)
            // image contents must have edit, resize align and delete tools
            ReactDOM.render(<Column mode={Modes.EDIT} contents={[{ type: MediaTypes.IMAGE }]} />, document.getElementById("container"));
            let mediaToolbar = document.querySelector('.ms-content-toolbar .btn-group');
            expect(mediaToolbar).toExist();
            const buttons = mediaToolbar.querySelectorAll('.ms-content-toolbar .btn-group button');
            expect(buttons.length).toBe(4);
            expect(mediaToolbar.querySelector('button .glyphicon-pencil')).toExist(); // edit tool
            expect(mediaToolbar.querySelector('button .glyphicon-resize-horizontal')).toExist(); // resize tool
            expect(mediaToolbar.querySelector('button .glyphicon-align-center')).toExist(); // align tool
            expect(mediaToolbar.querySelector('button .glyphicon-trash')).toExist(); // delete tool
        });
    });
});
