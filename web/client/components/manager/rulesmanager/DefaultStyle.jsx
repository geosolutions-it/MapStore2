/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import StylesList from './StylesList';
import Message from '../../I18N/Message';
import Filter from '../../misc/Filter';
import Portal from '../../misc/Portal';
import ResizableModal from '../../misc/ResizableModal';
import BorderLayout from '../../layout/BorderLayout';

export default ({styles = [], selectedStyles = [], onSelectionChange = () => {}, show = false, stylesFilter = '', filterPlaceholder = "", onFilter = () => {}, onClose = () => {}}) => {
    const filteredStyle = stylesFilter && stylesFilter.length > 0 && styles.filter(st => st.title.toLowerCase().match(stylesFilter && stylesFilter.toLowerCase())) || styles;
    return (
        <Portal>
            <div className="rules-manager-modal">
                <ResizableModal
                    title={<Message msgId="rulesmanager.defstyle"/>}
                    show={show}
                    onClose={onClose}
                >
                    <span className="ms-style-modal">
                        <BorderLayout
                            header={<span><Filter filterPlaceholder={filterPlaceholder} filterText={stylesFilter} onFilter={onFilter}/></span>}>
                            <StylesList styles={filteredStyle} selectedStyles={selectedStyles} onSelectionChange={onSelectionChange}/>
                        </BorderLayout>
                    </span>
                </ResizableModal>
            </div>
        </Portal>);
};

