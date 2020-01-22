/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import { compose } from 'recompose';
import MapViewerCmp from '../components/viewer/MapViewerCmp';
import { loadContext, clearContext } from '../../actions/context';
import MapViewerContainer from '../../containers/MapViewer';
import { createStructuredSelector } from 'reselect';
import { contextMonitoredStateSelector, pluginsSelector, currentTitleSelector } from '../../selectors/context';
/**
  * @name Context
  * @memberof pages
  * @class
  * @classdesc
  * Context page allow to load a map viewer with a configuration stored at a specific id.
  * pluginsConfig property will be downloaded using the provided contextId wuth the map.
  * If `default` map is used, the standard configuration from localConfig.plugins will be used.
  *
  * Requirements:
  *
  * - This page have to be configured in appConfig `pages`. this way
  * ```javascript
  *    pages: [
  *    //...
  *    {
  *      name: "context",
  *      path: "/context/id/{contextId}/{mapId}",
  *      component: require('path_to_/pages/Context')
  *    }]
  * ```
  * - `localConfig.json` must include an 'Context' entry in the plugins
  *
  * Then this page will be available, for example, at http://localhos:8081/#/context/id/1234/5678
  *
  * @example
  * // localConfig configuration example
  * "plugins": {
  *  "importer": [
  *         // ...
  *         {
  *             "name": "Importer",
  *            "cfg": {} // see plugin configuration
  *         }
  *     ]
  * }
*/
class Context extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        onInit: PropTypes.func,
        plugins: PropTypes.object,
        pluginsConfig: PropTypes.object,
        windowTitle: PropTypes.string,
        monitoredState: PropTypes.array,
        loadContext: PropTypes.func,
        reset: PropTypes.func,
        wrappedContainer: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        location: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        loadContext: () => {},
        reset: () => {},
        plugins: {},
        match: {
            params: {}
        },
        wrappedContainer: MapViewerContainer
    };
    componentWillMount() {
        const params = this.props.match.params;
        this.oldTitle = document.title;
        this.props.loadContext(params);
    }
    componentDidUpdate(oldProps) {
        const paramsChanged = !isEqual(this.props.match.params, oldProps.match.params);
        const newParams = this.props.match.params;

        if (paramsChanged) {
            this.props.loadContext(newParams);
        }

        if (this.props.windowTitle) {
            document.title = this.props.windowTitle;
        }
    }
    componentWillUnmount() {
        document.title = this.oldTitle;
        this.props.reset();
    }
    render() {
        return (<MapViewerCmp {...this.props} />);
    }
}

export default compose(
    connect(
        createStructuredSelector({
            pluginsConfig: pluginsSelector,
            mode: () => 'desktop',
            monitoredState: contextMonitoredStateSelector,
            windowTitle: currentTitleSelector
        }),
        {
            loadContext,
            reset: clearContext
        })
)(Context);
