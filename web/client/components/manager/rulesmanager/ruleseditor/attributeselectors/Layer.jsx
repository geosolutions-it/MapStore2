/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require("react");
const {Row, Col} = require('react-bootstrap');
const PagedCombo = require('../../../../misc/combobox/PagedCombobox');
const autoComplete = require("../../enhancers/autoComplete");
const { compose, defaultProps, withHandlers, withPropsOnChange} = require('recompose');
const {error} = require('../../../../../actions/notifications');
const localizedProps = require("../../../../misc/enhancers/localizedProps");
const {loadLayers} = require('../../../../../observables/rulesmanager');
const {connect} = require("react-redux");
const Message = require('../../../../I18N/Message');

const LayerSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.layer"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

module.exports = compose(
    connect(() => ({}), {onError: error}),
    defaultProps({
        paginated: true,
        size: 5,
        textField: "name",
        valueField: "name",
        loadData: loadLayers,
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.layer",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingLayers"
        }
    }),
    withPropsOnChange(["workspace"], ({workspace}) => {
        return {
            parentsFilter: {workspace}
        };
    }),
    withHandlers({
        onValueSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "layer", value: filterTerm});
        }
    }),
    localizedProps(["placeholder"]),
    autoComplete
)(LayerSelector);
