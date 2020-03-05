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
        expect(el).toBeTruthy();
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toBeFalsy();
    });
    it('Immersive rendering in edit mode ', () => {
        ReactDOM.render(<Immersive mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-immersive');
        expect(el).toBeTruthy();
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toBeTruthy();
    });

    it('Immersive background rendering (image)', () => {

        ReactDOM.render(<Immersive contents={CONTENTS} mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-immersive');
        expect(el).toBeTruthy();
        const img = el.querySelector('img');
        expect(img).toBeTruthy();
        expect(img.getAttribute('src')).toBe(IMAGE_SRC);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toBeTruthy();
    });
    it('Check contents and background tools', () => {
        // column content should have
        ReactDOM.render(<Immersive mode={Modes.EDIT} contents={CONTENTS} />, document.getElementById("container"));

        // background tools should have edit, fullscreen, resize and align
        const backgroundToolbar = document.querySelector('.ms-section-background .ms-content-toolbar .btn-group');
        expect(backgroundToolbar).toBeTruthy();
        expect(backgroundToolbar.querySelectorAll('button').length).toBe(5);
        expect(backgroundToolbar.querySelector('button .glyphicon-pencil')).toBeTruthy(); // edit tool
        expect(backgroundToolbar.querySelector('button .glyphicon-fit-contain')).toBeTruthy(); // fit tool
        expect(backgroundToolbar.querySelector('button .glyphicon-size-extra-large')).toBeTruthy(); // resize tool
        expect(backgroundToolbar.querySelector('button .glyphicon-align-center')).toBeTruthy(); // align tool
        expect(backgroundToolbar.querySelector('button .glyphicon-dropper')).toBeTruthy(); // theme

        // column should have algin, and resize tools
        const columnToolbar = document.querySelector('.ms-section-contents .ms-content-toolbar .btn-group');
        expect(columnToolbar).toBeTruthy();
        expect(columnToolbar.querySelectorAll('button').length).toBe(3);
        expect(columnToolbar.querySelector('button .glyphicon-resize-horizontal')).toBeTruthy(); // resize tool
        expect(columnToolbar.querySelector('button .glyphicon-align-center')).toBeTruthy(); // align tool
        expect(columnToolbar.querySelector('button .glyphicon-dropper')).toBeTruthy(); // theme

        // inner media and image contents must have edit, resize and align tools
        const innerMediaToolbar = document.querySelector('.ms-column-contents .ms-content-image .ms-content-toolbar .btn-group');
        expect(innerMediaToolbar).toBeTruthy();
        expect(innerMediaToolbar.querySelectorAll('button').length).toBe(4);
        expect(innerMediaToolbar.querySelector('button .glyphicon-pencil')).toBeTruthy(); // edit tool
        expect(innerMediaToolbar.querySelector('button .glyphicon-resize-horizontal')).toBeTruthy(); // resize tool
        expect(innerMediaToolbar.querySelector('button .glyphicon-align-center')).toBeTruthy(); // align tool
        expect(innerMediaToolbar.querySelector('button .glyphicon-trash')).toBeTruthy(); // delete tool
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
        expect(contentToolbar).toBeTruthy();
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
                <Immersive mode={Modes.EDIT} expandableBackgroundMedia contents={CONTENTS_MAP} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-immersive.ms-expandable-background');
        expect(el).toBeTruthy();
    });
});
