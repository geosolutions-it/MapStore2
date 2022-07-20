import expect from 'expect';
import {
    onShowLogin,
    showLoginWindow,
    hideLoginWindow,
    closeLogin,
    openIDLogin
} from '../login';
import { RESET_ERROR } from '../security';

import { SET_CONTROL_PROPERTY } from '../controls';
import {isFunction} from 'lodash';
import ConfigUtils from '../../utils/ConfigUtils';

describe('login actions', () => {
    describe('openIDLogin', () => {
        it('default with provider', () => {
            let page;
            const PROVIDER = "google";
            openIDLogin({provider: PROVIDER}, (p) => {page = p;} )();
            const geostore = ConfigUtils.getConfigProp("geoStoreUrl");
            expect(page).toEqual(`${geostore}openid/${PROVIDER}/login`);
        });
        it('custom URL', () => {
            let page;
            const PROVIDER = "google";
            const TEST_URL = "/test/path";
            openIDLogin({provider: PROVIDER, url: TEST_URL}, (p) => {page = p;} )();
            expect(page).toEqual(TEST_URL);
        });
    });
    it('showLoginWindow', () => {
        const {type, control, property, value } = showLoginWindow();
        expect(type).toEqual(SET_CONTROL_PROPERTY);
        expect(control).toEqual("LoginForm");
        expect(property).toEqual("enabled");
        expect(value).toEqual(true);
    });
    it('hideLoginWindow', () => {
        const {type, control, property, value } = hideLoginWindow();
        expect(type).toEqual(SET_CONTROL_PROPERTY);
        expect(control).toEqual("LoginForm");
        expect(property).toEqual("enabled");
        expect(value).toEqual(false);
    });
    it('closeLogin', () => {
        const actions = [];
        closeLogin()(a => actions.push(a));
        const {type, control, property, value } = actions[0];
        expect(type).toEqual(SET_CONTROL_PROPERTY);
        expect(control).toEqual("LoginForm");
        expect(property).toEqual("enabled");
        expect(value).toEqual(false);
        expect(actions[1].type).toEqual(RESET_ERROR);
    });
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
