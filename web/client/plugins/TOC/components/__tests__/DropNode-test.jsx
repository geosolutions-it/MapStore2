/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext as dragDropContext } from 'react-dnd';
import testBackend from 'react-dnd-test-backend';

import DropNode, { formatDataId } from '../DropNode';

describe('DropNode component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders children directly when sortable is false', () => {
        ReactDOM.render(
            <DropNode sortable={false} id="layer01">
                <span className="test-child">content</span>
            </DropNode>,
            document.getElementById("container")
        );
        const child = document.querySelector('.test-child');
        expect(child).toBeTruthy();
        expect(child.innerHTML).toBe('content');
        const dropNode = document.querySelector('.ms-drop-node');
        expect(dropNode).toBeFalsy();
    });

    it('renders Drop wrapper with correct data-id when sortable is true', () => {
        const WrappedDropNode = dragDropContext(testBackend)(
            () => (
                <DropNode sortable id="layer01" sort={{}}>
                    <span className="test-child">content</span>
                </DropNode>
            )
        );
        ReactDOM.render(<WrappedDropNode />, document.getElementById("container"));
        const dropNode = document.querySelector('.ms-drop-node');
        expect(dropNode).toBeTruthy();
        expect(dropNode.getAttribute('data-id')).toBe('node-layer01');
        expect(dropNode.getAttribute('data-node-id')).toBe('layer01');
    });

    it('renders correct data-id for ids with special characters', () => {
        const WrappedDropNode = dragDropContext(testBackend)(
            () => (
                <DropNode sortable id="Wells by Status (Active)" sort={{}}>
                    <span>content</span>
                </DropNode>
            )
        );
        ReactDOM.render(<WrappedDropNode />, document.getElementById("container"));
        const dropNode = document.querySelector('.ms-drop-node');
        expect(dropNode).toBeTruthy();
        const dataId = dropNode.getAttribute('data-id');
        expect(dataId).toBe('node-Wells-by-Status--Active-');
        const found = document.querySelector(`[data-id="${dataId}"]`);
        expect(found).toBeTruthy();
        expect(found).toBe(dropNode);
    });

    it('includes position in data-id', () => {
        const WrappedDropNode = dragDropContext(testBackend)(
            () => (
                <DropNode sortable id="layer01" position="before" sort={{}}>
                    <span>content</span>
                </DropNode>
            )
        );
        ReactDOM.render(<WrappedDropNode />, document.getElementById("container"));
        const dropNode = document.querySelector('.ms-drop-node');
        expect(dropNode).toBeTruthy();
        expect(dropNode.getAttribute('data-id')).toBe('node-layer01-before');
    });

    it('applies nodeType as className', () => {
        const WrappedDropNode = dragDropContext(testBackend)(
            () => (
                <DropNode sortable id="layer01" nodeType="layers" sort={{}}>
                    <span>content</span>
                </DropNode>
            )
        );
        ReactDOM.render(<WrappedDropNode />, document.getElementById("container"));
        const dropNode = document.querySelector('.ms-drop-node.layers');
        expect(dropNode).toBeTruthy();
    });

    describe('formatDataId', () => {

        it('returns prefixed id for a simple string', () => {
            expect(formatDataId('layer01')).toBe('node-layer01');
        });

        it('replaces dots with dashes', () => {
            expect(formatDataId('group.layer01')).toBe('node-group-layer01');
        });

        it('replaces colons with dashes', () => {
            expect(formatDataId('ns:layer01')).toBe('node-ns-layer01');
        });

        it('replaces spaces with dashes', () => {
            expect(formatDataId('my layer')).toBe('node-my-layer');
        });

        it('replaces parentheses with dashes', () => {
            expect(formatDataId('Wells (Active)')).toBe('node-Wells--Active-');
        });

        it('replaces brackets with dashes', () => {
            expect(formatDataId('layer[0]')).toBe('node-layer-0-');
        });

        it('replaces double quotes with dashes', () => {
            expect(formatDataId('12" pipe')).toBe('node-12--pipe');
        });

        it('replaces single quotes with dashes', () => {
            expect(formatDataId("Well's")).toBe('node-Well-s');
        });

        it('preserves underscores and hyphens', () => {
            expect(formatDataId('my_layer-01')).toBe('node-my_layer-01');
        });

        it('handles multiple special characters together', () => {
            expect(formatDataId('odnr_geology:Wells by Status (Active)'))
                .toBe('node-odnr_geology-Wells-by-Status--Active-');
        });

        it('appends position when provided', () => {
            expect(formatDataId('layer01', 'before')).toBe('node-layer01-before');
            expect(formatDataId('layer01', 'after')).toBe('node-layer01-after');
        });

        it('does not append position when position is falsy', () => {
            expect(formatDataId('layer01', null)).toBe('node-layer01');
            expect(formatDataId('layer01', '')).toBe('node-layer01');
            expect(formatDataId('layer01', undefined)).toBe('node-layer01');
        });

        it('extracts last part of dot-separated id when lastId is true', () => {
            expect(formatDataId('parentGroup.childGroup', null, true)).toBe('node-childGroup');
            expect(formatDataId('a.b.c', null, true)).toBe('node-c');
        });

        it('uses full id when lastId is false', () => {
            expect(formatDataId('parentGroup.childGroup', null, false)).toBe('node-parentGroup-childGroup');
        });

        it('combines lastId and position', () => {
            expect(formatDataId('parent.child', 'before', true)).toBe('node-child-before');
        });

        it('produces data-id values usable in querySelector with special characters', () => {
            const ids = [
                'Wells by Status (Active)',
                'odnr_geology:Wells[0]',
                '12" pipe',
                "Well's layer",
                'layer+name~test'
            ];
            ids.forEach(rawId => {
                const dataId = formatDataId(rawId);
                const div = document.createElement('div');
                div.setAttribute('data-id', dataId);
                document.body.appendChild(div);
                const found = document.querySelector(`[data-id="${dataId}"]`);
                expect(found).toBeTruthy();
                expect(found).toBe(div);
                document.body.removeChild(div);
            });
        });
    });
});
