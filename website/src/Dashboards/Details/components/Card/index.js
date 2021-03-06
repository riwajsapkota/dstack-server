// @flow
import React, {memo, Fragment, useEffect, useState} from 'react';
import moment from 'moment';
import {get, isEqual} from 'lodash-es';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import cx from 'classnames';
import {parseStackParams} from 'utils';
import {useDebounce} from 'hooks';
import Dropdown from 'components/Dropdown';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import Attachment from 'Stacks/components/Attachment';
import css from './styles.module.css';

export type DashboardCard = {
    stack: string,
    header?: {},
    index: 0,
}

type Props = {
    data: DashboardCard,
    className?: string,
    type?: 'list' | 'grid',
    attachment: {},
    fetchAttachment: Function,
    deleteCard: Function,
    updateCard: Function,
    filters: {},
}

const Card = memo(({
    data,
    className,
    type = 'grid',
    deleteCard,
    updateCard,
    filters,
    forwardedRef,
}: Props) => {
    const [title, setTitle] = useState(data.title);
    const {t} = useTranslation();
    const headId = get(data, 'head.id');
    const stackOwner = data.stack.split('/')[0];
    const [attachmentIndex, setAttachmentIndex] = useState(0);
    const [cardParams, setCardParams] = useState([]);

    useEffect(() => {
        const params = parseStackParams(get(data, 'head.attachments', []));

        if (params)
            setCardParams(Object.keys(params));

    }, [data]);

    useEffect(() => {
        findAttach();
    }, [filters]);

    const findAttach = () => {
        const attachments = get(data, 'head.attachments');
        const fields = Object.keys(filters).filter(f => cardParams.indexOf(f) >= 0);

        if (!attachments)
            return;

        if (fields.length) {
            attachments.some((attach, index) => {
                let valid = true;

                fields.forEach(key => {
                    if (!attach.params || !isEqual(attach.params[key], filters[key]))
                        valid = false;
                });

                if (valid)
                    setAttachmentIndex(index);

                return valid;
            });
        } else
            setAttachmentIndex(0);
    };

    const onUpdate = updateCard ? useDebounce(updateCard, []) : () => {};

    const onChangeTitle = event => {
        setTitle(event.target.value);
        onUpdate({title: event.target.value});
    };

    return (
        <div className={cx(css.card, `type-${type}`, className)} ref={forwardedRef}>
            <div className={css.inner}>
                <div className={css.head}>
                    <div className={cx(css.name, {readonly: !updateCard})}>
                        <div className={css.nameValue}>{title.length ? title : t('title')}</div>

                        <input
                            value={title}
                            type="text"
                            placeholder={t('title')}
                            onChange={onChangeTitle}
                            className={cx(css.nameEdit, {active: !title.length})}
                        />
                    </div>

                    <Tooltip
                        overlayContent={(
                            <Fragment>
                                <div>{t('updatedByName', {name: stackOwner})}</div>

                                {data.head && <div className={css.infoTime}>
                                    {moment(data.head.timestamp).format('D MMM YYYY')}
                                </div>}
                            </Fragment>
                        )}
                    >
                        <div className={css.info}>
                            <span className="mdi mdi-information-outline" />
                        </div>
                    </Tooltip>

                    <Button
                        className={cx(css.button, css.link)}
                        color="secondary"
                        Component={Link}
                        to={`/${data.stack}`}
                    >
                        <span className="mdi mdi-open-in-new" />
                    </Button>

                    {deleteCard && (
                        <Dropdown
                            className={css.dropdown}

                            items={[
                                {
                                    title: t('delete'),
                                    onClick: deleteCard,
                                },
                            ]}
                        >
                            <Button
                                className={css.button}
                                color="secondary"
                            >
                                <span className="mdi mdi-dots-horizontal" />
                            </Button>
                        </Dropdown>
                    )}

                    {updateCard && (
                        <Button
                            className={cx(css.button, css.move)}
                            color="secondary"
                        >
                            <span className="mdi mdi-cursor-move" />
                        </Button>
                    )}
                </div>

                {headId
                    ? <Attachment
                        className={css.attachment}
                        isList
                        withLoader
                        stack={data.stack}
                        frameId={headId}
                        id={attachmentIndex}
                    />

                    : <div className={css.emptyMessage}>{t('emptyDashboard')}</div>
                }
            </div>
        </div>
    );
});

export default Card;