import React from "react";
import {connect} from "react-redux";
import {createPlugin, handleExpression} from "../../utils/PluginsUtils";
import {Glyphicon, Button} from "react-bootstrap";
import Spinner from 'react-spinkit';
import Message from "../../components/I18N/Message";

export const ActionButton = (props) => {
    const {text, actions, action, enabled, actionConfig, loading, className = ""} = props;
    const {glyph, buttonConfig} = actionConfig;
    const icon = glyph ? <Glyphicon glyph={glyph}/> : <span/>;
    const enable = !!handleExpression({}, {...props}, "{" + enabled + "}");
    return (
        <Button className={className} disabled={!enable} {...buttonConfig} style={{marginTop: "10px", marginRight: "5px"}} onClick={actions[action]}>
            {loading ? <Spinner spinnerName="circle" overrideSpinnerClassName="spinner" noFadeIn /> : icon} <Message msgId={text}/>
        </Button>
    );
};

export default createPlugin("Action", {
    component: connect(
        (state) => ({
            spec: state?.print?.spec || {},
            loading: state.print && state.print.isLoading || false
        })
    )(ActionButton),
    containers: {
        Print: {
            priority: 1
        }
    }
});
