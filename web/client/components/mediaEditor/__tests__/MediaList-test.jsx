/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import MediaList from '../MediaList';
import { Provider } from 'react-redux';

describe('MediaList component', () => {
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
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaList />
            </Provider>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-list')).toBeTruthy();
    });
    it('should render with selectedSource equal to geostory', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaList
                    selectedSource={{ type: 'geostory' }}
                    selectedItem={{
                        id: 'id'
                    }}
                />
            </Provider>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-list')).toBeTruthy();
        expect(container.querySelectorAll('button').length).toBe(0);
    });
    it('should render with addMediaEnabled', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaList
                    mediaType="image"
                    disableAddMedia={{
                        image: true
                    }}
                    selectedSource={{
                        type: 'geostory',
                        addMediaEnabled: {
                            image: true
                        }
                    }}
                    selectedItem={{
                        id: 'id'
                    }}
                />
            </Provider>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-list')).toBeTruthy();
        expect(container.querySelectorAll('button').length).toBe(1);
    });
    it('should render with editMediaEnabled', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaList
                    mediaType="image"
                    disableEditMedia={{
                        image: true
                    }}
                    selectedSource={{
                        type: 'geostory',
                        editMediaEnabled: {
                            image: true
                        }
                    }}
                    selectedItem={{
                        id: 'id'
                    }}
                />
            </Provider>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-list')).toBeTruthy();
        expect(container.querySelectorAll('button').length).toBe(1);
    });
    it('should render with editMediaEnabled and different sourceId', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaList
                    mediaType="image"
                    disableEditMedia={{
                        image: true
                    }}
                    selectedSource={{
                        type: 'geostory',
                        editMediaEnabled: {
                            image: true
                        }
                    }}
                    selectedItem={{
                        id: 'id',
                        data: {
                            sourceId: 'geonode'
                        }
                    }}
                />
            </Provider>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-list')).toBeTruthy();
        expect(container.querySelectorAll('button').length).toBe(0);
    });
    it('should render with removeMediaEnabled', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaList
                    mediaType="image"
                    disableEditMedia={{
                        image: true
                    }}
                    selectedSource={{
                        type: 'geostory',
                        removeMediaEnabled: {
                            image: true
                        }
                    }}
                    selectedItem={{
                        id: 'id'
                    }}
                />
            </Provider>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-list')).toBeTruthy();
        expect(container.querySelectorAll('button').length).toBe(1);
    });
});
