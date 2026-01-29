/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import { Grid, Row, Col, Glyphicon } from 'react-bootstrap';
import Selectors from './attributeselectors';
import Message from '../../../I18N/Message';
import Api from '../../../../api/geoserver/GeoFence';


export default ({rule = {}, setOption = () => {}, active = true, gsInstancesList = []}) => {
    const {grant, layer, workspace} = rule;
    const showInfo = grant !== "DENY" && layer && !workspace;
    const isStandAloneGeofence = Api.getRuleServiceType() === 'geofence';
    let rulesSelectors = [];
    if (isStandAloneGeofence) {
        // adding this condition to only render selectors if:
        //   - An instance is selected AND instances list is loaded (to resolve URL for workspace/layer fetch)
        //   - OR no instance is selected yet (allow user to pick one first)
        if ((rule?.instance && gsInstancesList.length) || !rule?.instance) {
            const instanceId = rule?.instance?.id;
            const ruleInstance = gsInstancesList.find(gs => gs.id === instanceId) ?? rule?.instance;

            rulesSelectors = [
                <Selectors.GSInstance key="instance" selected={rule?.instance?.id} setOption={setOption}/>,
                <>{ !!rule.id && (<Selectors.Priority key="priority" selected={rule.priority} setOption={setOption}/>) }</>,
                <Selectors.Role key="rolename" selected={rule.rolename} setOption={setOption} />,
                <Selectors.User key="username" selected={rule.username} setOption={setOption} />,
                <Selectors.Ip key="ip-address" selected={rule.ipaddress} setOption={setOption}/>,
                <Selectors.Service key="service" selected={rule.service} setOption={setOption}/>,
                <Selectors.Request key="request" selected={rule.request} service={rule.service} setOption={setOption}/>,
                <Selectors.Workspace key="workspace" selected={rule.workspace} setOption={setOption} gsInstanceURL={ruleInstance?.url} disabled={!ruleInstance?.id}/>,
                <Selectors.Layer key="layer" selected={rule.layer} workspace={rule.workspace} setOption={setOption} gsInstanceURL={ruleInstance?.url} disabled={!ruleInstance?.id}/>,
                <Selectors.ValidityPeriod key="validityPeriod" selectedStart={rule.validafter || rule.validAfter} selectedEnd={rule.validbefore || rule.validBefore} setOption={setOption} />,
                <Selectors.Access key="access" selected={rule.grant} workspace={rule.workspace} setOption={setOption}/>];
        }
    } else {
        rulesSelectors = [
            <>{ !!rule.id && (<Selectors.Priority key="priority" selected={rule.priority} setOption={setOption}/>) }</>,
            <Selectors.Role key="rolename" selected={rule.rolename} setOption={setOption}/>,
            <Selectors.User key="username" selected={rule.username} setOption={setOption}/>,
            <Selectors.Ip key="ip-address" selected={rule.ipaddress} setOption={setOption}/>,
            <Selectors.Service key="service" selected={rule.service} setOption={setOption}/>,
            <Selectors.Request key="request" selected={rule.request} service={rule.service} setOption={setOption}/>,
            <Selectors.Workspace key="workspace" selected={rule.workspace} setOption={setOption}/>,
            <Selectors.Layer key="layer" selected={rule.layer} workspace={rule.workspace} setOption={setOption}/>,
            <Selectors.ValidityPeriod key="validityPeriod" selectedStart={rule.validafter || rule.validAfter} selectedEnd={rule.validbefore || rule.validBefore} setOption={setOption} />,
            <Selectors.Access key="access" selected={rule.grant} workspace={rule.workspace} setOption={setOption}/>];
    }
    return (
        <Grid className="ms-rule-editor" fluid style={{width: '100%', display: active ? 'block' : 'none'}}>
            {rulesSelectors}
            {showInfo && (<Row>
                <Col xs={12}>
                    <span>
                        <div className="m-label m-caption text-center">
                            <Glyphicon glyph="info-sign"/>
                            <Message msgId="rulesmanager.selectworkspace"/>
                        </div>
                    </span>
                </Col>
            </Row>)}
        </Grid>
    );
};
