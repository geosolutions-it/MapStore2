/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React, { useEffect, useState } from 'react';

import { Grid } from 'react-bootstrap';
import ContainerDimensions from 'react-container-dimensions';
import CodeMirror from '../../../../libs/codemirror/react-codemirror-suspense';
import switchEnhancer from './enhancers/switch';
import filtersEnhancer from './enhancers/filters';
import MapModal from '../MapModal';
import MapSwitch from '../../../misc/switch/SwitchPanel';
const SwitchPanel = switchEnhancer(MapSwitch);
import Message from '../../../I18N/Message';
import SpatialFilter from '../SimpleSpatialFilter';
import { isEmpty } from 'lodash';

const spatialMethodOptions = [
    {"id": "BBOX", "name": "queryform.spatialfilter.methods.box"},
    {"id": "Circle", "name": "queryform.spatialfilter.methods.circle"},
    {"id": "Polygon", "name": "queryform.spatialfilter.methods.poly"},
    {"id": "CQL", "name": "queryform.spatialfilter.methods.cql"}
];

function CQLFilterEditor({ active, width, ...props }) {
    const [editor, setEditor] = useState(null);
    useEffect(() => {
        if (active && width > 0 && editor) {
            editor.refresh();
        }
    }, [active, width, editor]);

    return (
        <div style={{ width }}>
            <CodeMirror
                {...props}
                options={{
                    mode: { name: 'sql' },
                    lineNumbers: true,
                    lineWrapping: true
                }}
                editorDidMount={instance => setEditor(instance)}/>
        </div>
    );
}


export default filtersEnhancer(({onMapReady, geometryState = {}, spatialField = {}, layer = {}, constraints = {}, active = false, setOption = () => {}, mapActive = false, actions = {}}) => {
    const enabled = !isEmpty(layer);
    return enabled && (
        <Grid className="ms-rule-editor" fluid style={{ width: '100%', display: active ? 'block' : 'none'}}>
            <SwitchPanel reset={() => setOption({key: "cqlFilterRead", value: ""})} title={<Message msgId="rulesmanager.cqlRead"/>} initExpanded={!!constraints.cqlFilterRead}>
                <div style={{width: '100%'}}>
                    <ContainerDimensions>
                        {({width}) => <CQLFilterEditor
                            active={active}
                            width={width}
                            value={constraints.cqlFilterRead}
                            onBeforeChange={(editor, data, value) => setOption({key: "cqlFilterRead", value})}/>}
                    </ContainerDimensions>
                </div>
            </SwitchPanel>
            <SwitchPanel reset={() => setOption({key: "cqlFilterWrite", value: ""})} title={<Message msgId="rulesmanager.cqlWrite"/>} initExpanded={!!constraints.cqlFilterWrite}>
                <div style={{width: '100%'}}>
                    <ContainerDimensions>
                        {({width}) => <CQLFilterEditor
                            active={active}
                            width={width}
                            value={constraints.cqlFilterWrite}
                            onBeforeChange={(editor, data, value) => setOption({key: "cqlFilterWrite", value})}/>}
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
