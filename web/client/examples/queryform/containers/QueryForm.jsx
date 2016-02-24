/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Debug = require('../../../components/development/Debug');
const Localized = require('../../../components/I18N/Localized');
const {connect} = require('react-redux');

const QueryFormMap = require('../components/QueryFormMap');
const SmartQueryForm = require('../components/SmartQueryForm');

const QueryForm = (props) => (
    <Localized messages={props.messages} locale={props.locale}>
        <div>
            <QueryFormMap/>
            <SmartQueryForm/>
            <Debug/>
        </div>
    </Localized>
);

QueryForm.propTypes = {
    messages: React.PropTypes.object,
    locale: React.PropTypes.string
};

module.exports = connect((state) => {
    return {
        locale: state.locale && state.locale.locale,
        messages: state.locale && state.locale.messages || {}
    };
})(QueryForm);
