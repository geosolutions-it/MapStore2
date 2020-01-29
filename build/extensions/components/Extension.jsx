import React from "react";
import Message from "../../../web/client/components/I18N/Message";

const Extension = ({ value = 0, onIncrease, changeZoomLevel }) => {
    return (<div style={{ top: "600px", zIndex: 1000 }}><span><Message msgId="extension.message"/>{value}</span>
        <button onClick={onIncrease}>+</button>
        <button onClick={() => {changeZoomLevel(1);}}>z</button>
    </div>);
};

export default Extension;
