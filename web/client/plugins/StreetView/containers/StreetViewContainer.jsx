import React, {useState, useMemo} from 'react';
import {connect} from 'react-redux';
import {Glyphicon, Alert} from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';

import Message from '../../../components/I18N/Message';
import Dialog from "../../../components/misc/Dialog";
import {Resizable} from 'react-resizable';

import { enabledSelector } from '../selectors/streetView';
import GStreetViewPanel from './GStreetViewPanel';
import CyclomediaViewPanel from './CyclomediaViewPanel';
import MapillaryViewPanel from './MapillaryViewPanel';
import { toggleStreetView } from '../actions/streetView';

const panels = {
    google: GStreetViewPanel,
    cyclomedia: CyclomediaViewPanel,
    mapillary: MapillaryViewPanel
};


/**
 * Main panel of StreetView Plugin.
 * @param {boolean} props.enabled flag to show/hide the panel
 * @param {function} props.onClose callback to close the panel
 * @param {string} props.provider the Street View provider.
 * @param {object} props.panelSize the size of the panel. Example: `{"width": 500, "height": 500}`.
 * @param {object} props.providerSettings the settings specific for the provider.
 */
function Panel({enabled, onClose = () => {}, provider, panelSize, providerSettings, apiKey, resetStViewData}) {
    const margin = 10;
    const [size, setSize] = useState({width: 400, height: 300, ...panelSize});
    const StreetViewPanel = useMemo(() => panels[provider], [provider]);
    if (!enabled) {
        return null;
    }

    return (<Dialog id="street-view-dialog" bodyClassName={"street-view-window-body"} draggable
        style={{
            zIndex: 10000,
            position: "absolute",
            left: "17%",
            top: "50px",
            margin: 0,
            width: size.width}}>
        <span
            role="header"
            style={{ display: "flex", justifyContent: "space-between" }}
        >
            <span>
                <Message msgId={"streetView.title"} />
            </span>
            <button onClick={() => onClose()} className="close">
                <Glyphicon glyph="1-close" />
            </button>
        </span>
        <div
            role="body"
            style={ { height: size.height }}
        >
            <Resizable
                width={size.width}
                height={size.height}
                onResize={(event, {size: newSize}) => {setSize(newSize);}}
            >
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    width: size.width,
                    height: size.height
                }}>
                    {StreetViewPanel
                        ? <StreetViewPanel
                            resetStViewData={resetStViewData}
                            providerSettings={providerSettings}
                            apiKey={apiKey}
                            enabled={enabled}
                            size={size}
                            style={{
                                flex: 1,
                                margin: margin,
                                height: `calc(100% - ${2 * margin}px)`,
                                width: `calc(100% - ${2 * margin}px)`
                            }}/>
                        : <Alert bsStyle="danger">Unknown provider {provider}</Alert>}
                </div>
            </Resizable>
        </div>
    </Dialog>);

}

const SVPanel = connect(createStructuredSelector({
    enabled: enabledSelector
}), {
    onClose: () => toggleStreetView()
})(Panel);

export default SVPanel;
