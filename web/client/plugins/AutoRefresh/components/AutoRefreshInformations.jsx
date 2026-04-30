import React, {useState} from 'react';
import { Button, Glyphicon, Dropdown, MenuItem } from 'react-bootstrap';

import Message from '../../../components/I18N/Message';

const AutoRefreshInformationsMenu = React.forwardRef((props, ref) => {
    return (
        <div
            ref={ref}
            className="dropdown-menu"
            style={{
                left: 'auto',
                right: 0,
                padding: '10px',
                minWidth: '300px',
                overflowY: "hidden",
                zIndex: 9999
            }}>
            <Message msgId={props.msgId} />
            <MenuItem divider />
            {props.children}
        </div>
    );
});

const AutoRefreshInformations = ({
    layers = []
}) => {
    const [toggled, setToggled] = useState(false);

    return (<div className="ms-autorefresh-informations">
        <Dropdown dropup onToggle={(tg) => setToggled(tg)}>
            <Button bsRole="toggle"
                className={`square-button-sm btn-${toggled ? 'success' : 'default'}`}>
                <Glyphicon glyph="info-sign" />
            </Button>
            <AutoRefreshInformationsMenu bsRole="menu" msgId="autorefresh.label.layersSummary">
                <div className="ms-autorefresh-layers-summary">
                    {layers.length === 0 && <Message msgId="autorefresh.label.noLayers"/>}
                    {layers.length > 0 &&
                        layers.map(l => (<span key={`autorefresh-layer-summary-${l.id}`}>- {l.title} ({l.autorefreshInterval}s)</span>))}
                </div>
            </AutoRefreshInformationsMenu>
        </Dropdown>
    </div>);
};

export default AutoRefreshInformations;
