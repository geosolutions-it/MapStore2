/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ToolbarButton from '../../misc/toolbar/ToolbarButton';
import withConfirm from '../../misc/withConfirm';
import Message from '../../I18N/Message';

const WithConfirmButton = withConfirm(ToolbarButton);

export const CloseConfirmButton = ({onClick = () => {}, status = "success"}) => <WithConfirmButton
    confirmPredicate={status === "modified"}
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
/>;

export default CloseConfirmButton;
