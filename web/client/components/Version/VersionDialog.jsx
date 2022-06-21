import React from 'react';
import Dialog from '../misc/Dialog';
import { Glyphicon } from 'react-bootstrap';
import Message from '../I18N/Message';
import Button from '../misc/Button';

function VersionDialog(props) {
    const onClose = (e)=>{
        e.preventDefault;
        props.show = false;
    };

    const githubUrl = "https://github.com/geosolutions-it/MapStore/tree/" + __COMMITHASH__;
    return (
        <div key={props.show}>
            {props.show  && <Dialog id="mapstore-about">
                <div key="header" role="header">
                    <Message key="title" msgId="version.label"/>
                    <button key="close" onClick={onClose} className="close">{props.closeGlyph ? <Glyphicon glyph={props.closeGlyph}/> : <span>×</span>}</button>
                </div>
                <div key="body" role="body">
                    <ul>
                        <li>
                            <span className="application-version"><span className="application-version-label"><Message msgId="version.label"/></span>:{props.version}</span>;
                        </li>
                        <li>
                            <span className="value-git commit-data" dangerouslySetInnerHTML={{ __html: __COMMIT_DATA__
                                .replace("Message:", "<strong>Message:</strong>")
                                .replace("Author:", "<br/><strong>Author:</strong>")
                                .replace("Date:", "<br/><strong>Date:</strong>")
                                .replace("Commit:", "<br/><strong>Commit:</strong>")
                            }}>
                            </span>

                        </li>
                        <li>
                            <span><a href={githubUrl} target="_blank" ><Button> Open github tree in a new tab </Button></a></span>
                        </li>
                    </ul>
                </div>
            </Dialog>}
        </div>
    );
}

export default VersionDialog;
