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
const filtersEnhancer = require("./enhancers/filters");
const MapModal = require("../MapModal");
const MapSwitch = require("../../../misc/switch/SwitchPanel");
const SwitchPanel = switchEnhancer(MapSwitch);
const Message = require("../../../I18N/Message");
const SpatialFilter = require("../SimpleSpatialFilter");

const {isEmpty} = require("lodash");

const spatialMethodOptions = [
    {"id": "BBOX", "name": "queryform.spatialfilter.methods.box"},
    {"id": "Circle", "name": "queryform.spatialfilter.methods.circle"},
    {"id": "Polygon", "name": "queryform.spatialfilter.methods.poly"},
    {"id": "CQL", "name": "queryform.spatialfilter.methods.cql"}
];


module.exports = filtersEnhancer(({onMapReady, geometryState = {}, spatialField = {}, layer = {}, constraints = {}, active = false, setOption = () => {}, mapActive = false, actions = {}}) => {
    const enabled = !isEmpty(layer);
    return enabled && (
        <Grid className="ms-rule-editor" fluid style={{ width: '100%', display: active ? 'block' : 'none'}}>
            <SwitchPanel reset={() => setOption({key: "cqlFilterRead", value: ""})} title={<Message msgId="rulesmanager.cqlRead"/>} initExpanded={!!constraints.cqlFilterRead}>
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
            <SwitchPanel reset={() => setOption({key: "cqlFilterWrite", value: ""})} title={<Message msgId="rulesmanager.cqlWrite"/>} initExpanded={!!constraints.cqlFilterWrite}>
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

            <SpatialFilter
                wkt={constraints.restrictedAreaWkt}
                owner="rulesmanager"
                geometryState={geometryState}
                spatialField={spatialField}
                actions={actions}
                spatialPanelExpanded={mapActive}
                spatialMethodOptions={spatialMethodOptions}/>
            {mapActive && <MapModal onMapReady={onMapReady} layer={layer}/>}
        </Grid>);
});
