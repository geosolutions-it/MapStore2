import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import expect from 'expect';
import withConfirm from '../withConfirm';
import ToolbarButton from '../toolbar/ToolbarButton';
import ReactTestUtils from 'react-dom/test-utils';

describe('withConfirm enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withConfirm rendering with defaults', (done) => {
        const Sink = withConfirm(createSink( props => {
            expect(props).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('withConfirm tests confirm window', () => {
        const ConfirmButton = withConfirm(ToolbarButton);
        const actions = {
            callback: () => { }
        };
        const spy = expect.spyOn(actions, 'callback');
        ReactDOM.render(<ConfirmButton onClick={actions.callback}/>, document.getElementById("container"));
        const buttonElement = document.querySelector('#container button');
        const getModalContainer = () => document.querySelector('[role="dialog"]');
        const getConfirmButton = () => document.querySelectorAll('[role="dialog"] .btn')[1];
        const getCancelButton = () => document.querySelectorAll('[role="dialog"] .btn')[0];
        const isModalVisible = () => expect(getModalContainer()).toExist();
        const isModalHidden = () => expect(getModalContainer()).toNotExist();

        // Initial state - modal should be hidden
        isModalHidden();
        expect(buttonElement).toExist();

        // Test 1: Open confirm dialog
        ReactTestUtils.Simulate.click(buttonElement);
        isModalVisible();

        // Test 2: Cancel with cancel button
        ReactTestUtils.Simulate.click(getCancelButton());
        isModalHidden();

        // Test 3: Open and confirm
        ReactTestUtils.Simulate.click(buttonElement);
        isModalVisible();
        ReactTestUtils.Simulate.click(getConfirmButton());
        isModalHidden();
        expect(spy).toHaveBeenCalled();

        // Reset spy for next tests
        spy.reset();

        // Test 4: Open and check prevent hide on outside click
        ReactTestUtils.Simulate.click(buttonElement);
        isModalVisible();
        const modalBackdrop = document.querySelector('.modal-backdrop');
        ReactTestUtils.Simulate.click(modalBackdrop);
        isModalVisible();

        // Clean up by closing modal
        ReactTestUtils.Simulate.click(getCancelButton());
        isModalHidden();

    });
});
