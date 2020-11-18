/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import Button from '../../misc/Button';
import Message from '../../I18N/Message';
import HTML from '../../I18N/HTML';

export default ({
    openFileDialog
}) => (<div>
    <HTML msgId="mapImport.dropZone.heading" />
    {openFileDialog
        ? <Button bsStyle="primary" onClick={openFileDialog}><Message msgId="mapImport.dropZone.selectFiles" /></Button>
        : null
    }
    <br />
    <br />
    <HTML msgId="mapImport.dropZone.infoSupported" />
    <hr />
    <HTML msgId="mapImport.dropZone.note" />
</div>);
