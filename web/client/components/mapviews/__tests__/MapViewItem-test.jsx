/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import { DragDropContext as dragDropContext } from 'react-dnd';
import testBackend from 'react-dnd-test-backend';

import MapViewItem from '../MapViewItem';

const DndMapViewItem = dragDropContext(testBackend)(({ children, ...props }) => (
    <ul><MapViewItem {...props} /></ul>
));

describe('MapViewItem component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default props', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test View" />, document.getElementById("container"));
        const item = document.querySelector('.ms-map-views-item');
        expect(item).toBeTruthy();
    });

    it('should display the title', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="My View" />, document.getElementById("container"));
        const titleNode = document.querySelector('.ms-map-views-item-title');
        expect(titleNode).toBeTruthy();
        expect(titleNode.innerHTML).toBe('My View');
    });

    it('should set correct data-id attribute', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" />, document.getElementById("container"));
        const item = document.querySelector('.ms-map-views-item');
        expect(item).toBeTruthy();
        expect(item.getAttribute('data-id')).toBe('item-view-1');
    });

    it('should sanitize special characters in data-id', () => {
        ReactDOM.render(<DndMapViewItem id="view.with.dots" title="Test" />, document.getElementById("container"));
        const item = document.querySelector('.ms-map-views-item');
        expect(item).toBeTruthy();
        expect(item.getAttribute('data-id')).toBe('item-view-with-dots');
    });

    it('should add selected class when selected is true', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" selected />, document.getElementById("container"));
        const item = document.querySelector('.ms-map-views-item.selected');
        expect(item).toBeTruthy();
    });

    it('should not add selected class when selected is false', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" selected={false} />, document.getElementById("container"));
        const item = document.querySelector('.ms-map-views-item');
        expect(item).toBeTruthy();
        expect(item.className.indexOf('selected')).toBe(-1);
    });

    it('should set opacity to 1 when not dragging', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" />, document.getElementById("container"));
        const item = document.querySelector('.ms-map-views-item');
        expect(item).toBeTruthy();
        expect(item.style.opacity).toBe('1');
    });

    it('should call onSelect when the item is clicked', () => {
        const actions = { onSelect: () => {} };
        const spy = expect.spyOn(actions, 'onSelect');
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" onSelect={actions.onSelect} />, document.getElementById("container"));
        const item = document.querySelector('.ms-map-views-item');
        expect(item).toBeTruthy();
        TestUtils.Simulate.click(item);
        expect(spy).toHaveBeenCalled();
    });

    it('should render remove button when onRemove is provided', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" onRemove={() => {}} />, document.getElementById("container"));
        const removeButton = document.querySelector('.square-button');
        expect(removeButton).toBeTruthy();
    });

    it('should not render remove button when onRemove is not provided', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" />, document.getElementById("container"));
        const removeButton = document.querySelector('.square-button');
        expect(removeButton).toBeFalsy();
    });

    it('should call onRemove when remove button is clicked', () => {
        const actions = { onRemove: () => {} };
        const spy = expect.spyOn(actions, 'onRemove');
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" onRemove={actions.onRemove} />, document.getElementById("container"));
        const removeButton = document.querySelector('.square-button');
        expect(removeButton).toBeTruthy();
        TestUtils.Simulate.click(removeButton);
        expect(spy).toHaveBeenCalled();
    });

    it('should use primary style for remove button when selected', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" selected onRemove={() => {}} />, document.getElementById("container"));
        const removeButton = document.querySelector('.square-button');
        expect(removeButton).toBeTruthy();
        expect(removeButton.className.indexOf('btn-primary') !== -1).toBe(true);
    });

    it('should use default style for remove button when not selected', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" selected={false} onRemove={() => {}} />, document.getElementById("container"));
        const removeButton = document.querySelector('.square-button');
        expect(removeButton).toBeTruthy();
        expect(removeButton.className.indexOf('btn-default') !== -1).toBe(true);
    });

    it('should render grab handle when isSortable is true', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" isSortable />, document.getElementById("container"));
        const handle = document.querySelector('.grab-handle');
        expect(handle).toBeTruthy();
    });

    it('should not render grab handle when isSortable is false', () => {
        ReactDOM.render(<DndMapViewItem id="view-1" title="Test" isSortable={false} />, document.getElementById("container"));
        const handle = document.querySelector('.grab-handle');
        expect(handle).toBeFalsy();
    });

    it('should produce correct data-id for UUID-style ids', () => {
        ReactDOM.render(<DndMapViewItem id="2f12a630-31e1-11f1-a710-3f4fb2315510" title="Test" />, document.getElementById("container"));
        const item = document.querySelector('.ms-map-views-item');
        expect(item).toBeTruthy();
        expect(item.getAttribute('data-id')).toBe('item-2f12a630-31e1-11f1-a710-3f4fb2315510');
        const found = document.querySelector(`[data-id="${item.getAttribute('data-id')}"]`);
        expect(found).toBeTruthy();
        expect(found).toBe(item);
    });
});
