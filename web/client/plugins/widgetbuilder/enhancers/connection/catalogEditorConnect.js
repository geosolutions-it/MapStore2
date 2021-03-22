import { connect } from 'react-redux';
import { compose, defaultProps } from 'recompose';
import { changeUrl, changeType,
    changeServiceFormat, changeMetadataTemplate, toggleAdvancedSettings, changeServiceProperty, toggleTemplate,
    toggleThumbnail, addService, deleteService, changeTitle, changeCatalogMode } from '../../../../actions/catalog';
import { savingSelector, newServiceSelector } from '../../../../selectors/catalog';
import { isLocalizedLayerStylesEnabledSelector } from '../../../../selectors/localizedLayerStyles';

export default compose(
    defaultProps({id: 'dashboard-catalog-selector', buttonStyle: []}),
    connect((state) => ({
        saving: savingSelector(state),
        isLocalizedLayerStylesEnabled: isLocalizedLayerStylesEnabledSelector(state),
        service: newServiceSelector(state)
    }), {
        onChangeUrl: changeUrl,
        onChangeTitle: changeTitle,
        onChangeType: changeType,
        onChangeServiceFormat: changeServiceFormat,
        onChangeMetadataTemplate: changeMetadataTemplate,
        onToggleAdvancedSettings: toggleAdvancedSettings,
        onChangeServiceProperty: changeServiceProperty,
        onToggleTemplate: toggleTemplate,
        onToggleThumbnail: toggleThumbnail,
        onAddService: addService,
        onDeleteService: deleteService,
        onChangeCatalogMode: changeCatalogMode
    })
);
