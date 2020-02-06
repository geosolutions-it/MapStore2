/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const ResourceUnavailable = require('../ResourceUnavailable');

describe('ResourceUnavailable component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ResourceUnavailable empty', () => {
        ReactDOM.render(<ResourceUnavailable />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.empty-state-container');
        expect(el).toNotExist();
    });

    it('ResourceUnavailable enabled', () => {
        ReactDOM.render(<ResourceUnavailable enabled alwaysVisible/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.empty-state-container');
        expect(el).toExist();
    });

    it('ResourceUnavailable enabled and login (status 404)', () => {
        ReactDOM.render(<ResourceUnavailable enabled login status={404}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.empty-state-container');
        expect(el).toExist();
        const title = container.querySelector('h1 > span');
        expect(title).toExist();
        expect(title.innerHTML).toBe('map.errors.loading.notFound');
        const desc = container.querySelector('.empty-state-description > .text-center > span');
        expect(desc).toExist();
        expect(desc.innerHTML).toBe('map.errors.loading.unknownError');
    });

    it('ResourceUnavailable enabled and login (status 403)', () => {
        ReactDOM.render(<ResourceUnavailable enabled login status={403}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.empty-state-container');
        expect(el).toExist();
        const title = container.querySelector('h1 > span');
        expect(title).toExist();
        expect(title.innerHTML).toBe('map.errors.loading.notAccessible');
        const desc = container.querySelector('.empty-state-description > .text-center > span');
        expect(desc).toExist();
        expect(desc.innerHTML).toBe('map.errors.loading.unknownError');
    });
    it('ResourceUnavailable enabled not login (status 403) shared geostory', () => {
        ReactDOM.render(<ResourceUnavailable mode={"geostory"} enabled isSharedStory status={403}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.empty-state-container');
        expect(el).toExist();
        const title = container.querySelector('h1 > span');
        expect(title).toExist();
        expect(title.innerHTML).toBe('geostory.errors.loading.notAccessible');
        const desc = container.querySelector('.empty-state-description > .text-center > span');
        expect(desc).toExist();
        expect(desc.innerHTML).toBe('geostory.errors.loading.unknownError');
    });

    it('ResourceUnavailable enabled, login and errorMessage', () => {
        ReactDOM.render(<ResourceUnavailable enabled login status={404} errorMessage={'Error 404'}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.empty-state-container');
        expect(el).toExist();
        const title = container.querySelector('h1 > span');
        expect(title).toExist();
        expect(title.innerHTML).toBe('map.errors.loading.notFound');
        const desc = container.querySelector('.empty-state-description > .text-center > span');
        expect(desc).toExist();
        expect(desc.innerHTML).toBe('Error 404');
    });

    it('ResourceUnavailable glyph and mode', () => {
        ReactDOM.render(<ResourceUnavailable enabled login status={404} errorMessage={'Error 404'} mode="testMode" glyphs={{testMode: 'list'}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const glyphicon = container.querySelector('.glyphicon-list');
        expect(glyphicon).toExist();
    });

    it('ResourceUnavailable glyph and mode (missing glyph)', () => {
        ReactDOM.render(<ResourceUnavailable enabled login status={404} errorMessage={'Error 404'} mode="newTestMode" glyphs={{testMode: 'list'}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const glyphicon = container.querySelector('.glyphicon-1-map');
        expect(glyphicon).toExist();
    });

    it('ResourceUnavailable with home button and showHomeButton to true', () => {
        const HomeButton = () => <button className="home-button"></button>;
        ReactDOM.render(<ResourceUnavailable enabled login showHomeButton homeButton={<HomeButton />}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const button = container.querySelector('.home-button');
        expect(button).toExist();
    });

    it('ResourceUnavailable with home button and showHomeButton to false', () => {
        const HomeButton = () => <button className="home-button"></button>;
        ReactDOM.render(<ResourceUnavailable enabled login homeButton={<HomeButton />}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const button = container.querySelector('.home-button');
        expect(button).toNotExist();
    });
});
