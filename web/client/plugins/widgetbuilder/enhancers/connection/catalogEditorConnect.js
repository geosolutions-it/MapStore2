import { connect } from 'react-redux';
import { compose, defaultProps } from 'recompose';
import { deleteService, changeCatalogMode } from '../../../../actions/catalog';
import {addNewDashboardService, setDashboardCatalogMode} from '../../../../actions/dashboard';
import { error } from '../../../../actions/notifications';

import { savingSelector, newServiceSelector } from '../../../../selectors/catalog';
import { isLocalizedLayerStylesEnabledSelector } from '../../../../selectors/localizedLayerStyles';

export default compose(
    defaultProps({id: 'dashboard-catalog-selector', buttonStyle: [] }),
    connect((state) => ({
        saving: savingSelector(state),
        isLocalizedLayerStylesEnabled: isLocalizedLayerStylesEnabledSelector(state),
        service: newServiceSelector(state)
    }), {
        error: error,
        onDeleteService: deleteService,
        onChangeCatalogMode: setDashboardCatalogMode,
        onAddService: addNewDashboardService
    })
);
