import {connect} from "react-redux";

import Extension from "../components/Extension";

export default {
    component: connect(state => ({
        value: state.extension && state.extension.value
    }), {onIncrease: () => {
        return {
            type: 'INCREASE_COUNTER'
        };
    }})(Extension),
    reducers: {
        extension: (state = {value: 1}, action) => {
            if (action.type === 'INCREASE_COUNTER') {
                return {value: state.value + 1};
            }
            return state;
        }
    },
    containers: {
        Toolbar: {
            name: "Dummy",
            position: 10,
            tooltip: "zoombuttons.zoomInTooltip",
            help: "",
            tool: true,
            priority: 1
        }
    }
};
