/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { Glyphicon } from 'react-bootstrap';
import Button from '../layout/Button';
import { getMessageById } from '../../utils/LocaleUtils';
import { useInjectedAccess, USER_MENU_SELECTOR, MODAL_SELECTOR, PRIVACY_GLYPH } from './PrivacyAccessButton';
import { getPolicyLink, policyLinkKeys, policyPagesDocsUrl, usesTemplatePolicyLinks } from '../../utils/PrivacyChoices';

export default function PrivacyPanel({ config, locale, choice, show, storageError, onShow, onSave }, context) {
    const t = id => getMessageById(context.messages, `privacySettings.${id}`);
    const categories = (config.categories || []).filter(c => ['functional', 'statistics', 'marketing'].includes(c.id));
    const nativeAccess = useInjectedAccess();
    const closeRef = useRef();
    useEffect(() => {
        // Bootstrap modals listen on the document to keep the focus in their dialog and to close on Escape.
        // Window capture listeners run before them, so the privacy controls stay usable while a modal is open.
        const onFocus = event => { if (event.target?.closest?.('.mapstore-privacy-panel') && document.querySelector(MODAL_SELECTOR)) event.stopPropagation(); };
        const onKeyDown = event => {
            if (event.key === 'Escape' && event.target?.closest?.('.mapstore-privacy-panel')) {
                event.stopPropagation();
                closeRef.current();
            }
        };
        window.addEventListener('focus', onFocus, true);
        window.addEventListener('keydown', onKeyDown, true);
        return () => {
            window.removeEventListener('focus', onFocus, true);
            window.removeEventListener('keydown', onKeyDown, true);
        };
    }, []);
    const titleRef = useRef();
    useEffect(() => { if (show) titleRef.current?.focus(); }, [show]);
    // a button inside an open modal comes first, the ones behind its backdrop cannot take the focus
    const returnFocus = () => requestAnimationFrame(() =>
        (document.querySelector(`${MODAL_SELECTOR} .mapstore-privacy-open`) || document.querySelector(`#privacy-settings, ${USER_MENU_SELECTOR}`))?.focus());
    const choose = selected => { if (onSave(selected) !== false) returnFocus(); };
    // each switch saves the choice at once and leaves the panel open
    const toggle = (id, enabled) => onSave({...choice?.categories, [id]: enabled}, {keepOpen: true});
    const close = () => {
        // Closing a first notice refuses optional tools, unless saving has already failed.
        if (categories.length && !choice && !storageError) { choose({}); return; }
        onShow(false); returnFocus();
    };
    closeRef.current = close;
    return createPortal(<>
        {!nativeAccess && <div className="mapstore-privacy-access" role="group" aria-label={t('settings')}>
            <Button type="button" id="privacy-settings" className="mapstore-privacy-open"
                title={t('settings')} aria-label={t('settings')} onClick={() => onShow(true)}>
                <Glyphicon glyph={PRIVACY_GLYPH} aria-hidden="true" /> <span>{t('settings')}</span>
            </Button>
        </div>}
        {show && <section className="mapstore-privacy-panel" role="dialog" aria-labelledby="privacy-title" aria-modal="false">
            <div className="mapstore-privacy-header">
                <h2 id="privacy-title" ref={titleRef} tabIndex="-1">{t('title')}</h2>
                <Button type="button" id="privacy-close" square borderTransparent title={t('close')} aria-label={t('close')} onClick={close}>
                    <Glyphicon glyph="1-close" aria-hidden="true"/>
                </Button>
            </div>
            {config.testFixture && <p className="mapstore-privacy-warning">{t('fixture')}</p>}
            {usesTemplatePolicyLinks(config) && <p className="mapstore-privacy-warning mapstore-privacy-template-warning">
                {t('templateWarning')} <a href={policyPagesDocsUrl} target="_blank" rel="noopener noreferrer">{t('templateWarningLink')}</a>
            </p>}
            <p>{categories.length ? t('optional') : t('baseline')}</p>
            <div className="mapstore-privacy-category"><strong>{t('necessary')}</strong><span>{t('always')}</span><p>{t('required')}</p></div>
            {['functional', 'statistics', 'marketing'].map(id => {
                const category = categories.find(c => c.id === id);
                return (<div className="mapstore-privacy-category" key={id} data-category={id}>
                    {category ? <label>
                        <strong>{t(id)}</strong>
                        <span className="mapstore-switch-btn mapstore-switch-btn-xs">
                            <input type="checkbox" role="switch" checked={choice?.categories[id] === true} aria-label={t(id)}
                                onChange={event => toggle(id, event.target.checked)}/>
                            <span className="m-slider" aria-hidden="true"/>
                        </span>
                    </label> : <><strong>{t(id)}</strong><span>{t('unused')}</span></>}
                    {category && <p>{category.description?.[locale] || category.description?.['en-US'] || Object.values(category.description || {})[0] || ''}</p>}
                </div>);
            })}
            {categories.length > 0 && <p>{t('status')}</p>}
            {storageError && <p role="alert" className="mapstore-privacy-warning">{t('storageError')}</p>}
            <nav className="mapstore-privacy-links" aria-label={t('policies')}>
                {policyLinkKeys.filter(key => getPolicyLink(config, key, locale)).map(key =>
                    <a key={key} href={getPolicyLink(config, key, locale)} target="_blank" rel="noopener noreferrer">{t(key)}</a>)}
            </nav>
            {categories.length > 0 && <div className="mapstore-privacy-actions">
                <Button type="button" id="privacy-accept" onClick={() => choose(Object.fromEntries(categories.map(({id}) => [id, true])))}>{t('accept')}</Button>
                <Button type="button" id="privacy-reject" onClick={() => choose({})}>{t('reject')}</Button>
            </div>}
        </section>}
    </>, document.body);
}

PrivacyPanel.contextTypes = {
    messages: PropTypes.object
};
