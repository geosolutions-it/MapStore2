import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import expect from 'expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import TestUtils from 'react-dom/test-utils';
import { StyleEditor } from '../StyleCodeEditor';


const store = configureMockStore()({map: {}});
describe("StyleEditor", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it("should show styleeditor.switchToTextareaEditor when editorType is visual", () => {
        const props = {
            code: 200,
            error: null,
            canEdit: true,
            editorType: 'visual',
            onUpdateMetadata: () => {},
            onChange: () => {},
            loading: false
        };

        render(<Provider store={store}><StyleEditor {...props}/>, document.getElementById("container")</Provider>, document.getElementById("container"));
        const toolbarButton = document.querySelector('.no-border');
        expect(toolbarButton).toExist();
        expect(toolbarButton.innerHTML).toContain("styleeditor.switchToTextareaEditor");
    });

    it("should show styleeditor.switchToVisualEditor when editorType is textarea", () => {
        const props = {
            code: 200,
            error: null,
            canEdit: true,
            editorType: 'textarea',
            onUpdateMetadata: () => {},
            onChange: () => {},
            loading: false
        };
        render(<Provider store={store}><StyleEditor {...props}/>, document.getElementById("container")</Provider>, document.getElementById("container"));
        const toolbarButton = document.querySelector('.no-border');
        expect(toolbarButton).toExist();
        expect(toolbarButton.innerHTML).toContain("styleeditor.switchToVisualEditor");
    });

    it("should call onUpdateMetadata on click toolBar ", () => {
        const props = {
            code: 200,
            error: null,
            canEdit: true,
            editorType: 'visual',
            onUpdateMetadata: () => {},
            onChange: () => {},
            loading: false
        };
        expect.spyOn(props, "onUpdateMetadata");
        render(<Provider store={store}><StyleEditor {...props}/>, document.getElementById("container")</Provider>, document.getElementById("container"));
        const toolbarButton = document.querySelector('.no-border');
        expect(toolbarButton).toExist();
        TestUtils.Simulate.click(toolbarButton);
        expect(props.onUpdateMetadata).toHaveBeenCalled();

    });
});
