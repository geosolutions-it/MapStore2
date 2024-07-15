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
import StandardContainer from '../StandardContainer';
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


    it('creates a default app with component and plugins', (done) => {
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
        const container = document.getElementById("container");
        expect(container.innerHTML).toNotExist();
        ReactDOM.render(<Provider store={store}><StandardContainer plugins={plugins} componentConfig={componentConfig}/></Provider>, container, () => {
            expect(container.innerHTML).toExist();
            expect(container.getElementsByClassName('mycomponent').length).toBe(1);
            expect(container.getElementsByClassName('MyPlugin').length).toBe(1);
            done();
        });
    });
});
