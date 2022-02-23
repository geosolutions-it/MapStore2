import expect from 'expect';
import { onShowLogin } from '../login';
import { SET_CONTROL_PROPERTY } from '../controls';
import {isFunction} from 'lodash';


describe('login actions', () => {
    describe('onShowLogin', () => {
        it('default', () => {
            const {type, control, property, value } = onShowLogin();
            expect(type).toEqual(SET_CONTROL_PROPERTY);
            expect(control).toEqual("LoginForm");
            expect(property).toEqual("enabled");
            expect(value).toEqual(true);
        });
        it('multiple provider', () => {
            const {type, control, property, value } = onShowLogin([{"type": "openID", "provider": "google"}, {"type": "basic", "provider": "geostore"}]);
            expect(type).toEqual(SET_CONTROL_PROPERTY);
            expect(control).toEqual("LoginForm");
            expect(property).toEqual("enabled");
            expect(value).toEqual(true);
        });
        it('openID provider', () => {
            const ret = onShowLogin([{"type": "openID", "provider": "google"}]);
            expect(isFunction(ret)).toBeTruthy();
            // avoid to execute ret that changes location
        });
    });
});
