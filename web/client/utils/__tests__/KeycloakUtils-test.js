import expect from 'expect';
import Rx from 'rxjs';
import { loginSuccess, refreshSuccess } from '../../actions/security';


import { dynamicImportScript, getKeycloakClient, monitorKeycloak, clearClients, CLOSE_KEYCLOAK_MONITOR} from '../KeycloakUtils';
const TEST_RESOURCES_BASE = 'base/web/client/test-resources/';
const MOCK_URL = `${TEST_RESOURCES_BASE}js/keycloak.js`;
import { TOKEN, TOKEN_PARSED, REFRESH_TOKEN, REFRESH_TOKEN_PARSED } from '../../test-resources/jwtSampleTokens';

const PROVIDER = {provider: "keycloak", config: { "auth-server-url": TEST_RESOURCES_BASE, resource: "mapstore-client" }, debounceTime: 0};
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
            getKeycloakClient(PROVIDER).then((kc) => {
                expect(kc).toBeTruthy();
                expect(kc.init).toBeTruthy();
                expect(kc.mock).toBeTruthy();
                done();
            }).catch(e => done(e));
        });

    });
    describe('monitorKeycloak', () => {
        const setAuthenticated = (kc, {token = TOKEN, tokenParsed = TOKEN_PARSED, refreshToken = REFRESH_TOKEN, refreshTokenParsed = REFRESH_TOKEN_PARSED} = {}) => {
            kc.authenticated = true;
            kc.token = token;
            kc.tokenParsed = tokenParsed;
            kc.refreshToken = refreshToken;
            kc.refreshTokenParsed = refreshTokenParsed;
        };
        // Using cache influences the spy behavior, so we need to clear it
        const MOCK_STATE_LOGGED_IN = {security: {user: {some: "data"}, access_token: TOKEN, refresh_token: REFRESH_TOKEN, authProvider: PROVIDER.provider}};
        const MOCK_STATE_LOGGED_OUT = {security: {}};
        afterEach((done) => {
            clearClients();
            done();
        });
        it('init', (done) => {
            const provider = PROVIDER;
            getKeycloakClient(provider).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();
                const loginSpy = expect.spyOn(kc, "login").andCallThrough();
                const actionSubject = new Rx.Subject();
                const action$ = actionSubject.asObservable();
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                const store = {getState: () => (MOCK_STATE_LOGGED_OUT)};
                kc.afterInit = () => {
                    expect(initSpy).toHaveBeenCalled();
                    expect(initSpy.calls.length).toBe(1);
                    expect(loginSpy).toNotHaveBeenCalled();
                    actionSubject.next({type: CLOSE_KEYCLOAK_MONITOR});  // avoid infinite loop
                    done();
                };
                epic(action$, store).subscribe( () => {

                });
            });

        });
        it('re-init when no session, emulate login monitoring', (done) => {
            const provider = PROVIDER;
            getKeycloakClient(provider).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();
                const loginSpy = expect.spyOn(kc, "login").andCallThrough();
                const actionSubject = new Rx.Subject();
                const action$ = actionSubject.asObservable();
                kc.afterInit = () => {
                    expect(initSpy).toHaveBeenCalled();
                    expect(loginSpy).toNotHaveBeenCalled();
                    expect(loginSpy).toNotHaveBeenCalled();
                    if (initSpy.calls.length > 3) {
                        actionSubject.next({type: CLOSE_KEYCLOAK_MONITOR}); // avoid infinite loop
                        done();
                    }
                    if (initSpy.calls.length > 4) {
                        expect(1).toEqual(3, "initSpy.calls.length > 4");
                    }
                };

                kc.messageReceiveTimeout = 1; // reduce timeout of scheduling
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                const store = {getState: () => (MOCK_STATE_LOGGED_OUT)};
                epic(action$, store).subscribe( () => {

                });
            });
        });
        it('keycloak login', (done) => {
            const provider = {...PROVIDER, goToPage: () => {}};
            getKeycloakClient(provider).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();
                const loginSpy = expect.spyOn(kc, "login").andCallThrough();
                const spyGoToPage = expect.spyOn(provider, "goToPage").andCallThrough();

                const actionSubject = new Rx.Subject();
                const action$ = actionSubject.asObservable();
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                const store = {getState: () => (MOCK_STATE_LOGGED_OUT)};
                kc.afterInit = () => {
                    kc.login();
                };
                epic(action$, store).subscribe( action => {
                    expect(action).toBeTruthy();
                    expect(initSpy).toHaveBeenCalled(); // called twice, because of token sync
                    expect(initSpy.calls.length).toBe(1); // twice, because of the refresh
                    expect(loginSpy).toHaveBeenCalled();
                    // check action is openID login
                    expect(typeof action).toEqual("function");
                    expect(spyGoToPage).toNotHaveBeenCalled();
                    action();
                    expect(spyGoToPage).toHaveBeenCalled();
                    actionSubject.next({type: CLOSE_KEYCLOAK_MONITOR}); // avoid infinite loop
                    done();
                });
            });
        });
        it('login from MapStore', (done) => {
            const provider = PROVIDER;
            getKeycloakClient(provider).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();
                const loginSpy = expect.spyOn(kc, "login").andCallThrough();
                const actionSubject = new Rx.Subject();
                const action$ = actionSubject.asObservable();
                setAuthenticated(kc);
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                kc.afterInit = () => {
                    expect(initSpy).toHaveBeenCalled();
                    if (initSpy.calls.length === 1) {
                        expect(loginSpy).toNotHaveBeenCalled();
                    }
                    if (initSpy.calls.length === 2) { // refresh
                        actionSubject.next({type: CLOSE_KEYCLOAK_MONITOR}); // avoid infinite loop
                        done();
                    }
                };
                const store = {getState: () => (MOCK_STATE_LOGGED_IN)};
                epic(action$, store).subscribe( () => {});
                // emulate login.
                setTimeout(() => actionSubject.next(loginSuccess({}, "us", "pass", provider.provider)), 10);
            });
        });
        it('MapStore refresh token re-init lib', (done) => {
            const provider = PROVIDER;
            getKeycloakClient(provider).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();
                const loginSpy = expect.spyOn(kc, "login").andCallThrough();
                const actionSubject = new Rx.Subject();
                const action$ = actionSubject.asObservable();

                setAuthenticated(kc);
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                kc.afterInit = () => {
                    expect(initSpy).toHaveBeenCalled();
                    if (initSpy.calls.length === 1) {
                        expect(loginSpy).toNotHaveBeenCalled();
                        actionSubject.next(refreshSuccess({}, "geostore"));
                    }
                    if (initSpy.calls.length === 2) { // refresh
                        actionSubject.next({type: CLOSE_KEYCLOAK_MONITOR}); // avoid infinite loop
                        done();
                    }
                };
                const store = {getState: () => (MOCK_STATE_LOGGED_IN)};
                epic(action$, store).subscribe( () => {});
                // emulate refresh success.

            });
        });
        it('refresh because access_token expired', (done) => {
            const provider = {...PROVIDER};
            getKeycloakClient(provider).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();

                const actionSubject = new Rx.Subject();
                const action$ = actionSubject.asObservable();
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                const store = {getState: () => (MOCK_STATE_LOGGED_IN)};
                setAuthenticated(kc, {refreshTokenParsed: {exp: 1000000000000}});
                kc.afterInit = () => {
                    kc.login();
                };
                epic(action$, store).subscribe( action => {
                    expect(action).toBeTruthy();
                    expect(initSpy).toHaveBeenCalled();
                    expect(typeof action).toEqual("function"); // refresh action
                    actionSubject.next({type: CLOSE_KEYCLOAK_MONITOR}); // avoid infinite loop
                    done();
                });

            });
        });
        it('schedule refresh before the expiring of the access_token', (done) => {
            const provider = {...PROVIDER, refreshInterval: 5};
            getKeycloakClient(provider ).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();

                const actionSubject = new Rx.Subject();
                const action$ = actionSubject.asObservable();
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                const store = {getState: () => (MOCK_STATE_LOGGED_IN)};
                setAuthenticated(kc, {tokenParsed: {exp: 1000000000000}, refreshTokenParsed: {exp: 1000000000000}});
                let count = 0;
                epic(action$, store).subscribe( action => {
                    expect(initSpy).toHaveBeenCalled();
                    expect(typeof action).toEqual("function"); // refresh action
                    count++;
                    if (count > 5) {
                        actionSubject.next({type: CLOSE_KEYCLOAK_MONITOR}); // avoid infinite loop
                        done();
                    } else {
                        actionSubject.next(refreshSuccess({}, "geostore")); // emulate refresh response
                    }
                });
            });
        });
        it('keycloak logout', (done) => {
            const provider = {...PROVIDER, goToPage: () => {}};
            getKeycloakClient(provider ).then((kc) => {
                const epic = monitorKeycloak(provider);
                const initSpy = expect.spyOn(kc, "init").andCallThrough();
                const loginSpy = expect.spyOn(kc, "login").andCallThrough();

                const actionSubject = new Rx.Subject();
                const action$ = actionSubject.asObservable();
                action$.ofType = (a) => action$.filter(action => action.type === a); // Fake ofType method.
                const store = {getState: () => (MOCK_STATE_LOGGED_IN)};
                kc.afterInit = () => {
                    kc.logout();
                };
                setAuthenticated(kc);
                epic(action$, store).subscribe( action => {
                    expect(action).toBeTruthy();
                    expect(initSpy).toHaveBeenCalled();
                    expect(initSpy.calls.length).toBe(1);
                    expect(loginSpy).toNotHaveBeenCalled();
                    // check action is openID login
                    expect(typeof action).toEqual("function");

                    actionSubject.next({type: CLOSE_KEYCLOAK_MONITOR}); // avoid infinite loop
                    done();
                });
            });
        });
    });

});
