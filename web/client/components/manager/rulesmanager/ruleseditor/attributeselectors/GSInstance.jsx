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
import { loadGSInstancesForDD } from "../../../../../observables/rulesmanager";
import { getMessageById } from "../../../../../utils/LocaleUtils";
import Select from 'react-select';
import PropTypes from "prop-types";

const GSInstanceSelector = (props, context) => {
    const [gsInstanceList, setGsInstanceList] = useState([]);
    useEffect(() => {
        const subscription = loadGSInstancesForDD().subscribe(
            (response) => {
                setGsInstanceList(response.data);
            },
            (error) => {
                console.error('Error fetching data:', error);
                props.onError({
                    title: "rulesmanager.errorTitle",
                    message: "rulesmanager.errorLoadingRoles"
                });
            }
        );
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    return (
        <Row className={props.disabled ? 'ms-disabled' : ''}>
            <Col xs={12} sm={6}>
                <Message msgId="rulesmanager.gsInstance"/>
            </Col>
            <Col xs={12} sm={6}>
                {/* <PagedCombo {...props}/> */}
                <Select
                    clearValueText={getMessageById(context.messages, "rulesmanager.placeholders.clearValueText")}
                    noResultsText={getMessageById(context.messages, "rulesmanager.placeholders.noResultsText")}
                    clearable
                    options={gsInstanceList.map(gsI => ({label: gsI.name, value: gsI.id, url: gsI.url}))}
                    value={props.selected}
                    onChange={({value, url, label}) => {
                        props.setOption({key: "instance", value: value ?  {id: value, url, name: label} : undefined});
                    }}
                    placeholder={getMessageById(context.messages, "rulesmanager.placeholders.gsInstances")} />
            </Col>
        </Row>);
};

GSInstanceSelector.contextTypes = {
    messages: PropTypes.object
};
export default GSInstanceSelector;
