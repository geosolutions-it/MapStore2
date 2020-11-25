
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

function mapType(Component) {
    class WithMapType extends React.Component {

        static propTypes = {
            mapType: PropTypes.string,
            onMapTypeLoaded: PropTypes.func
        };

        static defaultProps = {
            onMapTypeLoaded: () => {}
        };

        state = {
            plugins: {}
        };

        componentDidMount() {
            this.setPlugins(this.props);
            this._isMounted = true;
        }

        componentWillUpdate(newProps) {
            if (newProps.mapType !== this.props.mapType) {
                this.setPlugins(newProps);
            }
        }

        componentWillUnmount() {
            this._isMounted = false;
        }

        render() {
            const { plugins } = this.state;
            return <Component {...this.props} plugins={plugins}/>;
        }

        setPlugins(props) {
            if (props.mapType) {
                import(/* webpackChunkName: 'map-library-[request]' */ '../plugins/' + props.mapType + '.js')
                    .then((mod) => {
                        if (this._isMounted) {
                            this.setState({
                                plugins: mod.default()
                            });
                            this.props.onMapTypeLoaded();
                        }
                    });
            }
        }
    }

    WithMapType.displayName = `${Component.displayName}WithMapType`;

    return WithMapType;
}

export default mapType;
