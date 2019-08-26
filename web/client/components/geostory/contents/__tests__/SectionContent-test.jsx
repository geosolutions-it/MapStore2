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
import Content from '../SectionContent';
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';
const SCROLLABLE_CONTAINER_ID = "TEST_SCROLLABLE_CONTAINER";

import { ContentTypes } from '../../../../utils/GeoStoryUtils';

const TestScrollableContainer = ({ children, height }) => <div id={SCROLLABLE_CONTAINER_ID} style={{ height, overflowY: "auto" }} >{children}</div>;
describe('Content (Container) component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Content rendering with defaults', () => {
        ReactDOM.render(<Content />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-content')).toExist();
        expect(container.querySelector('.ms-content.ms-content-unknown')).toExist();
    });
    it('Content rendering known type (text)', () => {
        ReactDOM.render(<Content {...STORY.sections[0].contents[0]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content-text');
        expect(el).toExist();
    });
    it('Content rendering known type (image)', () => {
        ReactDOM.render(<Content {...STORY.sections[0].contents[1]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content-image');
        expect(el).toExist();
    });
    it('Content rendering known SPECIAL type (column)', () => {
        ReactDOM.render(<Content type={ContentTypes.COLUMN} contents={[{ type: ContentTypes.TEXT, html: "<p id=\"SOMETHING\"></p>" }]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content-column');
        expect(el).toExist();
        expect(container.querySelector('#SOMETHING')).toExist();
    });
    it('Content has intersection observer', (done) => {
        const ID_1 = "ID_1";
        const ID_2 = "ID_2";
        ReactDOM.render((<TestScrollableContainer height="100">
            <Content id={ID_1} type="text" height={100} />
            <Content id={ID_2} onVisibilityChange={({ id, visible }) => {
                expect(id).toBe(ID_2);
                expect(visible).toBe(true);
                done();
            }} type="text" height={100} />
        </TestScrollableContainer>), document.getElementById("container"));
        const container = document.getElementById('container');
        const scrollable = container.querySelector(`#${SCROLLABLE_CONTAINER_ID}`);
        expect(scrollable).toExist();
        scrollable.scrollBy(0, 120);
    });

});
