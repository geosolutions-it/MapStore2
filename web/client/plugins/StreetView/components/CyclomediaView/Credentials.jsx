import React, {useState} from 'react';
import Message from '../../../../components/I18N/Message';
import { Form, Button, ControlLabel, FormControl, Glyphicon } from 'react-bootstrap';
import tooltip from '../../../../components/misc/enhancers/tooltip';
const ButtonT = tooltip(Button);
/**
 *
 * @returns form for username and password for Cyclomedia API
 */
export default ({setCredentials = () => {}, credentials}) => {
    const [hasCredentials, setHasCredentials] = useState(credentials?.username && credentials?.password);
    const [username, setUsername] = useState(credentials?.username || '');
    const [password, setPassword] = useState(credentials?.password || '');
    const onSubmit = () => {
        setCredentials({username, password});
        setHasCredentials(true);
    };
    if (hasCredentials) {
        return (<div style={{textAlign: "right"}}>
            <ButtonT
                style={{marginRight: 10, border: "none", background: "none"}}
                tooltipId="streetView.cyclomedia.changeCredentials"
                onClick={() => {
                    setCredentials(null);
                    setHasCredentials(false);
                }}><Glyphicon glyph="1-user-mod" /></ButtonT>
        </div>);
    }
    return (<div className="street-view-credentials">
        <h5><Message msgId="streetView.cyclomedia.insertCredentials" /></h5>
        <Form>
            <ControlLabel><Message msgId="streetView.cyclomedia.username" /></ControlLabel>
            <FormControl type="text" autocomplete="off" value={username} onChange={e => setUsername(e.target.value)}/>
            <ControlLabel><Message msgId="streetView.cyclomedia.password" /></ControlLabel>
            <FormControl type="password" autocomplete="off" value={password} onChange={e => setPassword(e.target.value)}/>
            <div className="street-view-credentials-form-buttons">
                <Button onClick={() => onSubmit()}><Message msgId="streetView.cyclomedia.submit" /></Button>
            </div>
        </Form>
    </div>);

};
