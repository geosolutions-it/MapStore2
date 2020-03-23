/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState} from 'react';
import RCopyToClipboard from 'react-copy-to-clipboard';
import tooltip from '../misc/enhancers/tooltip';
import { Button, Glyphicon } from 'react-bootstrap';

const CopyToClipboard = tooltip(RCopyToClipboard);

const mainContainerStyle = {
    height: '100%',
    maxHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#C00',
    color: '#FFF',
    boxSizing: 'border-box',
    cursor: 'help',
    overflow: "hidden"
};

const firstColumnStyle = {flex: 1};
const secondColumnStyle = {height: "100%", flex: 2};

const svgStyleBasic = {
    fill: 'currentColor',
    flex: '1 1 auto'
};

const svgStyleDev = {
    height: '50%',
    maxHeight: '50vh',
    width: '50%',
    maxWidth: '50vw'
};
const toTitle = (error, componentStack) => {
    return `${error.toString()}\n\nThis is located at:${componentStack}`;
};

const ErrorBoundaryFallbackComponent = ({componentStack, error, prod = false}) => {
    const svgStyle = prod ? {...svgStyleBasic} : {...svgStyleBasic, ...svgStyleDev};
    const [copied, setCopied] = useState();
    return (<div style={mainContainerStyle}>
        <div style={firstColumnStyle}>
            <h3>Something has gone wrong</h3>
            <svg style={svgStyle} viewBox="0 0 24 24" preserveAspectRatio="xMidYMid">
                <path
                    d={`M20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,
                12M22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,
                12M15.5,8C16.3,8 17,8.7 17,9.5C17,10.3 16.3,11 15.5,11C14.7,11 14,10.3 14,
                9.5C14,8.7 14.7,8 15.5,8M10,9.5C10,10.3 9.3,11 8.5,11C7.7,11 7,10.3 7,9.5C7,
                8.7 7.7,8 8.5,8C9.3,8 10,8.7 10,9.5M12,14C13.75,14 15.29,14.72 16.19,
                15.81L14.77,17.23C14.32,16.5 13.25,16 12,16C10.75,16 9.68,16.5 9.23,
                17.23L7.81,15.81C8.71,14.72 10.25,14 12,14Z`}
                />
            </svg>
            <h3>Please contact us to our <a target="_blank" href="https://groups.google.com/forum/#!forum/mapstore-users">mailing list</a>, or check for an issue <a target="_blank" href="https://github.com/geosolutions-it/MapStore2/issues">here</a></h3>
        </div>
        <div style={secondColumnStyle}>
            <div style={{height: "100px", paddingTop: "10px"}}>
                <p>Error in details</p>
                <p>{error.toString()}</p>
                <p>
                    <CopyToClipboard
                        text={toTitle(error, componentStack)}
                        tooltipId={copied ? 'Copied' : 'Click to copy'}
                        tooltipPosition="bottom"
                        onCopy={ () => setCopied(true) } >
                        <Button
                            onMouseLeave={() => setCopied(false)} >
                            <Glyphicon glyph="copy"/>
                        </Button>
                    </CopyToClipboard>
                </p>
            </div>
            {!prod && <div style={{
                overflow: "auto",
                textAlign: "left",
                margin: "auto",
                height: "calc(100% - 100px)",
                padding: "15px",
                marginBottom: "15px"
            }}>
                <div dangerouslySetInnerHTML={{__html: componentStack.replace(/\n/ig, "<br/>")}}></div>
            </div>}
        </div>
    </div>);
};


export default ErrorBoundaryFallbackComponent;
