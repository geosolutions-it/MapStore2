import React from "react";
import Message from "../../../web/client/components/I18N/Message";

const style = {
    backgroundColor: "rgba(255,255,255,.9)",
    borderRadius: 10,
    maxWidth: 550,
    padding: 10,
    margin: 10,
    position: "absolute",
    top: 50, zIndex: 1000
};
const Extension = ({ value = 0, onIncrease, changeZoomLevel }) => {
    return (<div id="SAMPLE_EXTENSION" style={style}>
        <h2>Extension Sample</h2>
        <div>This is a sample extension plugin. The following tools demonstrate the correct binding inside MapStore</div>
        <h3>State and epics</h3>
        <div>A button like this should be visualized also in the toolbar: <br /><button onClick={onIncrease} className="btn-primary square-button btn">INC</button><br /> </div>
        <div>Clicking on that button (or on the button above) should increase this counter value: <b>{value}</b>. <br />The counter value updates should be logged in console by an epic</div>
        <i>note: the button in the toolbar can be hidden, in this case click on the "..." button</i>
        <h3>Localization</h3>
        The following text should be localized: <b><Message msgId="extension.message" /></b><br /> (you should see something like "Message!" if your language is set to en-US)
        <h3>Core action</h3>
        This button should change the zoom level to "1"
        <button onClick={() => { changeZoomLevel(1); }}>zoom to level 1</button>
    </div>);
};

export default Extension;
