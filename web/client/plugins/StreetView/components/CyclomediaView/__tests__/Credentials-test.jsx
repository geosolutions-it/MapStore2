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
        ReactDOM.render(<Credentials/>, document.getElementById("container"));
        const div = getMainDiv();
        // check inputs are present
        expect(div.querySelector('input[type="text"]')).toExist();
        expect(div.querySelector('input[type="password"]')).toExist();
        // check submit button is present and disabled
        expect(div.querySelector('.street-view-credentials-form-buttons button')).toExist();
        expect(div.querySelector('.street-view-credentials-form-buttons button').disabled).toBe(true);
        expect(div).toExist();
    });
    it('Form interactions', () => {
        const handers = {
            setCredentials: () => {}
        };
        const spy = expect.spyOn(handers, 'setCredentials');
        act(() => {
            ReactDOM.render(<Credentials setCredentials={handers.setCredentials} credentials={{username: 'test', password: 'password'}}/>, document.getElementById("container"));
        });
        const div1 = getMainDiv();
        expect(div1).toNotExist();
        const button = document.getElementsByClassName('glyphicon')[0];
        expect(button).toExist();
        // click on button resets credentials
        act(() => {
            button.click();
        });
        // check credentials are reset
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toEqual(null);
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
        expect(spy.calls[1].arguments[0]).toEqual({username: 'test', password: 'newPassword'});


    });

});
