import React from "react";
import {createPlugin} from "../utils/PluginsUtils";

export class NullComponent extends React.Component {
    render() {
        return null;
    }
}

export default createPlugin("Null", {
    component: NullComponent
});
