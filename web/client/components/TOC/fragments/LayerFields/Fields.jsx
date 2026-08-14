import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, FormControl, FormGroup, Alert, Glyphicon, Button, Checkbox } from 'react-bootstrap';
import Select from 'react-select';
import Message from '../../../I18N/Message';
import LoadingSpinner from '../../../misc/LoadingSpinner';
import LocalizedInput from '../../../misc/LocalizedInput';
import Toolbar from '../../../misc/toolbar/Toolbar';
import BorderLayout from '../../../layout/BorderLayout';
import withConfirm from '../../../misc/withConfirm';
import withTooltip from '../../../data/featuregrid/enhancers/withTooltip';
import localizedProps from '../../../misc/enhancers/localizedProps';
import { extractLocalizedString } from '../../../I18N/LocalizedString';
import { DISPLAY_TYPES } from '../../../../utils/FeatureInfoAttributeUtils';

const ConfirmButton = localizedProps("tooltip")(withTooltip(withConfirm(Button)));
const CheckboxWithTooltip = localizedProps("tooltip")(withTooltip(Checkbox));
const SettingsButton = localizedProps("title")(Button);

const isGeometryType = (type) =>
    ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'Geometry'].includes(type);

/**
 * Fields component.
 * Shows the fields of a layer and allows to edit the alias and display the type (not editable) It is used in TOCItemsSettings
 * For the moment it is used only for WFS layers (or WMS backed by WFS). In the future it will be used for all vector layers
 * For each field it shows a row with the field name, the alias and the type.
 * The alias is optional (if empty the name will be used), it can be edited and it can be localized.
 * The type is not editable and it is shown only for information. (in the future it will be editable for some layer types)
 * @memberof components.TOC
 * @prop {object[]} fields the fields of the layer. It is an array of objects with the following properties:
 * - name: the name of the field
 * - alias: the alias of the field
 * - type: the type of the field
 * @prop {function} onLoadFields callback to reload the fields of the layer (for instance in case of WFS it will perform a new DescribeFeatureType request to reload the fields)
 * @prop {function} onChange callback to be called when the alias of a field is changed. The arguments are the `name` of the field, the property changed and the new value. For instance `onChange("NAME", "alias", "new alias")`
 * @prop {function} onChangeAll callback to be called when the same property is set on every field. For instance `onChangeAll("visible", false)`
 * @prop {function} onClear callback to be called when the customization of the fields is cleared
 * @prop {boolean} loading true if the fields are loading
 * @prop {boolean} error true if there is an error loading the fields
 * @prop {string} currentLocale the current locale (for instance "en-US") used to show the localized alias
 * @name Fields
 */
