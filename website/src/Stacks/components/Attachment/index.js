// @flow

import React, {useEffect, useRef, useState} from 'react';
import cx from 'classnames';
import {get, isEqual} from 'lodash-es';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Plot from 'react-plotly.js';
import * as CSV from 'csv-string';
import Table from './Table';
import {useIntersectionObserver, usePrevious} from 'hooks';
import {fetchAttachment} from './actions';
import {unicodeBase64Decode} from 'utils';
import css from './styles.module.css';
import config from 'config';
import api from 'api';

type Props = {
    id: number,
    attachment: {},
    frameId: string,
    stack: string,
    fetchAttachment: Function,
    className?: string,
    loading: boolean,
    withLoader?: boolean,
    requestStatus: ?number,
}

const base64ToJSON = (base64: string) => {
    let parsedJSON;

    try {
        parsedJSON = JSON.parse(atob(base64));
    } catch (e) {
        console.log(e);
    }

    return parsedJSON;
};

const base64ImagePrefixes = {
    'image/svg+xml': 'data:image/svg+xml;charset=utf-8;',
    'image/png': 'data:image/png;charset=utf-8;',
    'image/jpeg': 'data:image/jpeg;charset=utf-8;',
};

const isImageType = type => /^image/.test(type);

const Attachment = ({
    fetchAttachment,
    error,
    attachment,
    requestStatus,
    id,
    className,
    frameId,
    isList,
    loading,
    withLoader,
    stack,
}: Props) => {
    const {t} = useTranslation();
    const [tableScale, setTableScale] = useState(1);
    const [loadingFullAttachment, setLoadingFullAttachment] = useState(false);
    const [fullAttachment, setFullAttachment] = useState(null);
    const viewRef = useRef(null);
    const prevAttachment = usePrevious(attachment);

    useEffect(() => {
        if (window && isList)
            window.addEventListener('resize', onResizeCard);

        return () => {
            if (window && isList)
                window.removeEventListener('resize', onResizeCard);
        };
    }, []);
    
    const fetchFullAttachment = async () => {
        setLoadingFullAttachment(true);

        try {
            const url = config.STACK_ATTACHMENT(stack, frameId, id) + '?download=true';
            const {data} = await api.get(url);

            setFullAttachment(data.attachment);
        } catch (e) {
            console.log(e);
        }

        setLoadingFullAttachment(false);
    };

    useEffect(() => {
        if (!isList && attachment
            && !isEqual(prevAttachment, attachment)
            && attachment.preview
            && isImageType(attachment.type)
        ) {
            fetchFullAttachment();
        }
    }, [attachment]);

    useEffect(() => {
        if (!isList
            && (typeof id === 'number' && frameId)
            && ((!attachment.data && !error) || (attachment?.index !== id))
        ) {
            fetchAttachment(stack, frameId, id);
        }
    }, [id, frameId]);

    const [ref] = useIntersectionObserver(() => {
        if (isList && !loading && (
            (!attachment.data && !error)
            || (attachment.data && attachment.index !== id)
        ))
            fetchAttachment(stack, frameId, id);
    }, {}, [id, frameId, attachment]);

    useEffect(() => {
        if (attachment && attachment.type === 'bokeh' && Bokeh) {
            const json = base64ToJSON(attachment.data);

            if (json && document.querySelector(`#bokeh-${frameId}`))
                Bokeh.embed.embed_item(json, `bokeh-${frameId}`);
        }

        if (isList)
            setTimeout(() => onResizeCard(), 10);

    }, [attachment]);

    const onResizeCard = () => {
        if (ref.current && viewRef.current) {
            const containerWidth = ref.current.offsetWidth;
            const viewWidth = viewRef.current.offsetWidth / tableScale;

            let newScale = containerWidth / viewWidth;

            if (newScale > 1)
                newScale = 1;

            setTableScale(newScale);
        }
    };

    const renderImage = () => {
        if (!attachment.preview)
            return (
                <img src={`${base64ImagePrefixes[attachment.type]}base64,${attachment.data}`} alt=""/>
            );
        else if (fullAttachment) {
            if (fullAttachment['download_url']) {
                return (
                    <img src={fullAttachment['download_url']} alt=""/>
                );
            } else
                return (
                    <img src={`${base64ImagePrefixes[attachment.type]}base64,${attachment.data}`} alt=""/>
                );
        }

        return null;
    };

    const renderCSV = () => {
        const decodeCSV = unicodeBase64Decode(attachment.data);

        if (decodeCSV) {
            const data = CSV.parse(decodeCSV);

            if (Array.isArray(data))
                return (
                    <Table
                        data={data}
                    />
                );
        }

        return (
            <div className={css.text}>{t('notSupportedAttachment')}</div>
        );
    };

    const renderPlotly = () => {
        const json = base64ToJSON(attachment.data);

        if (!json)
            return null;

        json.layout.width = '100%';
        json.layout.margin = 0;
        json.layout.autosize = true;
        json.config = {responsive: true};

        return (
            <Plot
                {...json}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                useResizeHandler
            />
        );
    };

    const renderBokeh = () => <div id={`bokeh-${frameId}`} />;

    const renderAttachment = () => {
        if (loading)
            return null;

        if (requestStatus === 404 && isList)
            return <div className={css.message}>{t('notFound')}</div>;

        if (requestStatus === 404 && !isList)
            return <div className={css.text}>{t('noPreview')}</div>;

        if (attachment.preview && isList && isImageType(attachment.type))
            return <div className={css.message}>{t('noPreview')}</div>;

        switch (attachment.type) {
            case 'image/svg+xml':
            case 'image/png':
            case 'image/jpeg':
                return renderImage();

            case 'text/csv':
                return renderCSV();

            case 'plotly':
                return renderPlotly();

            case 'bokeh':
                return renderBokeh();

            case undefined:
                return null;

            default:
                return <div className={isList ? css.message : css.text}>{t('notSupportedAttachment')}</div>;
        }
    };

    return (
        <div
            ref={ref}
            className={cx(css.attachment, className, {
                'is-list': isList,
                loading: loading && withLoader || loadingFullAttachment,
            })}
        >
            <div
                ref={viewRef}
                className={cx(css.view, {
                    'table': (attachment && attachment.data && attachment.type === 'text/csv'),
                    'bokeh': (attachment && attachment.data && attachment.type === 'bokeh'),
                })}

                style={
                    (attachment && attachment.type === 'text/csv')
                        ? {transform: `scale(${tableScale})`}
                        : {}
                }
            >
                {renderAttachment()}
            </div>
        </div>
    );
};

export default connect(
    (state, props) => {
        const attachment = get(state.stacks.attachments.data, `${props.frameId}.${props.id}`, {});

        return {
            attachment,
            loading: attachment.loading || false,
            error: attachment.error,
            requestStatus: attachment.error,
        };
    },

    {fetchAttachment},
)(Attachment);
