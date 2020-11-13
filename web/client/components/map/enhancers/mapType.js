

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
    /*
    function WithMapType(props) {
        const isMounted = useRef(true);
        useEffect(() => {
            isMounted.current = true;
            return () => {
                isMounted.current = false;
            };
        }, []);
        const [plugins, setPlugins] = useState(DEFAULT_MAP_PLUGINS);
        useEffect(() => {
            if (isMounted.current && props.mapType) {
                import('../plugins/' + props.mapType + '.js')
                    .then((mod) => {
                        setPlugins(mod.default());
                    });
            }
        }, [props.mapType]);
        return <Component {...props} plugins={plugins}/>;
    }
    */

    class WithMapType extends React.Component {

        static propTypes = {
            mapType: PropTypes.string
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
                        }
                    });
            }
        }
    }

    return WithMapType;
}

export default mapType;