const Fields = ({
    fields = [],
    onLoadFields = () => {},
    onChange = () => {},
    onChangeAll = () => {},
    onClear = () => {},
    loading,
    error,
    currentLocale,
    title,
    showVisibility = false,
    showFieldSettings = false
}) => {
    const displayedFields = fields.filter(({type}) => !isGeometryType(type));
    const visibleCount = displayedFields.filter(({visible = true}) => visible).length;
    const [configuredField, setConfiguredField] = useState(null);
    return (<BorderLayout
        className={`layer-fields${showFieldSettings ? ' layer-fields-with-settings' : ''}`}
        header={<div key="row-header" className="layer-fields-header">
            <div key="row-toolbar" className="layer-fields-toolbar">
                {title ? <div className="layer-fields-title">{title}</div> : null}
                <Toolbar key="toolbar" btnDefaultProps={{ className: 'square-button', bsStyle: 'primary', disabled: loading }}
                    buttons={[{
                        glyph: 'refresh',
                        disabled: loading,
                        tooltipId: 'layerProperties.fields.refresh',
                        onClick: onLoadFields
                    }, {
                        tooltipId: 'layerProperties.fields.clearCustomization',
                        Element: () => (<ConfirmButton
                            tooltip="layerProperties.fields.clearCustomization"
                            disabled={loading}
                            bsStyle="primary"
                            confirmContent={<Message msgId="layerProperties.fields.clearCustomizationConfirm"/>}
                            className="square-button"
                            onClick={() => onClear()}>
                            <Glyphicon
                                glyph="clear-brush" />
                        </ConfirmButton>)


                    }]}
                />
            </div>
            <div key="row-labels" className="layer-fields-row-header">
                {showVisibility ? <FormGroup className="layer-field-visibility">
                    <CheckboxWithTooltip
                        tooltip="layerProperties.fields.showAll"
                        checked={!!visibleCount && visibleCount === displayedFields.length}
                        disabled={loading || !displayedFields.length}
                        // react does not map an indeterminate prop onto the input
                        inputRef={(input) => {
                            if (input) {
                                input.indeterminate = visibleCount > 0 && visibleCount < displayedFields.length;
                            }
                        }}
                        onChange={(event) => onChangeAll("visible", event.target.checked)}/>
                </FormGroup> : null}
                <FormGroup className="layer-field-name">
                    <ControlLabel><Message msgId="layerProperties.fields.name"/></ControlLabel>
                </FormGroup>
                <FormGroup className="layer-field-alias">
                    <ControlLabel><Message msgId="layerProperties.fields.alias"/></ControlLabel>
                </FormGroup>
                <FormGroup className="layer-field-type">
                    <ControlLabel><Message msgId="layerProperties.fields.type"/></ControlLabel>
                </FormGroup>
                {showFieldSettings ? <FormGroup className="layer-field-settings-action" /> : null}
            </div>
        </div>}
        footer={<div key="row-footer" className="layer-fields-footer">
            {loading && <div className="layer-field-loading"><LoadingSpinner key="loading" loadingError={error} loading={loading} /><Message msgId="loading" /></div>}
            {error && <Alert bsStyle="danger" className="layer-fields-error"><Message msgId="layerProperties.fields.error"/></Alert>}
        </div>}
    >
        {displayedFields
            .map((field) => {
                const { name, alias, type, visible, displayType, mediaTypeAttribute } = field;
                const isConfigured = configuredField === name;
                return (<div key={`field-${name}`} className="layer-fields-field-container">
                    <div className="layer-fields-row">
                        {showVisibility ? <FormGroup className="layer-field-visibility">
                            <Checkbox
                                checked={visible !== false}
                                disabled={loading}
                                onChange={(event) => onChange(name, "visible", event.target.checked)}/>
                        </FormGroup> : null}
                        <FormGroup className="layer-field-name">
                            <FormControl disabled value={name} />
                        </FormGroup>
                        <FormGroup className="layer-field-alias">
                            <LocalizedInput disabled={loading} onChange={(value) => onChange(name, "alias", value)} value={alias} currentLocale={currentLocale} />
                        </FormGroup>
                        <FormGroup className="layer-field-type">
                            <FormControl disabled value={type}/>
                        </FormGroup>
                        {showFieldSettings ? <FormGroup className="layer-field-settings-action">
                            <SettingsButton
                                className="square-button layer-field-settings-button"
                                bsStyle={isConfigured ? 'success' : 'default'}
                                title="layerProperties.fields.configureDisplayType"
                                onClick={() => setConfiguredField(isConfigured ? null : name)}>
                                <Glyphicon glyph="cog" />
                            </SettingsButton>
                        </FormGroup> : null}
                    </div>
                    {showFieldSettings && isConfigured ? <div className="layer-field-settings-panel">
                        <div className="layer-field-settings-row">
                            <ControlLabel><Message msgId="layerProperties.fields.featureInfoDisplayType" /></ControlLabel>
                            <Select
                                clearable
                                className="layer-field-settings-select"
                                placeholder={<Message msgId="layerProperties.fields.displayTypes.string" />}
                                value={displayType}
                                options={DISPLAY_TYPES.map((value) => ({
                                    value,
                                    label: <Message msgId={`layerProperties.fields.displayTypes.${value}`} />
                                }))}
                                onChange={(selected) => onChange(name, 'displayType', selected?.value)}/>
                        </div>
                        {displayType === 'media' ? <div className="layer-field-settings-row">
                            <ControlLabel><Message msgId="layerProperties.fields.mediaTypeAttribute" /></ControlLabel>
                            <Select
                                clearable
                                className="layer-field-settings-select"
                                value={mediaTypeAttribute}
                                options={fields.filter(({ name: optionName }) => optionName !== name).map(({ name: optionName, alias: optionAlias }) => ({
                                    value: optionName,
                                    label: extractLocalizedString(optionAlias, currentLocale) || optionName
                                }))}
                                onChange={(selected) => onChange(name, 'mediaTypeAttribute', selected?.value)}/>
                        </div> : null}
                    </div> : null}
                </div>);
            })}
    </BorderLayout>
    );
};

Fields.propTypes = {
    fields: PropTypes.array,
    onLoadFields: PropTypes.func,
    onChange: PropTypes.func,
    onChangeAll: PropTypes.func,
    onClear: PropTypes.func,
    loading: PropTypes.bool,
    error: PropTypes.bool,
    currentLocale: PropTypes.string,
    title: PropTypes.node,
    showVisibility: PropTypes.bool,
    showFieldSettings: PropTypes.bool
};

export default Fields;
