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
import VideoList from '../VideoList';

describe('VideoList component', () => {
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
        ReactDOM.render(<VideoList/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-video-list')).toBeTruthy();
    });
    it('should render with resources', () => {
        ReactDOM.render(<VideoList
            resources={[
                {
                    id: 'video-01',
                    data: {
                        thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
                        title: 'title-1',
                        description: 'description-1'
                    }
                },
                {
                    id: 'video-02',
                    data: {
                        title: 'title-2',
                        description: 'description-2'
                    }
                }
            ]}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-video-list')).toBeTruthy();
        const cardsNodes = container.querySelectorAll('.mapstore-side-card');
        expect(cardsNodes.length).toBe(2);
        const [ cardNode1, cardNode2 ] = cardsNodes;

        const previewNode1 = cardNode1.querySelector('.mapstore-side-preview > div');
        const titleNode1 = cardNode1.querySelector('.mapstore-side-card-title > span');
        const descriptionNode1 = cardNode1.querySelector('.mapstore-side-card-desc > span');

        expect(previewNode1.style.background.match('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=')).toBeTruthy();
        expect(titleNode1.innerHTML).toBe('title-1');
        expect(descriptionNode1.innerHTML).toBe('description-1');

        const previewNode2 = cardNode2.querySelector('.mapstore-side-preview > .glyphicon-play');
        const titleNode2 = cardNode2.querySelector('.mapstore-side-card-title > span');
        const descriptionNode2 = cardNode2.querySelector('.mapstore-side-card-desc > span');

        expect(previewNode2).toBeTruthy();
        expect(titleNode2.innerHTML).toBe('title-2');
        expect(descriptionNode2.innerHTML).toBe('description-2');
    });
});
