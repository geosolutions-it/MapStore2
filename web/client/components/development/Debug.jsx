/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var url = require('url');

const urlQuery = url.parse(window.location.href, true).query;

var Debug = React.createClass({
    propTypes: {
        store: React.PropTypes.object.isRequired
    },
    render() {
        let child = React.Children.only(this.props.children);
        if (__DEVTOOLS__ && urlQuery.debug) {
            const { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react');
            return (
                <div className="fill">
                    <div className="fill-debug">
                        {child}
                    </div>
                    <DebugPanel top right bottom>
                      <DevTools store={this.props.store} monitor={LogMonitor} />
                    </DebugPanel>
                </div>
            );
        }
        return child;
    }
});

module.exports = Debug;
