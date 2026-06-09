import React from 'react';
import { act, Simulate } from 'react-dom/test-utils';
import expect from 'expect';
import ReactDOM from 'react-dom';
import Credentials from '../Credentials';

describe('Cyclomedia Credentials', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    const getMainDiv = () => {
        return document.getElementsByClassName('street-view-credentials')[0];
    };
    it('Test for default props', () => {
        ReactDOM.render(<Credentials showCredentialsForm />, document.getElementById("container"));
        const div = getMainDiv();
        // check inputs are present
        expect(div.querySelector('input[type="text"]')).toExist();
        expect(div.querySelector('input[type="password"]')).toExist();
        // check submit button is present and disabled
        expect(div.querySelector('.street-view-credentials-form-buttons button')).toExist();
        expect(div.querySelector('.street-view-credentials-form-buttons button').disabled).toBe(true);
        expect(div).toExist();
    });
    it('not show if showCredentialsForm is false', () => {
        ReactDOM.render(<Credentials showCredentialsForm={false}/>, document.getElementById("container"));
        const div = getMainDiv();
        expect(div).toNotExist();
        // check cancel button is present

        const button = document.getElementsByClassName('glyphicon')[0];
        expect(button).toExist();
    });
    it('cancel calls setShowCredentialsForm with false', () => {
        const handlers = {
            setShowCredentialsForm: () => {}
        };
        const spy = expect.spyOn(handlers, 'setShowCredentialsForm');
        ReactDOM.render(<Credentials showCredentialsForm setShowCredentialsForm={handlers.setShowCredentialsForm} credentials={{username: 'test', password: 'password'}}/>, document.getElementById("container"));
        const div = getMainDiv();
        expect(div.querySelector('.street-view-credentials-form-buttons button')).toExist();
        // click on cancel button calls setHasCredentials
        act(() => {
            div.querySelector('.street-view-credentials-form-buttons button').click();
        }
        );
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toEqual(false);
    });
    it('Form interactions', () => {
        const handlers = {
            setCredentials: () => {}
        };
        const spy = expect.spyOn(handlers, 'setCredentials');
        act(() => {
            ReactDOM.render(<Credentials showCredentialsForm setCredentials={handlers.setCredentials} credentials={{username: 'test', password: 'password'}}/>, document.getElementById("container"));
        });
        const div2 = getMainDiv();
        // credentials are maintained internally
        expect(div2.querySelector('input[type="text"]').value).toBe('test');
        expect(div2.querySelector('input[type="password"]').value).toBe('password');
        // check submit button is present and enabled
        expect(div2.querySelector('.street-view-credentials-form-buttons button')).toExist();
        expect(div2.querySelector('.street-view-credentials-form-buttons button').disabled).toBe(false);
        // change password
        act(() => {
            // trigger change event
            Simulate.change(div2.querySelector('input[type="password"]'), {target: {value: 'newPassword'}});
        });
        // submit button calls setCredentials
        act(() => {
            div2.querySelector('.street-view-credentials-form-buttons button').click();
        });
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toEqual({username: 'test', password: 'newPassword'});


    });
    it('should show error alert when isCredentialsInvalid is true', () => {
        act(() => {
            ReactDOM.render(<Credentials showCredentialsForm isCredentialsInvalid credentials={{username: 'test', password: 'password'}}/>, document.getElementById("container"));
        });
        const div = getMainDiv();
        const errorAlert = div.querySelector('.alert-danger');
        expect(errorAlert).toExist();
    });
    it('should not show cancel button when isCredentialsInvalid is true', () => {
        act(() => {
            ReactDOM.render(<Credentials showCredentialsForm isCredentialsInvalid credentials={{username: 'test', password: 'password'}}/>, document.getElementById("container"));
        });
        const div = getMainDiv();
        const buttons = div.querySelectorAll('.street-view-credentials-form-buttons button');
        // Only submit button should be present, no cancel button
        expect(buttons.length).toBe(1);
    });
    it('should show cancel button when isCredentialsInvalid is false and credentials exist', () => {
        act(() => {
            ReactDOM.render(<Credentials showCredentialsForm isCredentialsInvalid={false} credentials={{username: 'test', password: 'password'}}/>, document.getElementById("container"));
        });
        const div = getMainDiv();
        const buttons = div.querySelectorAll('.street-view-credentials-form-buttons button');
        // Both submit and cancel buttons should be present
        expect(buttons.length).toBe(2);
    });

});
