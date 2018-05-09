/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const {Grid} = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;
const {Controlled: Codemirror} = require('react-codemirror2');
require('codemirror/lib/codemirror.css');
require('codemirror/mode/sql/sql');
const switchEnhancer = require("./enhancers/switch");
// const filtersEnhancer = require("./enhancers/filters");
const SwitchPanel = switchEnhancer(require("../../../misc/switch/SwitchPanel"));
const Message = require("../../../I18N/Message");

module.exports = ({constraints = {}, active = false, setOption= () => {}}) => {
    return (
        <Grid className="ms-rule-editor" fluid style={{ width: '100%', display: active ? 'block' : 'none'}}>
            <SwitchPanel title={<Message msgId="rulesmanager.cqlRead"/>}>
                <div style={{width: '100%'}}>
                    <ContainerDimensions>
                        {({width}) => <div style={{width}}>
                            <Codemirror
                                value={constraints.cqlFilterRead}
                                onBeforeChange={(editor, data, value) => setOption({key: "cqlFilterRead", value})}
                                options={{
                                mode: {name: "sql"},
                                lineNumbers: true,
                                lineWrapping: true
                            }}/>
                        </div>}
                        </ContainerDimensions>
                        </div>
            </SwitchPanel>
                    <SwitchPanel title={<Message msgId="rulesmanager.cqlWrite"/>}>
                        <div style={{width: '100%'}}>
                            <ContainerDimensions>
                                {({width}) => <div style={{width}}>
                                    <Codemirror
                                        value={constraints.cqlFilterWrite}
                                        onBeforeChange={(editor, data, value) => setOption({key: "cqlFilterWrite", value})}
                                        options={{
                                        mode: {name: "sql"},
                                        lineNumbers: true,
                                        lineWrapping: true
                                    }}/>
                                </div>}
                                </ContainerDimensions>
                         </div>
            </SwitchPanel>
        </Grid>);
};
