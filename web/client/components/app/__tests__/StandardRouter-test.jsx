/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import StandardRouter from '../StandardRouter';
import ConfigUtils from '../../../utils/ConfigUtils';

class mycomponent extends React.Component {
    static propTypes = {
        plugins: PropTypes.object
    };

    static defaultProps = {
        plugins: {}
    };

    renderPlugins = () => {
        return Object.keys(this.props.plugins).map((plugin) => <div className={plugin}/>);
    };

    render() {
        return (<div className="mycomponent">
            {this.renderPlugins()}
        </div>);
    }
}

describe('StandardRouter', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        ConfigUtils.setLocalConfigurationFile('base/web/client/test-resources/localConfig.json');
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        document.getElementById('theme_stylesheet')?.remove();
        ConfigUtils.setLocalConfigurationFile('localConfig.json');
        setTimeout(done);
    });

    it('creates a default router app', (done) => {
        const store = {
            dispatch: () => {},
            subscribe: () => {
                return () => {};
            },
            unsubscribe: () => {},
            getState: () => ({})
        };
        const container = document.getElementById("container");
        expect(container.innerHTML).toNotExist();
        ReactDOM.render(<Provider store={store}><StandardRouter/></Provider>, container, () => {
            expect(container.innerHTML).toExist();
            done();
        });
    });

    it('creates a default router app with pages', (done) => {
        const store = {
            dispatch: () => {},
            subscribe: () => {
                return () => { };
            },
            getState: () => ({})
        };
        const pages = [{
            name: 'mypage',
            path: '/',
            component: mycomponent
        }];
        const container = document.getElementById("container");
        expect(container.innerHTML).toNotExist();
        ReactDOM.render(<Provider store={store}><StandardRouter pages={pages}/></Provider>, container, () => {
            expect(container.innerHTML).toExist();
            expect(container.getElementsByClassName('mycomponent').length).toBe(1);
            done();
        });
    });

    it('creates a default router app with pages and plugins', (done) => {
        const plugins = {
            MyPlugin: {}
        };

        const store = {
            dispatch: () => {},
            subscribe: () => {
                return () => { };
            },
            getState: () => ({})
        };
        const pages = [{
            name: 'mypage',
            path: '/',
            component: mycomponent
        }];
        const container = document.getElementById("container");
        expect(container.innerHTML).toNotExist();
        ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages}/></Provider>, container, () => {
            expect(container.innerHTML).toExist();
            expect(container.getElementsByClassName('MyPlugin').length).toBe(1);
            done();
        });
    });

    it('if we dont wait for theme no spinner is shown', (done) => {
        const plugins = {
            MyPlugin: {}
        };

        const store = {
            dispatch: () => { },
            subscribe: () => {
                return () => { };
            },
            getState: () => ({})
        };
        const pages = [{
            name: 'mypage',
            path: '/',
            component: mycomponent
        }];
        const container = document.getElementById("container");
        expect(container.innerHTML).toNotExist();
        ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages}  loadAfterTheme={false}/></Provider>, container, () => {
            expect(container.innerHTML).toExist();
            expect(container.getElementsByClassName('_ms2_init_spinner').length).toBe(0);
            done();
        });
    });
    it('if we wait for theme no spinner is shown if the theme is already loaded', (done) => {
        const plugins = {
            MyPlugin: {}
        };

        const store = {
            dispatch: () => { },
            subscribe: () => {
                return () => { };
            },
            getState: () => ({})
        };
        const pages = [{
            name: 'mypage',
            path: '/',
            component: mycomponent
        }];
        const container = document.getElementById("container");
        expect(container.innerHTML).toNotExist();
        ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages} loadAfterTheme themeLoaded/></Provider>, container, () => {
            expect(container.innerHTML).toExist();
            expect(container.getElementsByClassName('_ms2_init_spinner').length).toBe(0);
            done();
        });
    });
    it('if we wait for theme spinner is shown if the theme is not already loaded', (done) => {
        const plugins = {
            MyPlugin: {}
        };

        const store = {
            dispatch: () => { },
            subscribe: () => {
                return () => { };
            },
            getState: () => ({})
        };
        const pages = [{
            name: 'mypage',
            path: '/',
            component: mycomponent
        }];
        const container = document.getElementById("container");
        expect(container.innerHTML).toNotExist();
        ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages} loadAfterTheme themeLoaded={false} /></Provider>, container, () => {
            expect(container.innerHTML).toExist();
            expect(container.getElementsByClassName('_ms2_init_spinner').length).toBe(1);
            done();
        });
    });
    it('if we wait for theme onThemeLoaded is called when theme is loaded', (done) => {
        const plugins = {
            MyPlugin: {}
        };

        const store = {
            dispatch: () => { },
            subscribe: () => {
                return () => { };
            },
            getState: () => ({})
        };
        const pages = [{
            name: 'mypage',
            path: '/',
            component: mycomponent
        }];
        ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages} version="VERSION" themeCfg={{
            theme: "default",
            path: "base/web/client/test-resources/themes"
        }} loadAfterTheme themeLoaded={false} onThemeLoaded={done}/></Provider>, document.getElementById("container"));
    });

    it('if we wait for theme onThemeLoaded is called when theme custom is loaded', (done) => {
        const plugins = {
            MyPlugin: {}
        };

        const store = {
            dispatch: () => { },
            subscribe: () => {
                return () => { };
            },
            getState: () => ({})
        };
        const pages = [{
            name: 'mypage',
            path: '/',
            component: mycomponent
        }];
        ReactDOM.render(
            <Provider store={store}>
                <StandardRouter plugins={plugins} pages={pages} version="VERSION" themeCfg={{
                    theme: "custom",
                    path: "base/web/client/test-resources/themes"
                }} loadAfterTheme themeLoaded={false} onThemeLoaded={() => {
                    expect(document.getElementById('theme_stylesheet').href.indexOf('base/web/client/test-resources/themes/custom.css?VERSION')).toBeGreaterThan(-1);
                    done();
                }} />
            </Provider>, document.getElementById("container"));
    });
});
