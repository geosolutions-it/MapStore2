/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ToolbarButton from '../../misc/toolbar/ToolbarButton';
import withConfirm from '../../misc/toolbar/withConfirm';
import Message from '../../I18N/Message';
import {Button} from 'react-bootstrap';

const WithConfirmButton = withConfirm(ToolbarButton);

export const CloseConfirmButton = ({onClick = () => {}, status = "success"}) => status === "modified" ? <WithConfirmButton
    bsStyle="primary"
    confirmTitle={<Message msgId="warning" />}
    confirmYes={<Message msgId="saveDialog.close" />}
    textId={"saveDialog.close"}
    confirmNo={<Message msgId="saveDialog.cancel" />}
    confirmButtonBSStyle="primary"
    bsStyle="default"
    bsSize="small"
    confirmContent={
    <>
        <Message msgId="map.details.fieldsChanged" />
        <br/>
        <Message msgId="map.details.sureToClose" />
    </>
    }
    onClick={onClick}
/> :
    <Button key="close" bsSize="small" onClick={onClick }>
        <Message msgId="close"/>
    </Button>;

export default CloseConfirmButton;
