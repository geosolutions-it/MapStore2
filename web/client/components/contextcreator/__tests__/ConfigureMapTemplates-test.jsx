/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect';
import { setObservableConfig } from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';
import ConfigureMapTemplate from '../ConfigureMapTemplates';
setObservableConfig(rxjsConfig);

describe('ConfigureMapTemplate component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ConfigureMapTemplate with defaults', () => {
        ReactDOM.render(<ConfigureMapTemplate/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('configure-map-templates-transfer')[0]).toExist();
    });
    it('ConfigureMapTemplate template tools', () => {
        const template = {
            id: 1,
            name: 'template',
            description: 'desc'
        };

        const actions = {
            onEditTemplate: () => {},
            onDelete: () => {}
        };
        const onEditTemplateSpy = expect.spyOn(actions, 'onEditTemplate');
        const onDeleteSpy = expect.spyOn(actions, 'onDelete');

        ReactDOM.render(<ConfigureMapTemplate mapTemplates={[template]} onEditTemplate={actions.onEditTemplate} onDelete={actions.onDelete}/>,
            document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('configure-map-templates-transfer')[0]).toExist();

        const sideCard = container.getElementsByClassName('mapstore-side-card')[0];
        expect(sideCard).toExist();
        const toolButtons = sideCard.getElementsByTagName('button');
        expect(toolButtons.length).toBe(2);

        TestUtils.Simulate.click(toolButtons[0]);
        TestUtils.Simulate.click(toolButtons[1]);

        expect(onEditTemplateSpy).toHaveBeenCalled();

        // Find the confirm dialog
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toExist();

        // Find and click the confirm button (second button)
        const buttons = dialog.querySelectorAll('.btn');
        expect(buttons.length).toBe(2);
        const confirmButton = buttons[1];
        expect(confirmButton).toExist();

        TestUtils.Simulate.click(confirmButton);
        expect(onDeleteSpy).toHaveBeenCalled();
    });
    it('ConfigureMapTemplate name is editable in SaveDialog when editedTemplate is not provided', () => {
        const template = {
            id: 1,
            name: 'template',
            description: 'desc'
        };

        ReactDOM.render(<ConfigureMapTemplate showUploadDialog mapTemplates={[template]}/>, document.getElementById("container"));

        const dialog = document.getElementsByClassName('ms-map-properties')[0];
        expect(dialog).toExist();
        const input = Array.prototype.filter.call(dialog.getElementsByTagName('input'), inputEl => inputEl.getAttribute('placeholder') === 'saveDialog.namePlaceholder')[0];
        expect(input).toExist();

        input.value = 'x';
        TestUtils.Simulate.change(input);

        expect(input.value).toBe('x');
    });
});
