const React = require('react');
const Toolbar = require('../../../misc/toolbar/Toolbar');
const {NavItem, Nav} = require('react-bootstrap');
const Message = require('../../../I18N/Message');

module.exports = ({onNavChange = () => {}, onExit = () => {}, disableSave = true, onSave = () => {}, activeTab = "1", detailsActive = false}) => {
    const buttons = [{
            glyph: '1-close',
            tooltipId: 'rulesmanager.tooltip.close',
            onClick: onExit
        },
        {
            glyph: 'floppy-disk',
            tooltipId: 'rulesmanager.tooltip.save',
            onClick: onSave,
            disabled: disableSave
        }];
    return (<div className="ms-panel-header-container">
                <div className="ms-toolbar-container">
                    <Toolbar btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary', tooltipPosition: 'bottom'}} buttons={buttons}/>
                </div>
                <Nav bsStyle="tabs" activeKey={activeTab} justified onSelect={onNavChange}>
                    <NavItem eventKey="1" ><Message msgId={"rulesmanager.navItems.main"}/></NavItem>
                    <NavItem eventKey="2" disabled={!detailsActive}><Message msgId={"rulesmanager.navItems.style"}/></NavItem>
                    <NavItem eventKey="3" disabled={!detailsActive}><Message msgId={"rulesmanager.navItems.filter"}/></NavItem>
                    <NavItem eventKey="4" disabled={!detailsActive}><Message msgId={"rulesmanager.navItems.attribute"}/></NavItem>
                </Nav>
            </div>);
};


