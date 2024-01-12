import React, {useState} from 'react';
import Message from '../../../../components/I18N/Message';
import { Form, Button, ControlLabel, FormControl, Glyphicon } from 'react-bootstrap';
import tooltip from '../../../../components/misc/enhancers/tooltip';
const ButtonT = tooltip(Button);
/**
 * Component to insert Smart API Credentials
 * @prop {function} setCredentials function to set credentials
 * @prop {object} credentials object with username and password
 * @returns {JSX.Element} The rendered component
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
        // show only button to reset credentials.
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
            <FormControl type="text"  value={username} onChange={e => setUsername(e.target.value)}/>
            <ControlLabel><Message msgId="streetView.cyclomedia.password" /></ControlLabel>
            <FormControl type="password"  value={password} onChange={e => setPassword(e.target.value)}/>
            <div className="street-view-credentials-form-buttons">
                <Button disabled={!username || !password} onClick={() => onSubmit()}><Message msgId="streetView.cyclomedia.submit" /></Button>
            </div>
        </Form>
    </div>);

};
