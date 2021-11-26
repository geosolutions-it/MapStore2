import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Glyphicon} from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';

import Message from '../../../components/I18N/Message';
import Dialog from "../../../components/misc/Dialog";
import {Resizable} from 'react-resizable';

import { enabledSelector } from '../selectors/streetView';
import GStreetViewPanel from './GStreetViewPanel';
import { toggleStreetView } from '../actions/streetView';


/**
 * Main panel of StreetView Plugin.
 * @param {*} param0
 * @returns
 */
function Panel({enabled, onClose = () => {}}) {
    const margin = 10;
    const [size, setSize] = useState({width: 400, height: 300});
    if (!enabled) {
        return null;
    }
    return (<Dialog bodyClassName={"street-view-window-body"} draggable
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
                    <GStreetViewPanel
                        enabled={enabled}
                        size={size}
                        style={{
                            flex: 1,
                            margin: margin,
                            height: `calc(100% - ${2 * margin}px)`,
                            width: `calc(100% - ${2 * margin}px)`
                        }}/>
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
