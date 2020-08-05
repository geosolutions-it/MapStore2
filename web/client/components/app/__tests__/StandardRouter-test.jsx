/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const PropTypes = require('prop-types');
const React = require('react');
const ReactDOM = require('react-dom');
const {Provider} = require('react-redux');

const StandardRouter = require('../StandardRouter').default;

const ConfigUtils = require('../../../utils/ConfigUtils');

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

    it('creates a default router app', () => {
        const store = {
            dispatch: () => {},
            subscribe: () => {
                return () => {};
            },
            unsubscribe: () => {},
            getState: () => ({})
        };
        const app = ReactDOM.render(<Provider store={store}><StandardRouter/></Provider>, document.getElementById("container"));
        expect(app).toExist();
    });

    it('creates a default router app with pages', () => {
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
        const app = ReactDOM.render(<Provider store={store}><StandardRouter pages={pages}/></Provider>, document.getElementById("container"));
        expect(app).toExist();
        const dom = ReactDOM.findDOMNode(app);

        expect(dom.getElementsByClassName('mycomponent').length).toBe(1);
    });

    it('creates a default router app with pages and plugins', () => {
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
        const app = ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages}/></Provider>, document.getElementById("container"));
        expect(app).toExist();

        const dom = ReactDOM.findDOMNode(app);

        expect(dom.getElementsByClassName('MyPlugin').length).toBe(1);
    });

    it('if we dont wait for theme no spinner is shown', () => {
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
        const app = ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages}  loadAfterTheme={false}/></Provider>, document.getElementById("container"));
        expect(app).toExist();

        const dom = ReactDOM.findDOMNode(app);

        expect(dom.getElementsByClassName('_ms2_init_spinner').length).toBe(0);
    });
    it('if we wait for theme no spinner is shown if the theme is already loaded', () => {
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
        const app = ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages} loadAfterTheme themeLoaded/></Provider>, document.getElementById("container"));
        expect(app).toExist();

        const dom = ReactDOM.findDOMNode(app);

        expect(dom.getElementsByClassName('_ms2_init_spinner').length).toBe(0);
    });
    it('if we wait for theme spinner is shown if the theme is not already loaded', () => {
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
        const app = ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages} loadAfterTheme themeLoaded={false} /></Provider>, document.getElementById("container"));
        expect(app).toExist();

        const dom = ReactDOM.findDOMNode(app);

        expect(dom.getElementsByClassName('_ms2_init_spinner').length).toBe(1);
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
        const app = ReactDOM.render(<Provider store={store}><StandardRouter plugins={plugins} pages={pages} version="VERSION" themeCfg={{
            theme: "default",
            path: "base/web/client/test-resources/themes"
        }} loadAfterTheme themeLoaded={false} onThemeLoaded={done}/></Provider>, document.getElementById("container"));
        expect(app).toExist();
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
        const app = ReactDOM.render(
            <Provider store={store}>
                <StandardRouter plugins={plugins} pages={pages} version="VERSION" themeCfg={{
                    theme: "custom",
                    path: "base/web/client/test-resources/themes"
                }} loadAfterTheme themeLoaded={false} onThemeLoaded={() => {
                    expect(document.getElementById('theme_stylesheet').href.indexOf('base/web/client/test-resources/themes/custom.css?VERSION')).toBeGreaterThan(-1);
                    done();
                }} />
            </Provider>, document.getElementById("container"));
        expect(app).toExist();
    });
});
