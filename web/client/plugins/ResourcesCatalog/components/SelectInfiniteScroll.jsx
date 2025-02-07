/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState, useEffect } from 'react';
import axios from '../../../libs/ajax';
import debounce from 'lodash/debounce';
import ReactSelect from 'react-select';
import localizedProps from '../../../components/misc/enhancers/localizedProps';

const SelectSync = localizedProps('placeholder')(ReactSelect);

function SelectInfiniteScroll({
    loadOptions,
    pageSize = 20,
    debounceTime = 500,
    ...props
}) {

    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isNextPageAvailable, setIsNextPageAvailable] = useState(false);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [options, setOptions] = useState([]);

    const source = useRef();
    const debounced = useRef();

    const createToken = () => {
        if (source.current) {
            source.current?.cancel();
            source.current = undefined;
        }
        const cancelToken = axios.CancelToken;
        source.current = cancelToken.source();
    };

    const handleUpdateOptions = useRef();
    handleUpdateOptions.current = (args = {}) => {
        createToken();
        const { q } = args;
        const query = q ?? text;
        setLoading(true);
        const newPage = args.page || page;
        loadOptions({
            q: query,
            page: newPage,
            pageSize,
            config: {
                cancelToken: source.current.token
            }
        })
            .then((response) => {
                const newOptions = response.results.map(({ selectOption }) => selectOption);
                setOptions(newPage === 1 ? newOptions : [...options, ...newOptions]);
                setIsNextPageAvailable(response.isNextPageAvailable);
                setLoading(false);
                source.current = undefined;
            })
            .catch(() => {
                setOptions([]);
                setIsNextPageAvailable(false);
                setLoading(false);
                source.current = undefined;
            });
    };

    function handleInputChange(value) {
        if (source.current) {
            source.current?.cancel();
            source.current = undefined;
        }

        debounced.current.cancel();
        debounced.current(value);
    }

    useEffect(() => {
        debounced.current = debounce((value) => {
            if (value !== text) {
                setText(value);
                setPage(1);
                setOptions([]);
                handleUpdateOptions.current({ q: value, page: 1 });
            }
        }, debounceTime);
    }, []);

    useEffect(() => {
        if (open) {
            setText('');
            setPage(1);
            setOptions([]);
            handleUpdateOptions.current({q: '', page: 1});
        }
    }, [open]);

    useEffect(() => {
        if (page > 1) {
            handleUpdateOptions.current();
        }
    }, [page]);

    return (
        <SelectSync
            {...props}
            isLoading={loading}
            options={options}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            filterOptions={(currentOptions) => {
                return currentOptions;
            }}
            onInputChange={(q) => handleInputChange(q)}
            onMenuScrollToBottom={() => {
                if (!loading && isNextPageAvailable) {
                    setPage(page + 1);
                }
            }}
        />
    );
}

export default SelectInfiniteScroll;
