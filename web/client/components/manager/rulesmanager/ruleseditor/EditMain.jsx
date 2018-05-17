/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const {Grid} = require('react-bootstrap');
const Selectors = require("./attributeselectors");

module.exports = ({rule = {}, setOption= () => {}, active = true}) => {
    return (
        <Grid className="ms-rule-editor" fluid style={{width: '100%', display: active ? 'block' : 'none'}}>
            { !!rule.id && (<Selectors.Priority key="priority" selected={rule.priority} setOption={setOption}/>) }
            <Selectors.Role key="rolename" selected={rule.rolename} setOption={setOption}/>
            <Selectors.User key="username" selected={rule.username} setOption={setOption}/>
            <Selectors.Ip key="ip-address" selected={rule.ipaddress} setOption={setOption}/>
            <Selectors.Service key="service" selected={rule.service} setOption={setOption}/>
            <Selectors.Request key="request" selected={rule.request} service={rule.service} setOption={setOption}/>
            <Selectors.Workspace key="workspace" selected={rule.workspace} setOption={setOption}/>
            <Selectors.Layer key="layer" selected={rule.layer} workspace={rule.workspace} setOption={setOption}/>
            <Selectors.Access key="access" selected={rule.grant} workspace={rule.workspace} setOption={setOption}/>
        </Grid>
    );
};


