/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect } from "react";
import {Col, Row} from 'react-bootstrap';
import Message from '../../../../I18N/Message';
import { getMessageById } from "../../../../../utils/LocaleUtils";
import Select from 'react-select';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { gsInstancesDDListSelector } from "../../../../../selectors/rulesmanager";
import GeoFence from '../../../../../api/geoserver/GeoFence';
import { error } from "../../../../../actions/notifications";
import { storeGSInstancesDDList } from "../../../../../actions/rulesmanager";

const selector = (state) => ({
    instances: gsInstancesDDListSelector(state)
});

const GSInstanceSelector = (props, context) => {
    const [gsInstancesList, setGsInstanceList] = useState(props.instances || []);
    const handleGetGSInstances = () => {
        GeoFence.getGSInstancesForDD().then(response => {
            setGsInstanceList(response.data);
            props.handleStoreGSInstancesDDList(response.data);
        }).catch(() => {
            props.onError({
                title: "rulesmanager.errorTitle",
                message: "rulesmanager.errorLoadingGSInstances"
            });
        }
        );

    };
    useEffect(() => {
        if (gsInstancesList.length) return;
        handleGetGSInstances();
    }, []);
    return (
        <Row className={props.disabled ? 'ms-disabled' : ''}>
            <Col xs={12} sm={6}>
                <Message msgId="rulesmanager.gsInstance"/>
            </Col>
            <Col xs={12} sm={6}>
                <Select
                    clearValueText={getMessageById(context.messages, "rulesmanager.placeholders.clearValueText")}
                    noResultsText={getMessageById(context.messages, "rulesmanager.placeholders.noResultsText")}
                    clearable
                    options={gsInstancesList.map(gsI => ({label: gsI.name, value: gsI.id, url: gsI.url}))}
                    value={props.selected}
                    onChange={(selectedOption) => {
                        if (!selectedOption) {
                            props.setOption({
                                key: "instance",
                                value: undefined
                            });
                        } else {
                            const { value, url, label } = selectedOption;
                            props.setOption({
                                key: "instance",
                                value: value ? { id: value, url, name: label } : undefined
                            });
                        }
                    }}
                    placeholder={getMessageById(context.messages, "rulesmanager.placeholders.gsInstances")} />
            </Col>
        </Row>);
};

GSInstanceSelector.contextTypes = {
    messages: PropTypes.object
};
export default connect(selector, (dispatch) => ({
    handleStoreGSInstancesDDList: (instances)=> dispatch(storeGSInstancesDDList(instances)),
    onError: (...args) => dispatch(error(...args))
}))(GSInstanceSelector);
