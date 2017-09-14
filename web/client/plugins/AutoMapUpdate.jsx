/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const {manageAutoMapUpdate, updateMapInfoOnLogin} = require('../epics/automapupdate');
const {autoMapUpdateSelector} = require('../selectors/automapupdate');
const {setControlProperty} = require('../actions/controls');
const {refresh} = require('../epics/layers');

const OverlayProgressBar = require('../components/misc/progressbars/OverlayProgressBar/OverlayProgressBar');

/**
  * AutoMapUpdate Plugin. It sends a notification to update old maps (version < 2)
  * @class AutoMapUpdate
  * @memberof plugins
  * @static
  */

class AutoMapUpdate extends React.Component {
    static propTypes = {
        options: PropTypes.object,
        loading: PropTypes.bool,
        count: PropTypes.number,
        length: PropTypes.number,
        label: PropTypes.string,
        unit: PropTypes.string,
        onUpdateOptions: PropTypes.func,
        spinner: PropTypes.string
    };

    static defaultProps = {
        loading: false,
        count: 0,
        length: 0,
        label: 'autorefresh.updating',
        unit: 'autorefresh.layers',
        options: {
            bbox: true,
            search: true,
            dimensions: true,
            title: false
        },
        onUpdateOptions: () => {}
    };

    componentWillMount() {
        this.props.onUpdateOptions(this.props.options);
    }

    render() {
        return (
            <OverlayProgressBar
                loading={this.props.loading}
                count={this.props.count}
                length={this.props.length}
                label={this.props.label}
                unit={this.props.unit}
                spinner={this.props.spinner}/>
        );
    }
}

const AutoMapUpdatePlugin = connect(autoMapUpdateSelector, {
    onUpdateOptions: setControlProperty.bind(null, 'mapUpdate', 'options')
})(AutoMapUpdate);

module.exports = {
    AutoMapUpdatePlugin,
    reducers: {},
    epics: {manageAutoMapUpdate, updateMapInfoOnLogin, refresh}
};
