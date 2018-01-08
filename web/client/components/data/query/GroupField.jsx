const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Grid, Row, Col, Button, Glyphicon, Panel, Tooltip} = require('react-bootstrap');
const Toolbar = require('../../misc/toolbar/Toolbar');
const OverlayTrigger = require('../../misc/OverlayTrigger');

const FilterField = require('./FilterField');
const ComboField = require('./ComboField');
const DateField = require('./DateField');
const NumberField = require('./NumberField');
const TextField = require('./TextField');
const AutocompleteField = require('./AutocompleteFieldHOC');
const SwitchPanel = require('../../misc/switch/SwitchPanel');
const StringSelector = require('../../misc/StringSelector');
const LocaleUtils = require('../../../utils/LocaleUtils');
const I18N = require('../../I18N/I18N');

class GroupField extends React.Component {
    static propTypes = {
        groupLevels: PropTypes.number,
        withContainer: PropTypes.bool,
        autocompleteEnabled: PropTypes.bool,
        maxFeaturesWPS: PropTypes.number,
        groupFields: PropTypes.array,
        filterFields: PropTypes.array,
        attributes: PropTypes.array,
        fieldWidth: PropTypes.string,
        removeButtonIcon: PropTypes.string,
        addButtonIcon: PropTypes.string,
        logicComboOptions: PropTypes.array,
        attributePanelExpanded: PropTypes.bool,
        actions: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        autocompleteEnabled: true,
        withContainer: true,
        groupLevels: 1,
        groupFields: [],
        filterFields: [],
        attributes: [],
        removeButtonIcon: "trash",
        addButtonIcon: "glyphicon glyphicon-plus",
        attributePanelExpanded: true,
        logicComboOptions: [
            {logic: "OR", name: "queryform.attributefilter.groupField.any"},
            {logic: "AND", name: "queryform.attributefilter.groupField.all"},
            {logic: "NOR", name: "queryform.attributefilter.groupField.none"}
        ],
        actions: {
            onAddGroupField: () => {},
            onAddFilterField: () => {},
            onRemoveFilterField: () => {},
            onUpdateFilterField: () => {},
            onUpdateExceptionField: () => {},
            onUpdateLogicCombo: () => {},
            onRemoveGroupField: () => {},
            onChangeCascadingValue: () => {},
            onExpandAttributeFilterPanel: () => {},
            toggleMenu: () => {}
        }
    };

    getComboValues = (selected, attributes) => {
        if (selected && selected.dependson) {
            // ///////////////////////////////////////////////////////////////////////////
            // Retrieving the filterField which depends the selected one (the main field)
            // ///////////////////////////////////////////////////////////////////////////
            let filterField = this.props.filterFields.filter((field) => field.attribute === selected.dependson.field)[0];
            if (filterField && filterField.value) {
                // The complete attribute config object
                let attribute = attributes.filter((attr) => attr.attribute === filterField.attribute)[0];
                // The reference ID of the related attribute field value
                let attributeRefId = attribute.values.filter((value) => value[attribute.valueId] === filterField.value)[0][selected.dependson.from];
                // The filtered values that match the attribute refId
                let values = selected.values.filter((value) => value[selected.dependson.to] === attributeRefId);

                return selected && selected.type === "list" ? values.map((value) => {
                    return {id: selected.fidPrefix ? selected.fidPrefix + "." + value[selected.valueId] : value[selected.valueId], name: value[selected.valueLabel]};
                }) : null;
            }
        }

        return selected && selected.type === "list" ? selected.values.map((value) => {
            return {id: selected.fidPrefix ? selected.fidPrefix + "." + value[selected.valueId] : value[selected.valueId], name: value[selected.valueLabel]};
        }) : null;
    };

    getOperator = (selectedAttribute) => {
        let type = selectedAttribute && selectedAttribute.type ? selectedAttribute.type : "";
        switch (type) {
        case "list": {
            return ["="];
        }
        case "string": {
            return ["=", "like", "ilike", "isNull"];
        }
        case "boolean": {
            return ["="];
        }
        default:
            return ["=", ">", "<", ">=", "<=", "<>", "><"];
        }
    };

