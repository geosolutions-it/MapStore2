/*
 * Copyright 2020, GeoSolutions Sas.
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
import Banner, { DEFAULT_BANNER_HEIGHT } from '../Banner';

describe('Banner component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Banner rendering with defaults', () => {
        ReactDOM.render(<Banner />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-banner');
        expect(el).toExist();
    });
    it('Banner background rendering (image)', () => {
        const IMAGE_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const CONTENTS = [
            {
                id: '000',
                background: {
                    type: 'image',
                    src: IMAGE_SRC,
                    lazy: false
                }
            }
        ];
        ReactDOM.render(<Banner contents={CONTENTS} mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-banner');
        expect(el).toExist();
        const img = el.querySelector('img');
        expect(img).toExist();
        expect(img.getAttribute('src')).toBe(IMAGE_SRC);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();

        const buttonsInToolbar = container.querySelectorAll('.ms-section-background-container .btn-group .glyphicon');
        expect(buttonsInToolbar).toExist();
        expect(buttonsInToolbar.length).toBe(7);
        testToolbarButtons(["pencil", "height-view", "fit-contain", "size-extra-large", "align-center", "dropper", "trash"], container);

    });
    it('Banner rendering cover set to true', () => {
        const VIEW_HEIGHT = 500;
        const CONTENTS = [
            {
                id: '000'
            }
        ];
        ReactDOM.render(<Banner contents={CONTENTS} viewHeight={VIEW_HEIGHT} sectionType="banner" cover mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-banner');
        expect(el).toExist();

        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(VIEW_HEIGHT);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(["pencil", "height-auto", "trash"], container);
    });

    it('Banner rendering cover set to false', () => {
        const VIEW_HEIGHT = 500;
        const CONTENTS = [
            {
                id: '000'
            }
        ];
        ReactDOM.render(<Banner contents={CONTENTS} viewHeight={VIEW_HEIGHT} cover={false}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-banner');
        expect(el).toExist();

        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(DEFAULT_BANNER_HEIGHT);
    });
    it('Banner rendering with Map as background', () => {
        const VIEW_HEIGHT = 834;
        const CONTENTS = [
            {
                id: '000',
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
                <Banner contents={CONTENTS} viewHeight={VIEW_HEIGHT} cover mode="edit"/>
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-banner');
        expect(el).toExist();

        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(VIEW_HEIGHT);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(["pencil", "height-auto", "map-edit", "size-extra-large", "align-center", "dropper", "trash"], container);
    });
    it('should apply expandable background class on media map', () => {
        const VIEW_HEIGHT = 834;
        const CONTENTS = [
            {
                id: '000',
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
                <Banner contents={CONTENTS} expandableMedia viewHeight={VIEW_HEIGHT} cover mode="edit"/>
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-banner.ms-expandable-background');
        expect(el).toExist();
    });
    it('should render video toolbar on background (fit cover)', () => {
        const CONTENTS = [{
            id: '000',
            background: {
                type: 'video',
                fit: 'cover'
            }
        }];
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Banner mode="edit" contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');

        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(['pencil', 'height-view', 'fit-contain', 'size-extra-large', 'align-center', 'dropper', 'audio', 'trash'], container);
    });
    it('should render video toolbar on background (fit contain)', () => {
        const CONTENTS = [{
            id: '000',
            background: {
                type: 'video',
                fit: 'contain'
            }
        }];
        ReactDOM.render(
            <Provider store={{
                getState: () => {},
                subscribe: () => {},
                dispatch: () => {}
            }}>
                <Banner mode="edit" contents={CONTENTS} />
            </Provider>
            , document.getElementById("container"));
        const container = document.getElementById('container');

        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
        testToolbarButtons(['pencil', 'height-view', 'fit-cover', 'size-extra-large', 'align-center', 'dropper', 'audio', 'play-circle', 'loop', 'trash'], container);
    });
});
