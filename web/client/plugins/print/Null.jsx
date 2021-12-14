import React from "react";
import {createPlugin} from "../../utils/PluginsUtils";

export class Null extends React.Component {
    render() {
        return null;
    }
}

export default createPlugin("Null", {
    component: Null
});
