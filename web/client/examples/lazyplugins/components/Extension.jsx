import React from "react";
import Message from "../../../components/I18N/Message";

const Extension = ({ value = 0, onIncrease }) => {
    return <div style={{ top: "600px", zIndex: 1000 }}><span><Message msgId="myplugin.message"/>{value}</span><button onClick={onIncrease}>+</button></div>;
};

export default Extension;
