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
import TagsManagerPanel from '../TagsManagerPanel';
import { act, Simulate } from 'react-dom/test-utils';

describe('TagsManagerPanel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render the empty presentation message', () => {
        ReactDOM.render(<TagsManagerPanel />, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].innerText).toBe('resourcesCatalog.newTag');
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
        const texts = document.querySelectorAll('.ms-text');
        expect(texts.length).toBe(3);
        expect(texts[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-tags');
        expect(texts[1].innerText).toBe('resourcesCatalog.noTagsAvailable');
        expect(texts[2].innerText).toBe('resourcesCatalog.noTagsAvailableDescription');
    });
    it('should trigger setNewTag', (done) => {
        ReactDOM.render(<TagsManagerPanel setNewTag={(newTag) => {
            expect(newTag).toBeTruthy();
            expect(newTag.color).toBeTruthy();
            done();
        }}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].innerText).toBe('resourcesCatalog.newTag');
        Simulate.click(buttons[0]);
    });
    it('should show new tag entry', () => {
        ReactDOM.render(<TagsManagerPanel newTag={{ name: '', description: '', color: '#ff0000' }}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(3);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(4);
        expect(buttons[0].innerText).toBe('resourcesCatalog.newTag');
        expect(buttons[0].disabled).toBe(true);
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        expect(buttons[2].children[0].getAttribute('class')).toBe('glyphicon glyphicon-floppy-disk');
        expect(buttons[3].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
    });
    it('should show new tag entry that triggers setNewTag on cancel', (done) => {
        ReactDOM.render(<TagsManagerPanel newTag={{ name: '', description: '', color: '#ff0000' }} setNewTag={(newTag) => {
            expect(newTag).toBe(null);
            done();
        }}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        const buttons = tagEntries[0].querySelectorAll('button');
        expect(buttons[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-floppy-disk');
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
        Simulate.click(buttons[1]);
    });
    it('should show new tag entry that triggers onUpdate', (done) => {
        ReactDOM.render(<TagsManagerPanel newTag={{ name: 'New tag', description: '', color: '#ff0000' }} onUpdate={(tag) => {
            expect(tag).toEqual({ name: 'New tag', description: '', color: '#ff0000' });
            done();
        }}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        const buttons = tagEntries[0].querySelectorAll('button');
        expect(buttons[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-floppy-disk');
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
        Simulate.click(buttons[0]);
    });
    it('should show tags', () => {
        ReactDOM.render(<TagsManagerPanel tags={[{ id: '01', name: '', description: '', color: '#ff0000' }]}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(4);
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        expect(buttons[2].children[0].getAttribute('class')).toBe('glyphicon glyphicon-edit');
        expect(buttons[3].children[0].getAttribute('class')).toBe('glyphicon glyphicon-trash');
    });
    it('should show tags that triggers start editing', (done) => {
        ReactDOM.render(<TagsManagerPanel tags={[{ id: '01', name: '', description: '', color: '#ff0000' }]} onStartEditing={(tag) => {
            expect(tag).toEqual({ id: '01', name: '', description: '', color: '#ff0000' });
            done();
        }}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        const buttons = tagEntries[0].querySelectorAll('button');
        expect(buttons[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-edit');
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-trash');
        Simulate.click(buttons[0]);
    });
    it('should show tags in edit mode', () => {
        ReactDOM.render(<TagsManagerPanel tags={[{ id: '01', name: '', description: '', color: '#ff0000' }]} editing={['01']}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(3);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(5);
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        expect(buttons[2].children[0].getAttribute('class')).toBe('glyphicon glyphicon-trash');
        expect(buttons[3].children[0].getAttribute('class')).toBe('glyphicon glyphicon-floppy-disk');
        expect(buttons[4].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
    });
    it('should show tags that triggers setChanges', (done) => {
        act(() => {
            ReactDOM.render(<TagsManagerPanel
                tags={[{ id: '01', name: '', description: '', color: '#ff0000' }]}
                editing={['01']}
                setChanges={() => { done(); }}
            />, document.getElementById('container'));
        });
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        const inputs = tagEntries[0].querySelectorAll('input');
        expect(inputs.length).toBe(2);
        Simulate.change(inputs[0]);
    });
    it('should show tags that triggers onUpdate', (done) => {
        act(() => {
            ReactDOM.render(<TagsManagerPanel
                tags={[{ id: '01', name: '', description: '', color: '#ff0000' }]}
                editing={['01']}
                changes={{ ['01']: { name: 'Name' } }}
                onUpdate={(tag) => {
                    expect(tag).toEqual({ id: '01', name: 'Name', description: '', color: '#ff0000' });
                    done();
                }}
            />, document.getElementById('container'));
        });
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        const buttons = tagEntries[0].querySelectorAll('button');
        expect(buttons[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-trash');
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-floppy-disk');
        expect(buttons[2].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
        Simulate.click(buttons[1]);
    });
    it('should show tags that triggers end editing', (done) => {
        ReactDOM.render(<TagsManagerPanel tags={[{ id: '01', name: '', description: '', color: '#ff0000' }]} editing={['01']} onEndEditing={(tag) => {
            expect(tag).toEqual({ id: '01', name: '', description: '', color: '#ff0000' });
            done();
        }}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        const buttons = tagEntries[0].querySelectorAll('button');
        expect(buttons[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-trash');
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-floppy-disk');
        expect(buttons[2].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
        Simulate.click(buttons[2]);
    });
    it('should show tags that triggers delete', (done) => {
        ReactDOM.render(<TagsManagerPanel tags={[{ id: '01', name: '', description: '', color: '#ff0000' }]} setShowDeleteModal={(tag) => {
            expect(tag).toEqual({ id: '01', name: '', description: '', color: '#ff0000' });
            done();
        }}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const tagEntries = document.querySelectorAll('.ms-tags-manager-entry');
        expect(tagEntries.length).toBe(1);
        const buttons = tagEntries[0].querySelectorAll('button');
        expect(buttons[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-edit');
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-trash');
        Simulate.click(buttons[1]);
    });
    it('should show pagination', () => {
        ReactDOM.render(<TagsManagerPanel totalCount={20} pageSize={10}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const paginationButtons = document.querySelectorAll('.custom a');
        expect(paginationButtons.length).toBe(4);
        expect(paginationButtons[0].innerHTML).toBe('<span aria-label="Previous"></span>');
        expect(paginationButtons[1].innerHTML).toBe('1');
        expect(paginationButtons[2].innerHTML).toBe('2');
        expect(paginationButtons[3].innerHTML).toBe('<span aria-label="Next"></span>');
    });
    it('should render the filter presentation message', (done) => {
        act(() => {
            ReactDOM.render(<TagsManagerPanel
                filterText="Tag"
                setFilterText={() => {
                    done();
                }} />, document.getElementById('container'));
        });
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].innerText).toBe('resourcesCatalog.newTag');
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
        const texts = document.querySelectorAll('.ms-text');
        expect(texts.length).toBe(3);
        expect(texts[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-tags');
        expect(texts[1].innerText).toBe('resourcesCatalog.noFilteredTagsAvailable');
        expect(texts[2].innerText).toBe('resourcesCatalog.noFilteredTagsAvailableDescription');
        Simulate.change(inputs[0]);
    });
    it('should trigger onCloseDialog', (done) => {
        ReactDOM.render(<TagsManagerPanel onCloseDialog={() => {
            done();
        }}/>, document.getElementById('container'));
        const tagsPanel = document.querySelector('.ms-tags-manager-panel');
        expect(tagsPanel).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
        Simulate.click(buttons[1]);
    });
});
