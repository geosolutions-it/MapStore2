
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const showButtons = props => !props.viewerOptions.header && props.validResponses.length > 1;
const isLast = props => props.index >= props.validResponses.length - 1;
const isFirst = props => props.index <= 0;

/**
 * Navigation buttons for identify tools
 */
module.exports = (props) => [
    {
        keyProp: "back",
        glyph: 'arrow-left',
        tooltipId: isFirst(props) ? undefined : 'wizard.prev',
        disabled: isFirst(props),
        visible: showButtons(props),
        onClick: () => {
            props.onPrevious();
        }
    }, {
        keyProp: "forward",
        glyph: 'arrow-right',
        tooltipId: isLast(props) ? undefined : 'wizard.next',
        disabled: isLast(props),
        visible: showButtons(props),
        onClick: () => {
            props.onNext();
        }
    }
].filter(btn => btn && btn.visible);
