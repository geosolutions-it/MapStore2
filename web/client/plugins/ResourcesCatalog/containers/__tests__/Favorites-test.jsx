/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import Favorites from '../Favorites';
import axios from '../../../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import { waitFor } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';

let mockAxios;

describe('Favorites container', () => {
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should not render with default', () => {
        ReactDOM.render(<Favorites />, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children.length).toBe(0);
    });
    it('should trigger addFavoriteResource', (done) => {
        mockAxios.onPost().reply((data) => {
            try {
                expect(data.url).toEqual('/users/user/10/favorite/15');
            } catch (e) {
                done(e);
            }
            return [200];
        });
        const Component = ({ onClick, glyph, labelId }) => {
            return (<button onClick={onClick}>{glyph}:{labelId}</button>);
        };
        ReactDOM.render(<Favorites
            component={Component}
            delayTime={0}
            user={{ id: '10' }}
            resource={{ id: '15', isFavorite: false }}
        />, document.getElementById('container'));

        const button = document.querySelector('button');
        expect(button).toBeTruthy();
        expect(button.innerHTML).toBe('heart-o:resourcesCatalog.addToFavorites');

        Simulate.click(button);

        waitFor(() => expect(document.querySelector('button').innerHTML).toBe('heart:resourcesCatalog.removeFromFavorites'))
            .then(() => done())
            .catch(done);
    });

    it('should trigger removeFavoriteResource', (done) => {
        mockAxios.onDelete().reply((data) => {
            try {
                expect(data.url).toEqual('/users/user/10/favorite/15');
            } catch (e) {
                done(e);
            }
            return [200];
        });
        const Component = ({ onClick, glyph, labelId }) => {
            return (<button onClick={onClick}>{glyph}:{labelId}</button>);
        };
        ReactDOM.render(<Favorites
            component={Component}
            delayTime={0}
            user={{ id: '10' }}
            resource={{ id: '15', isFavorite: true }}
        />, document.getElementById('container'));

        const button = document.querySelector('button');
        expect(button).toBeTruthy();
        expect(button.innerHTML).toBe('heart:resourcesCatalog.removeFromFavorites');

        Simulate.click(button);

        waitFor(() => expect(document.querySelector('button').innerHTML).toBe('heart-o:resourcesCatalog.addToFavorites'))
            .then(() => done())
            .catch(done);
    });

    it('should trigger onSearch if the query has the favorite f filter', (done) => {
        mockAxios.onPost().reply((data) => {
            try {
                expect(data.url).toEqual('/users/user/10/favorite/15');
            } catch (e) {
                done(e);
            }
            return [200];
        });
        const Component = ({ onClick, glyph, labelId }) => {
            return (<button onClick={onClick}>{glyph}:{labelId}</button>);
        };
        ReactDOM.render(<Favorites
            component={Component}
            delayTime={0}
            user={{ id: '10' }}
            resource={{ id: '15', isFavorite: false }}
            location={{
                search: '?f=favorite'
            }}
            onSearch={({ refresh }) => {
                expect(refresh).toBe(true);
                done();
            }}
        />, document.getElementById('container'));

        const button = document.querySelector('button');
        expect(button).toBeTruthy();
        expect(button.innerHTML).toBe('heart-o:resourcesCatalog.addToFavorites');

        Simulate.click(button);
    });
});
