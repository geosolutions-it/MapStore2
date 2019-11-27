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
        const getModalContainer = () => document.querySelector('.modal');
        const getYesButton = () => document.querySelectorAll('.modal-footer button')[0];
        const getNoButton = () => document.querySelectorAll('.modal-footer button')[1];
        const isModalVisible = () => expect(document.querySelector('#confirm-dialog')).toExist();
        const isModalHidden = () => expect(document.querySelector('#confirm-dialog')).toNotExist();
        isModalHidden();
        expect(buttonElement).toExist();
        // open confirm
        ReactTestUtils.Simulate.click(buttonElement);
        isModalVisible();
        ReactTestUtils.Simulate.click(getModalContainer());
        // the modal closes on click out
        // this didn't happen because of Portal event bubbling caused a onClick event again on the button)
        isModalHidden();

        // open confirm again
        ReactTestUtils.Simulate.click(buttonElement);
        isModalVisible();
        // close from close button
        ReactTestUtils.Simulate.click(document.querySelector('.close'));
        isModalHidden();

        // open confirm again
        ReactTestUtils.Simulate.click(buttonElement);
        isModalVisible();
        // close from no button
        ReactTestUtils.Simulate.click(getNoButton());
        isModalHidden();

        // open confirm again
        ReactTestUtils.Simulate.click(buttonElement);
        isModalVisible();
        // confirm
        ReactTestUtils.Simulate.click(getYesButton());
        isModalHidden();
        expect(spy).toHaveBeenCalled();

    });
});
