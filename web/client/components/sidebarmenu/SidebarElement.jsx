import tooltip from "../misc/enhancers/tooltip";
import {Button} from "react-bootstrap";
import React from "react";
import classnames from "classnames";
import {omit} from "lodash";

const TooltipButton = tooltip(Button);


const Container = ({children, className, bsStyle = 'link', tooltipId, tooltipPosition = 'left', ...props}) => (
    <TooltipButton
        className={classnames({'square-button': true, ...(className ? {[className]: true} : {})})}
        bsStyle={bsStyle}
        tooltipId={tooltipId}
        tooltipPosition={tooltipPosition}
        {...omit(props, ['pluginCfg', 'help', 'defaultOptions', 'items', 'advancedSettings'])}
    >
        {children}
    </TooltipButton>
);

export default Container;
