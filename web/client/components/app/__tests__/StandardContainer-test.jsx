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

const StandardContainer = require('../StandardContainer');

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

describe('StandardContainer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        ConfigUtils.setLocalConfigurationFile('base/web/client/test-resources/localConfig.json');
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        ConfigUtils.setLocalConfigurationFile('localConfig.json');
        setTimeout(done);
    });


    it('creates a default app with component and plugins', () => {
        const plugins = {
            MyPlugin: {}
        };

        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({})
        };

        const componentConfig = {
            component: mycomponent
        };

        const app = ReactDOM.render(<Provider store={store}><StandardContainer plugins={plugins} componentConfig={componentConfig}/></Provider>, document.getElementById("container"));
        expect(app).toExist();
        const dom = ReactDOM.findDOMNode(app);
        expect(dom.getElementsByClassName('mycomponent').length).toBe(1);
        expect(dom.getElementsByClassName('MyPlugin').length).toBe(1);
    });
});
