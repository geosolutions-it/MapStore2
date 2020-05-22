/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import expect from 'expect';

import { testToolbarButtons } from './testUtils';
import Title from '../Title';
describe('Title component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Title rendering with defaults', () => {
        ReactDOM.render(<Title />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title');
        expect(el).toExist();
    });
    it('Title background rendering (image)', () => {
        const IMAGE_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const CONTENTS = [
            {
                id: '000',
                type: 'column',
                background: {
                    type: 'image',
                    src: IMAGE_SRC,
                    lazy: false
                },
                html: '<h1>Title</h1>'
            }
        ];
        ReactDOM.render(<Title contents={CONTENTS} mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title');
        expect(el).toExist();
        const img = el.querySelector('img');
        expect(img).toExist();
        expect(img.getAttribute('src')).toBe(IMAGE_SRC);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();

        const buttonsInToolbar = container.querySelectorAll('.ms-section-background-container .btn-group .glyphicon');
        expect(buttonsInToolbar).toExist();
        expect(buttonsInToolbar.length).toBe(6);
        testToolbarButtons(["pencil", "height-view", "fit-contain", "size-extra-large", "align-center", "dropper"], container);

    });
    it('Title rendering cover set to true', () => {
        const VIEW_HEIGHT = 500;
        const CONTENTS = [
            {
                id: '000',
                type: 'text',
                html: '<h1>Title</h1>'
            }
        ];
        ReactDOM.render(<Title contents={CONTENTS} viewHeight={VIEW_HEIGHT} sectionType="title" cover mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title');
        expect(el).toExist();

        const sectionContents = container.querySelector('.ms-section-contents');
        expect(sectionContents).toExist();
        expect(sectionContents.clientHeight).toBe(VIEW_HEIGHT);

        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(VIEW_HEIGHT);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(["pencil", "height-auto"], container);
    });

    it('Title rendering cover set to false', () => {
        const VIEW_HEIGHT = 500;
        const CONTENTS = [
            {
                id: '000',
                type: 'text',
                html: '<h1>Title</h1>'
            }
        ];
        ReactDOM.render(<Title contents={CONTENTS} viewHeight={VIEW_HEIGHT} cover={false}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title');
        expect(el).toExist();

        const sectionContents = container.querySelector('.ms-section-contents');
        expect(sectionContents).toExist();
        expect(sectionContents.clientHeight < VIEW_HEIGHT).toBe(true);

        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(sectionContents.clientHeight);
    });
    it('Title rendering with Map as background', () => {
        const VIEW_HEIGHT = 834;
        const CONTENTS = [
            {
                id: '000',
                type: "text",
                background: {
                    type: 'map'
                }
            }
        ];
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Title contents={CONTENTS} viewHeight={VIEW_HEIGHT} cover mode="edit"/>
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title');
        expect(el).toExist();

        const sectionContents = container.querySelector('.ms-section-contents');
        expect(sectionContents).toExist();
        expect(sectionContents.clientHeight).toBe(VIEW_HEIGHT);

        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(VIEW_HEIGHT);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(["pencil", "height-auto", "map-edit", "size-extra-large", "align-center", "dropper"], container);
    });
    it('should apply expandable background class on media map', () => {
        const VIEW_HEIGHT = 834;
        const CONTENTS = [
            {
                id: '000',
                type: "text",
                background: {
                    type: 'map'
                }
            }
        ];
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Title contents={CONTENTS} expandableMedia viewHeight={VIEW_HEIGHT} cover mode="edit"/>
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title.ms-expandable-background');
        expect(el).toExist();
    });
    it('should render video toolbar on background (fit cover)', () => {
        const CONTENTS = [{
            id: '000',
            type: 'column',
            background: {
                type: 'video',
                fit: 'cover'
            },
            contents: [{
                type: 'text',
                html: '<p>column</p>'
            }]
        }];
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Title mode="edit" contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');

        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(['pencil', 'height-view', 'fit-contain', 'size-extra-large', 'align-center', 'dropper', 'audio'], container);
    });
    it('should render video toolbar on background (fit contain)', () => {
        const CONTENTS = [{
            id: '000',
            type: 'column',
            background: {
                type: 'video',
                fit: 'contain'
            },
            contents: [{
                type: 'text',
                html: '<p>column</p>'
            }]
        }];
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Title mode="edit" contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');

        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(['pencil', 'height-view', 'fit-cover', 'size-extra-large', 'align-center', 'dropper', 'audio', 'play-circle', 'loop'], container);
    });
});
