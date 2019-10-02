/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const StylesList = require('./StylesList');
const Message = require("../../I18N/Message");
const Filter = require("../../misc/Filter");
const Portal = require("../../misc/Portal");
const {Col, Button, ButtonGroup} = require("react-bootstrap");
const ResizableModal = require("../../misc/ResizableModal");
const BorderLayout = require("../../layout/BorderLayout");

module.exports = ({styles = [], selectedStyles = [], onSelectionChange = () => {}, show = false, stylesFilter = '', filterPlaceholder = "Filter styles...", clearAll = () => {}, selectAll = () => {}, onFilter = () => {}, onClose = () => {}}) => {
    const filteredStyle = stylesFilter && stylesFilter.length > 0 && styles.filter(st => st.title.toLowerCase().match(stylesFilter && stylesFilter.toLowerCase())) || styles;
    return (
        <Portal>
            <div className="rules-manager-modal">
                <ResizableModal
                    title={<Message msgId="rulesmanager.avstyle"/>}
                    show={show}
                    onClose={onClose}
                >
                    <span className="ms-style-modal">
                        <BorderLayout
                            header={<span>
                                <Filter filterPlaceholder={filterPlaceholder} filterText={stylesFilter || ''} onFilter={onFilter}/>
                                <Col className="text-center">
                                    <ButtonGroup>
                                        <Button bsStyle="primary" bsSize="sm" onClick={clearAll}>
                                            <Message msgId="rulesmanager.clearbtn"/>
                                        </Button>
                                        <Button bsStyle="primary" bsSize="sm" onClick={selectAll}>
                                            <Message msgId="rulesmanager.selectbtn"/>
                                        </Button>
                                    </ButtonGroup>
                                </Col>
                            </span>}>
                            <StylesList styles={filteredStyle} selectedStyles={selectedStyles} onSelectionChange={onSelectionChange}/>
                        </BorderLayout>
                    </span>
                </ResizableModal>
            </div>
        </Portal>);
};

