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

import Immersive from '../Immersive';

// TODO: externalize
import {setObservableConfig} from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);
import { testToolbarButtons } from './testUtils';

import { Modes } from '../../../../../utils/GeoStoryUtils';

const IMAGE_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const CONTENTS = [
    {
        id: '000',
        type: 'column',
        background: {
            type: 'image',
            src: IMAGE_SRC
        },
        contents: [{
            type: 'text',
            html: '<p>column</p>'

        }]
    },
    {
        id: '001',
        type: 'column',
        background: {
            type: 'image',
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        },
        contents: [{
            type: 'image',
            src: IMAGE_SRC,
            lazy: false

        }]
    }
];

describe('Immersive component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Immersive rendering with defaults', () => {
        ReactDOM.render(<Immersive />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-immersive');
        expect(el).toExist();
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toNotExist();
    });
    it('Immersive rendering in edit mode ', () => {
        ReactDOM.render(<Immersive mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-immersive');
        expect(el).toExist();
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
    });

    it('Immersive background rendering (image)', () => {

        ReactDOM.render(<Immersive contents={CONTENTS} mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-immersive');
        expect(el).toExist();
        const img = el.querySelector('img');
        expect(img).toExist();
        expect(img.getAttribute('src')).toBe(IMAGE_SRC);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
    });
    it('Check contents and background tools', () => {
        // column content should have
        ReactDOM.render(<Immersive mode={Modes.EDIT} contents={CONTENTS} />, document.getElementById("container"));

        // background tools should have edit, fullscreen, resize and align
        const backgroundToolbar = document.querySelector('.ms-section-background .ms-content-toolbar .btn-group');
        expect(backgroundToolbar).toExist();
        expect(backgroundToolbar.querySelectorAll('button').length).toBe(5);
        expect(backgroundToolbar.querySelector('button .glyphicon-pencil')).toExist(); // edit tool
        expect(backgroundToolbar.querySelector('button .glyphicon-fit-contain')).toExist(); // fit tool
        expect(backgroundToolbar.querySelector('button .glyphicon-size-extra-large')).toExist(); // resize tool
        expect(backgroundToolbar.querySelector('button .glyphicon-align-center')).toExist(); // align tool
        expect(backgroundToolbar.querySelector('button .glyphicon-dropper')).toExist(); // theme

        // column should have algin, and resize tools
        const columnToolbar = document.querySelector('.ms-section-contents .ms-content-toolbar .btn-group');
        expect(columnToolbar).toExist();
        expect(columnToolbar.querySelectorAll('button').length).toBe(3);
        expect(columnToolbar.querySelector('button .glyphicon-resize-horizontal')).toExist(); // resize tool
        expect(columnToolbar.querySelector('button .glyphicon-align-center')).toExist(); // align tool
        expect(columnToolbar.querySelector('button .glyphicon-dropper')).toExist(); // theme

        // inner media and image contents must have edit and resize
        const innerMediaToolbar = document.querySelector('.ms-column-contents .ms-content-image .ms-content-toolbar .btn-group');
        expect(innerMediaToolbar).toExist();
        expect(innerMediaToolbar.querySelectorAll('button').length).toBe(3);
        expect(innerMediaToolbar.querySelector('button .glyphicon-pencil')).toExist(); // edit tool
        expect(innerMediaToolbar.querySelector('button .glyphicon-resize-horizontal')).toExist(); // resize tool
        expect(innerMediaToolbar.querySelector('button .glyphicon-trash')).toExist(); // delete tool
    });

    it('Immersive background rendering (Map)', () => {
        const CONTENTS_MAP = [{
            id: '000',
            type: 'column',
            background: {
                type: 'map'
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
                <Immersive mode={Modes.EDIT} contents={CONTENTS_MAP} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');

        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(["pencil", "map-edit", "size-extra-large", "align-center", "dropper"], container);
    });
    it('should apply expandable background class on media map', () => {
        const CONTENTS_MAP = [{
            id: '000',
            type: 'column',
            background: {
                type: 'map'
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
                <Immersive mode={Modes.EDIT} expandableMedia contents={CONTENTS_MAP} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-immersive.ms-expandable-background');
        expect(el).toExist();
    });
    it('should render video toolbar on background (fit cover)', () => {
        const CONTENTS_VIDEO = [{
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
                <Immersive mode={Modes.EDIT} contents={CONTENTS_VIDEO} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');

        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(['pencil', 'fit-contain', 'size-extra-large', 'align-center', 'dropper', 'audio'], container);
    });
    it('should render video toolbar on background (fit contain)', () => {
        const CONTENTS_VIDEO = [{
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
                <Immersive mode={Modes.EDIT} contents={CONTENTS_VIDEO} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');

        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(['pencil', 'fit-cover', 'size-extra-large', 'align-center', 'dropper', 'audio', 'play-circle', 'loop'], container);
    });
});