    renderFilterField = (filterField) => {
        let selectedAttribute = this.props.attributes.filter((attribute) => attribute.attribute === filterField.attribute)[0];
        let comboValues = this.getComboValues(selectedAttribute, this.props.attributes);
        const deleteButton = filterField.exception ?
                    (<OverlayTrigger placement="bottom" overlay={(<Tooltip id={filterField.rowId + "tooltip"}><strong><I18N.Message msgId={filterField.exception || ""}/></strong></Tooltip>)}>
                        <Button id="remove-filter-field" className="remove-filter-button" style={{backgroundColor: "red"}} onClick={() => this.props.actions.onRemoveFilterField(filterField.rowId)}>
                            <Glyphicon style={{color: "white"}} glyph="glyphicon glyphicon-warning-sign"/>
                        </Button>
                    </OverlayTrigger>)
                 :
                    (<Button id="remove-filter-field" className="remove-filter-button no-border" onClick={() => this.props.actions.onRemoveFilterField(filterField.rowId)}>
                        <Glyphicon glyph={this.props.removeButtonIcon}/>
                    </Button>);
        return (
            <div key={filterField.rowId}>
                <Row className="filter-field-row filter-field-row">
                    <Col xs={12}>
                        <FilterField
                            deleteButton={deleteButton}
                            attributes={this.props.attributes}
                            filterField={filterField}
                            operatorOptions={this.getOperator(selectedAttribute)}
                            onUpdateField={this.props.actions.onUpdateFilterField}
                            toggleMenu={this.props.actions.toggleMenu}
                            maxFeaturesWPS={this.props.maxFeaturesWPS}
                            onUpdateExceptionField={this.props.actions.onUpdateExceptionField}
                            onChangeCascadingValue={this.props.actions.onChangeCascadingValue}>
                            <ComboField
                                attType="list"
                                valueField={'id'}
                                textField={'name'}
                                fieldOptions={comboValues ? comboValues : []}
                                comboFilter={"contains"}/>
                            <DateField
                                attType="date"
                                operator={filterField.operator}/>
                            <NumberField
                                operator={filterField.operator}
                                attType="number"/>
                            {
                                // flag to swtich from AutocompleteField to TextField
                                this.props.autocompleteEnabled ?
                                (<AutocompleteField
                                    filterField={filterField}
                                    attType="string"/>) :
                                (<TextField
                                    operator={filterField.operator}
                                    attType="string"/>)
                            }

                            <ComboField
                                fieldOptions={['true', 'false']}
                                attType="boolean"
                                comboFilter={"contains"}/>
                        </FilterField>
                    </Col>

                </Row>
            </div>
        );
    };
    renderGroupButtons = groupField => {
        const buttons = [];
        if (groupField.index <= this.props.groupLevels) {
            buttons.push({
                key: "add-condition-group",
                id: "add-condition-group",
                className: "filter-buttons no-border",
                glyph: "list-alt",
                tooltipId: "queryform.attributefilter.add_group",
                onClick: () => this.props.actions.onAddGroupField(groupField.id, groupField.index)
            });
        }
        buttons.push({
            key: "add-filter-field",
            id: "add-filter-field",
            className: "filter-buttons no-border",
            glyph: this.props.addButtonIcon,
            tooltipId: "queryform.attributefilter.add_condition",
            onClick: () => this.props.actions.onAddFilterField(groupField.id)
        });
        if (groupField.groupId) {
            buttons.push({
                key: "remove-group",
                className: "remove-filter-button no-border",
                glyph: this.props.removeButtonIcon,
                onClick: () => this.props.actions.onRemoveGroupField(groupField.id)
            });
        }
        return (<Toolbar buttons={buttons} btnDefaultProps={{
        }} />);
        /*
        return (<Toolbar className="pull-right">
            {[removeButton, addButton, addCondition]}
        </ButtonGroup>);
        */
    };
    renderGroupHeader = (groupField) => {
        return (
            <Grid fluid>
                <Row className="logicHeader filter-field-row">
                    <Col xs={12}>
                        <Row className="filter-field-row">
                            <div key="filter-logic-header" className="filter-logig-header-text m-label">
                                <span className="group_label_a"><I18N.Message msgId={"queryform.attributefilter.group_label_a"}/></span>
                                &nbsp;<StringSelector
                                    options={this.props.logicComboOptions}
                                    valueField={"logic"}
                                    value={groupField.logic}
                                    onSelect={ v => this.props.actions.onUpdateLogicCombo(groupField.id, v)}
                                    labelRenderer={ ({name} = {}) => <I18N.Message msgId={name} />}
                                    />&nbsp;
                                <span className="group_label_b"><I18N.Message msgId={"queryform.attributefilter.group_label_b"}/></span>
                                <span className="pull-right">{this.renderGroupButtons(groupField)}</span>
                            </div>
                        </Row>
                    </Col>
                </Row>
            </Grid>
        );
    };

    renderGroupField = (groupField) => {
        const filterFields = this.props.filterFields.filter((filterField) => filterField.groupId === groupField.id);
        const groupFields = this.props.groupFields.filter((group) => group.groupId === groupField.id);

        const fields = [...filterFields, ...groupFields];

        const container = fields.map((field) => {
            let element;
            if (field.rowId !== undefined) {
                element = this.renderFilterField(field);
            } else {
                element = this.renderGroupField(field);
            }

            return element;
        });

        return (
            <Panel className="mapstore-conditions-group" key={groupField.id}>
                {this.renderGroupHeader(groupField)}
                <div className="query-content">{container}</div>
            </Panel>
        );
    };

    renderHeader = () => {
        return LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.attribute_filter_header");
    };

    render() {
        return (
            this.props.withContainer ? (<SwitchPanel
                id="attributeFilterPanel"
                className="query-filter-container"
                header={this.renderHeader()}
                collapsible
                expanded={this.props.attributePanelExpanded}
                onSwitch={(checked) => this.props.actions.onExpandAttributeFilterPanel(checked)}
                >
                    {this.props.groupFields.filter(g => !g.groupId).map(this.renderGroupField)}
            </SwitchPanel>) : (
                <div className="query-filter-container">{this.props.groupFields.filter(g => !g.groupId).map(this.renderGroupField)}</div>

            )
        );
    }

    updateLogicCombo = (groupId, name, value) => {
        const logic = this.props.logicComboOptions.filter((opt) => {
            if (value === LocaleUtils.getMessageById(this.context.messages, opt.name)) {
                return opt;
            }
        })[0].logic;
        this.props.actions.onUpdateLogicCombo(groupId, logic);
    };
}

module.exports = GroupField;
