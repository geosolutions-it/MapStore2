import React from 'react';
import ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';
import expect from 'expect';
import BackgroundDialog from '../BackgroundDialog';

describe('test BackgroundDialog', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test render BackgroundDialog', () => {
        const actions = {
            updateThumbnail: () => {},
            onSave: () => {}
        };

        const updateThumbnailSpy = expect.spyOn(actions, 'updateThumbnail');
        const onSaveSpy = expect.spyOn(actions, 'onSave');

        const dialog = ReactDOM.render(<BackgroundDialog updateThumbnail={actions.updateThumbnail} onSave={actions.onSave}/>,
            document.getElementById("container"));
        expect(dialog).toExist();
        const node = ReactDOM.findDOMNode(dialog);
        expect(node).toExist();
        const footer = node.getElementsByClassName('modal-footer');
        expect(footer.length).toBe(1);
        const buttons = footer[0].getElementsByClassName('btn');
        expect(buttons.length).toBe(1);
        TestUtils.Simulate.click(buttons[0]);

        expect(updateThumbnailSpy).toHaveBeenCalled();
        expect(onSaveSpy).toHaveBeenCalled();
    });
});
