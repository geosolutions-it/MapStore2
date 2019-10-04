/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';

import expect from 'expect';
import Contents from '../Contents';

const CONTENTS = [{
    id: 'TEST_CONTENT',
    type: 'text',
    html: '<p class="someTestContent">something</p>'
}];
const CONTENTS_2 = [...CONTENTS, {
    id: 'TEST_CONTENT_2',
    type: 'text',
    html: '<p class="someTestContent">something</p>'
}];

describe('Contents component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Contents rendering with defaults', () => {
        ReactDOM.render(<Contents className="CONTENTS_CLASS_NAME" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.CONTENTS_CLASS_NAME');
        expect(el).toExist();
    });
    it('renders components', () => {
        ReactDOM.render(<Contents className="CONTENTS_CLASS_NAME" contents={CONTENTS}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.CONTENTS_CLASS_NAME');
        expect(el).toExist();
        expect(container.querySelector(`${CONTENTS[0].id}`)).toNotExist(); // the id must be applied to the wrapper, not to the content ( to support scroll )
    });
    it('do nor render add-bar in edit mode if addButtons are not present', () => {
        ReactDOM.render(<Contents
            mode="edit"
            className="CONTENTS_CLASS_NAME"
            contents={CONTENTS} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.add-bar');
        expect(el).toNotExist();
    });
    it('addButtons rendered for every content', () => {
        ReactDOM.render(<Contents
            mode="edit"
            addButtons={[{
                id: 'test-button',
                template: "TEST_TEMPLATE"
            }]}
            className="CONTENTS_CLASS_NAME"
            contents={CONTENTS_2} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelectorAll('.add-bar').length).toBe(2);
        expect(container.querySelectorAll('.someTestContent').length).toBe(2);

    });
    it('addButtons rendering and callback', done => {
        ReactDOM.render(<Contents
            mode="edit"
            addButtons={[{
                id: 'test-button',
                template: "TEST_TEMPLATE"
            }]}
            add={(path, position, value) => {
                expect(value).toBe("TEST_TEMPLATE");
                expect(position).toBe(CONTENTS[0].id);
                expect(path).toBe('contents');
                done();
            }}
            className="CONTENTS_CLASS_NAME"
            contents={CONTENTS} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.add-bar');
        expect(el).toExist();
        ReactTestUtils.Simulate.click(document.querySelector('.add-bar button'));
        ReactTestUtils.Simulate.click(document.querySelector('#test-button'));
    });
    describe('modify handlers for content component', () => {
        it('add', done => {
            const TEST_NEW_CONTENT = "TEST_SECTION";
            const DummyContentComponent = createSink(({ add }) => {
                add('contents', "position", TEST_NEW_CONTENT);
            });
            ReactDOM.render(<Contents
                add={(path, position, v) => {
                    expect(path).toBe(`contents[{"id": "${CONTENTS[0].id}"}].contents`);
                    expect(position).toBe("position");
                    expect(v).toBe(TEST_NEW_CONTENT);
                    done();
                }}
                className="CONTENTS_CLASS_NAME"
                contents={CONTENTS}
                ContentComponent={DummyContentComponent}
            />, document.getElementById("container"));
            const container = document.getElementById('container');
            const el = container.querySelector('CONTENTS_CLASS_NAME');
            expect(el).toExist();
        });
        it('update', done => {
            const TEST_NEW_CONTENT = "TEST_SECTION";
            const TEST_VALUE = "TEST_VALUE";
            const DummyContentComponent = createSink(({ add, update }) => {
                add('contents', "position", TEST_NEW_CONTENT);
                update('entry', TEST_VALUE);
            });
            ReactDOM.render(<Contents
                update={(path, v) => {
                    expect(path).toBe(`contents[{"id": "${CONTENTS[0].id}"}].entry`);
                    expect(v).toBe(TEST_VALUE);
                    done();
                }}
                className="CONTENTS_CLASS_NAME"
                contents={CONTENTS}
                ContentComponent={DummyContentComponent}
            />, document.getElementById("container"));
            const container = document.getElementById('container');
            const el = container.querySelector('CONTENTS_CLASS_NAME');
            expect(el).toExist();
        });
        it('remove (without path, calls the remove of itself path)', done => {
            const DummyContentComponent = createSink(({ remove }) => {
                remove();
            });
            ReactDOM.render(<Contents
                remove={(path) => {
                    expect(path).toBe(`contents[{"id": "${CONTENTS[0].id}"}]`);
                    done();
                }}
                className="CONTENTS_CLASS_NAME"
                contents={CONTENTS}
                ContentComponent={DummyContentComponent}
            />, document.getElementById("container"));
            const container = document.getElementById('container');
            const el = container.querySelector('CONTENTS_CLASS_NAME');
            expect(el).toExist();
        });
        it('remove (with path, for sub-pieces)', done => {
            const DummyContentComponent = createSink(({ remove }) => {
                remove("entry");
            });
            ReactDOM.render(<Contents
                remove={(path) => {
                    expect(path).toBe(`contents[{"id": "${CONTENTS[0].id}"}].entry`);
                    done();
                }}
                className="CONTENTS_CLASS_NAME"
                contents={CONTENTS}
                ContentComponent={DummyContentComponent}
            />, document.getElementById("container"));
            const container = document.getElementById('container');
            const el = container.querySelector('CONTENTS_CLASS_NAME');
            expect(el).toExist();
        });
    });
});
