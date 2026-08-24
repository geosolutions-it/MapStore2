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
import { convertFromHTML, ContentState } from 'draft-js';
import ReactTestUtils from 'react-dom/test-utils';

import getLinkDecorator from '../getLinkDecorator';

describe('getLinkDecorator', () => {
    let Link;
    let entityKey;
    let contentState;
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        const LinkDecorator = getLinkDecorator({ showOpenOptionOnHover: true });
        const contentBlocks = convertFromHTML('<div>test</div>');
        contentState = ContentState.createFromBlockArray(contentBlocks);
        entityKey = contentState
            .createEntity('LINK', 'MUTABLE', { title: 'title', url: 'url' })
            .getLastCreatedEntityKey();

        Link = LinkDecorator.component;
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should have a span when rendered and show img when span is mouse entered', () => {
        ReactDOM.render(<Link entityKey={entityKey} contentState={contentState}>Link</Link>, document.getElementById("container"));
        const container = document.getElementById('container');
        const span = container.getElementsByTagName("span")[0];
        expect(span).toExist();
        expect(container.querySelector('.rdw-link-decorator-wrapper')).toExist();

        ReactTestUtils.Simulate.mouseEnter(span);
        expect(container.getElementsByTagName("img")[0]).toExist();
    });

    it('should have state initialized correctly', () => {
        const rendered = ReactDOM.render(<Link entityKey={entityKey} contentState={contentState}>Link</Link>, document.getElementById("container"));
        const m = ReactTestUtils.findAllInRenderedTree(rendered, () => true);
        expect(m[0].state.showPopOver).toBe(false);
    });

    it('should not render external popover img when geostory internal links', () => {
        const entityK = contentState
            .createEntity('LINK', 'MUTABLE', {
                url: 'url',
                targetOption: '_self',
                attributes: {
                    "data-geostory-interaction-type": "scroll",
                    "data-geostory-interaction-params": "xyz"
                }
            })
            .getLastCreatedEntityKey();
        ReactDOM.render(<Link entityKey={entityK} contentState={contentState}>Link</Link>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByTagName("img")[0]).toNotExist();
    });
});
