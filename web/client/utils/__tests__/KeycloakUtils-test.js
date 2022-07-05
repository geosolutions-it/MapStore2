import expect from 'expect';
import Rx from 'rxjs';

import { loginSuccess } from '../../actions/security';

import { dynamicImportScript, getKeycloakClient, monitorKeycloak, clearClients, getClient} from '../KeycloakUtils';
const TEST_RESOURCES_BASE = 'base/web/client/test-resources/';
const MOCK_URL = `${TEST_RESOURCES_BASE}js/keycloak.js`;
describe('KeycloakUtils', () => {

    describe('dynamicImportScript', () => {
        afterEach(() => {
            document.querySelector('#keycloak-script')?.remove();
            delete window.Keycloak;
            expect(window.Keycloak).toBeFalsy();
            expect(document.querySelector('#keycloak-script')).toBeFalsy();
        });
        it('load mock script', (done) => {
            dynamicImportScript(MOCK_URL).then((Keycloak) => {
                expect(Keycloak).toBeTruthy();
                const kc = new Keycloak();
                expect(kc.login).toBeTruthy();
                expect(kc.mock).toBeTruthy();
                done();
            });
        });

    });
    describe('getKeycloakClient', () => {
        afterEach(() => {
            document.querySelector('#keycloak-script')?.remove();
            delete window.Keycloak;
            clearClients();
            expect(window.Keycloak).toBeFalsy();
            expect(document.querySelector('#keycloak-script')).toBeFalsy();
        });
        it('getKeycloakClient', (done) => {
            getKeycloakClient({provider: "keycloak", config: { "auth-server-url": TEST_RESOURCES_BASE, resource: "mapstore-client" }}).then((kc) => {
                expect(kc).toBeTruthy();
                expect(kc.init).toBeTruthy();
                expect(kc.mock).toBeTruthy();
                done();
            }).catch(e => done(e));
        });

    });
    describe('monitorKeycloak', () => {
        after((done) => { // it uses the cache.
            clearClients();
            done();
        });
        it('init', (done) => {
            const provider = {provider: "keycloak", config: { "auth-server-url": TEST_RESOURCES_BASE, resource: "mapstore-client" }};
            getKeycloakClient(provider ).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();
                const loginSpy = expect.spyOn(kc, "login").andCallThrough();
                const action$ = Rx.Observable.empty();
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                epic(action$).subscribe( action => {
                    expect(action).toBeTruthy();
                    expect(initSpy).toHaveBeenCalled();
                    expect(initSpy.calls.length).toBe(1);
                    expect(loginSpy).toNotHaveBeenCalled();
                    expect(typeof action).toEqual("function"); // logout
                    done();
                });
            });

        });
        it('keycloak login', (done) => {
            const provider = {provider: "keycloak", config: { "auth-server-url": TEST_RESOURCES_BASE, resource: "mapstore-client" }};
            getKeycloakClient(provider ).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();
                const loginSpy = expect.spyOn(kc, "login").andCallThrough();

                const action$ = Rx.Observable.empty();
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                epic(action$, {getState: () => ({security: {access_token: "TOKEN", refresh_token: "TOKEN"}})}).subscribe( action => {
                    expect(action).toBeTruthy();
                    expect(initSpy).toHaveBeenCalled(); // called twice
                    expect(loginSpy).toHaveBeenCalled();
                    expect(typeof action).toEqual("function"); // logout
                    done();
                });
                setTimeout(() => kc.login(), 0);
            });
        });
    });

});
