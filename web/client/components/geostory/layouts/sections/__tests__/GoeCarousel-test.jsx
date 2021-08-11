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
import GeoCarousel from '../GeoCarousel';
import {setObservableConfig} from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);
import { testToolbarButtons } from './testUtils';
import { Modes } from '../../../../../utils/GeoStoryUtils';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext as dragDropContext } from 'react-dnd';

const Comp = dragDropContext(HTML5Backend)(GeoCarousel);

const CONTENTS = [
    {
        id: '000',
        type: 'column',
        background: {},
        contents: [{
            type: 'text',
            html: '<p>column</p>'

        }]
    },
    {
        id: '001',
        type: 'column',
        background: {},
        contents: [{
            type: 'image',
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            lazy: false
        }]
    }
];

describe('GeoCarousel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Geocarousel rendering with defaults', () => {
        ReactDOM.render(<Comp />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toNotExist();
    });
    it('GeoCarousel rendering in edit mode ', () => {
        ReactDOM.render(<Comp mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
    });

    it('Check contents and background tools', () => {
        // Column content should have
        ReactDOM.render(<Comp mode={Modes.EDIT} background={{ type: 'map' }} contents={CONTENTS} />, document.getElementById("container"));

        // Background tools should have edit, map configuration, resize and align
        const backgroundToolbar = document.querySelector('.ms-section-background .ms-content-toolbar .btn-group');
        expect(backgroundToolbar).toExist();
        expect(backgroundToolbar.querySelectorAll('button').length).toBe(5);
        expect(backgroundToolbar.querySelector('button .glyphicon-pencil')).toExist(); // edit tool
        expect(backgroundToolbar.querySelector('button .glyphicon-map-edit')).toExist(); // map configuration tool
        expect(backgroundToolbar.querySelector('button .glyphicon-size-extra-large')).toExist(); // resize tool
        expect(backgroundToolbar.querySelector('button .glyphicon-align-center')).toExist(); // align tool
        expect(backgroundToolbar.querySelector('button .glyphicon-dropper')).toExist(); // theme

        // Column/section's inner content should have align, and resize tools
        const columnToolbar = document.querySelector('.ms-section-contents .ms-content-toolbar .btn-group');
        expect(columnToolbar).toExist();
        expect(columnToolbar.querySelectorAll('button').length).toBe(3);
        expect(columnToolbar.querySelector('button .glyphicon-resize-horizontal')).toExist(); // resize tool
        expect(columnToolbar.querySelector('button .glyphicon-align-center')).toExist(); // align tool
        expect(columnToolbar.querySelector('button .glyphicon-dropper')).toExist(); // theme

        // Inner media and image contents must have edit and resize
        const innerMediaToolbar = document.querySelector('.ms-column-contents .ms-content-image .ms-content-toolbar .btn-group');
        expect(innerMediaToolbar).toExist();
        expect(innerMediaToolbar.querySelectorAll('button').length).toBe(3);
        expect(innerMediaToolbar.querySelector('button .glyphicon-pencil')).toExist(); // edit tool
        expect(innerMediaToolbar.querySelector('button .glyphicon-resize-horizontal')).toExist(); // resize tool
        expect(innerMediaToolbar.querySelector('button .glyphicon-trash')).toExist(); // delete tool
    });

    it('GeoCarousel background rendering (Map)', () => {
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Comp mode={Modes.EDIT} isDrawEnabled background={{ type: 'map' }} contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');

        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(["pencil", "map-edit", "size-extra-large", "align-center", "dropper", "1-close"], container);
    });
    it('should apply expandable background class on media map', () => {
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Comp mode={Modes.EDIT} expandableMedia background={{ type: 'map' }} contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-carousel.ms-expandable-background');
        expect(el).toExist();
    });
    it('render carousel component along with section and background', () => {
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Comp mode={Modes.EDIT} expandableMedia background={{ type: 'map' }} contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-carousel.ms-expandable-background');
        expect(el).toExist();
        expect(el.querySelector('.ms-geo-carousel')).toBeTruthy();
    });
    it('render Geocarousel with addbar component', () => {
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Comp mode={Modes.EDIT} expandableMedia background={{ type: 'map' }} contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section');
        expect(el).toExist();
        expect(el.querySelector('.add-bar')).toBeTruthy();
    });
    it('render Geocarousel with helper tooltip', () => {
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Comp mode={Modes.EDIT} expandableMedia background={{}} contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-carousel-map-info');
        expect(el).toBeTruthy();
        expect(el.textContent).toBe('geostory.carouselAddMapInfo');
    });
    it('render Geocarousel with viewer slider', () => {
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Comp mode={Modes.VIEW} background={{}} contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.ms-carousel-slider');
        expect(el.length).toBe(2);
    });
    it('render Geocarousel viewer slider only in desktop & in view only mode', () => {
        // Edit mode
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Comp mode={Modes.EDIT} background={{}} contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        let container = document.getElementById('container');
        let el = container.querySelectorAll('.ms-carousel-slider');
        expect(el.length).toBe(0);

        // Mobile view
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Comp mode={Modes.VIEW} expandableMedia background={{}} contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        container = document.getElementById('container');
        el = container.querySelectorAll('.ms-carousel-slider');
        expect(el.length).toBe(0);
    });
});
