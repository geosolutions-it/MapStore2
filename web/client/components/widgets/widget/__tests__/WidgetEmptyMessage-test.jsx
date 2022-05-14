/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import WidgetEmptyMessage from '../WidgetEmptyMessage';

describe('WidgetEmptyMessage component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });


    it('should render empty message', () => {
        ReactDOM.render(<WidgetEmptyMessage messageId="widgets.errors.nodata" glyph="sheet"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const WidgetEmptyMessageComponent = container.querySelector('.ms-widget-empty-message');
        expect(WidgetEmptyMessageComponent).toExist();
    });
});
