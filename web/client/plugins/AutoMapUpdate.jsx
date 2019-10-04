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
const {manageAutoMapUpdate} = require('../epics/automapupdate');
const {autoMapUpdateSelector} = require('../selectors/automapupdate');
const {setControlProperty} = require('../actions/controls');

const OverlayProgressBar = require('../components/misc/progressbars/OverlayProgressBar/OverlayProgressBar');

/**
  * AutoMapUpdate Plugin.
  * It sends a notification to update old maps (version < 2).
  * The notification is sent only if the user has "canEdit" permission on the map.
  * The notification will disappear after 12 seconds (See https://github.com/igorprado/react-notification-system for details)
  * The updated map is not automatically saved but the user will be prompted to do it.
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

    UNSAFE_componentWillMount() {
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
    epics: {manageAutoMapUpdate}
};
