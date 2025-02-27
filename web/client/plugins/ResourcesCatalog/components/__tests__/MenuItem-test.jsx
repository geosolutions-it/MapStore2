
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
import MenuItem from '../MenuItem';

describe('MenuItem component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should not render with default', () => {
        ReactDOM.render(<MenuItem />, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children.length).toBe(0);
    });
    it('should render a message', () => {
        ReactDOM.render(<MenuItem
            item={{
                type: 'message',
                labelId: 'myMessageId'
            }}
        />, document.getElementById('container'));
        const li = document.querySelector('li');
        expect(li.innerText).toBe('myMessageId');
    });
    it('should render a placeholder', () => {
        ReactDOM.render(<MenuItem
            item={{
                type: 'placeholder'
            }}
        />, document.getElementById('container'));
        const li = document.querySelector('li');
        expect(li.innerHTML).toBe('<span></span>');
    });
    it('should render a divider', () => {
        ReactDOM.render(<MenuItem
            item={{
                type: 'divider',
                style: {}
            }}
        />, document.getElementById('container'));
        const divider = document.querySelector('.ms-menu-divider');
        expect(divider).toBeTruthy();
    });
    it('should render a square button', () => {
        ReactDOM.render(<MenuItem
            item={{
                type: 'button',
                square: true,
                tooltipId: 'tooltipId',
                variant: 'primary',
                href: '/',
                target: '_blank',
                glyph: 'heart',
                iconType: 'glyphicon'
            }}
        />, document.getElementById('container'));
        const button = document.querySelector('.square-button-md');
        expect(button).toBeTruthy();
        expect(button.getAttribute('class')).toBe('square-button-md _border-transparent btn btn-default');
        expect(button.getAttribute('href')).toBe('/');
        expect(button.getAttribute('target')).toBe('_blank');
        expect(button.innerHTML).toBe('<span class="glyphicon glyphicon-heart"></span>');
    });

    it('should render a button', () => {
        ReactDOM.render(<MenuItem
            item={{
                type: 'button',
                labelId: 'labelId',
                variant: 'primary',
                href: '/',
                target: '_blank',
                size: 'sm',
                glyph: 'heart',
                iconType: 'glyphicon'
            }}
        />, document.getElementById('container'));
        const button = document.querySelector('.btn');
        expect(button).toBeTruthy();
        expect(button.getAttribute('class')).toBe(' _border-transparent btn btn-default');
        expect(button.getAttribute('href')).toBe('/');
        expect(button.getAttribute('target')).toBe('_blank');
        expect(button.innerHTML).toBe('<span class="glyphicon glyphicon-heart"></span> <span>labelId</span>');
    });

    it('should render a logo', () => {
        ReactDOM.render(<MenuItem
            item={{
                type: 'logo',
                src: 'img',
                href: '/',
                target: '_blank',
                style: {}
            }}
        />, document.getElementById('container'));
        const img = document.querySelector('img');
        expect(img).toBeTruthy();
        expect(img.getAttribute('src')).toBe('img');
        const link = document.querySelector('a');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toBe('/');
        expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should render a link', () => {
        ReactDOM.render(<MenuItem
            item={{
                type: 'link',
                labelId: 'labelId',
                href: '/',
                target: '_blank',
                glyph: 'heart',
                iconType: 'glyphicon'
            }}
        />, document.getElementById('container'));
        const link = document.querySelector('a');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toBe('/');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.innerHTML).toBe('<span class="glyphicon glyphicon-heart"></span> <span>labelId</span>');
    });

    it('should render a dropdown', () => {
        const Component = () => <li className="custom-menu-item">Custom Component</li>;
        ReactDOM.render(<MenuItem
            item={{
                type: 'dropdown',
                id: 'dropdown-01',
                noCaret: false,
                style: {},
                labelId: 'labelId',
                glyph: 'heart',
                iconType: 'glyphicon',
                className: 'dropdown-01',
                items: [
                    { Component },
                    { type: 'divider' },
                    {
                        type: 'link',
                        labelId: 'labelIdItem',
                        href: '/',
                        target: '_blank',
                        glyph: 'heart',
                        iconType: 'glyphicon'
                    }
                ]
            }}
        />, document.getElementById('container'));
        const dropdown = document.querySelector('.dropdown-01');
        expect(dropdown).toBeTruthy();

        const dropdownToggle = document.querySelector('.dropdown-toggle');
        expect(dropdownToggle).toBeTruthy();
        expect(dropdownToggle.innerHTML).toBe('<span class="glyphicon glyphicon-heart"></span> <span>labelId</span> <span class="caret"></span>');

        const dropdownMenuItems = document.querySelectorAll('.dropdown-menu li');
        expect(dropdownMenuItems.length).toBe(3);

        expect(dropdownMenuItems[0].innerText).toBe('Custom Component');
        expect(dropdownMenuItems[1].getAttribute('class')).toBe('divider');
        expect(dropdownMenuItems[2].innerText).toBe('labelIdItem');
    });

    it('should render a custom component', () => {
        const Component = ({ component }) => {
            const ItemComponent = component;
            return <ItemComponent label={'Custom Component'} />;
        };
        const CustomMenuItemComponent = ({ label }) => <li className="custom-menu-item">{label}</li>;
        ReactDOM.render(<MenuItem
            item={{ Component }}
            menuItemComponent={CustomMenuItemComponent}
        />, document.getElementById('container'));
        const customComponent = document.querySelector('.custom-menu-item');
        expect(customComponent).toBeTruthy();
        expect(customComponent.innerText).toBe('Custom Component');
    });
});
