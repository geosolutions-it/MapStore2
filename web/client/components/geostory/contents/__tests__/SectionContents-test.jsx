/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import SectionContents from '../SectionContents';
import { createSink } from "recompose";

describe('SectionContents component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('SectionContents rendering with defaults', () => {
        ReactDOM.render(<SectionContents className="TEST_SECTION"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.TEST_SECTION');
        expect(el).toExist();
    });
    it('SectionContents handlers add and update path transformation for components', done => {
        const SECTION_ID = "TEST_ID";
        const CLASS_NAME = "TEST_SECTION";
        const CONTENT_TEST_ID = "CONTENT_TEST_ID";
        const TEST_NEW_SECTION = {type: "something"};
        const TEST_VALUE = "TEST_VALUE";

        const DummyContentComponent = createSink(({id, add, update}) => {
            add('contents', id, TEST_NEW_SECTION);
            update('entry', TEST_VALUE);
        });

        ReactDOM.render((<SectionContents
            add={(path, id, value) => {
                // NOTE: inside the content the path has both Section and Content path
                // this is the combination of SectionContents and Content enhancer
                // so this is needed to manage new contents
                expect(path).toBe(`sections[{"id": "${SECTION_ID}"}].contents[{"id": "${id}"}].contents`);
                expect(id).toBe(CONTENT_TEST_ID);
                expect(value).toBe(TEST_NEW_SECTION);
            }}
            update={(path, value) => {
                expect(path).toBe(`sections[{"id": "${SECTION_ID}"}].contents[{"id": "${CONTENT_TEST_ID}"}].entry`);
                expect(value).toBe(TEST_VALUE);
                done();
            }}
            sectionId={SECTION_ID}
            className={CLASS_NAME}
            contents={[{ id: CONTENT_TEST_ID}]}
            ContentComponent={DummyContentComponent} />), document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.TEST_SECTION');
        expect(el).toExist();
    });
});
