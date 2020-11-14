import { mdiArrowLeft, mdiEye, mdiForum, mdiLoading, mdiLock, mdiPlusBox } from '@mdi/js';
import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { ucfirst } from '../../functions/helpers';
import { createUseStyles } from 'react-jss';
import Pagination from '../misc/Pagination';
import { NavLink } from 'react-router-dom';
import HttpError from '../http/HttpError';
import { useParams } from 'react-router';
import { useQuery } from 'react-query';
import Tooltip from '../misc/Tooltip';
import Http from '../../classes/Http';
import classnames from 'classnames';
import Header from '../Header';
import Icon from '@mdi/react';

export default function Category() {
    const styles = createUseStyles({
        container: {
            padding: [0, 'var(--container-margin)'],
        },
        header: {

        },
        headerText: {
            boxShadow: [0, 0, 10, 0, 'rgba(0, 0, 0, 0.25)'],
            backgroundImage: 'var(--color-main-gradient)',
            color: 'var(--color-primary)',
            alignItems: 'center',
            fontSize: '1rem',
            borderRadius: 2,
            padding: 15,
        },
        back: {
            boxShadow: [0, 0, 10, 0, 'rgba(0, 0, 0, 0.25)'],
            backgroundImage: 'var(--color-main-gradient)',
            color: 'var(--color-primary)',
            borderRadius: 2,
            padding: 15,
            '&:hover': {
                color: 'var(--color-primary)',
            },
        },
        categoryIcon: {
            filter: 'brightness(0) invert(1)',
            height: 25,
            width: 25,
        },
        threads: {
            minHeight: 100,
        },
        thread: {
            boxShadow: [0, 0, 5, 0, 'rgba(0, 0, 0, 0.15)'],
            backgroundColor: 'var(--color-primary)',
            transition: 'all 0.1s linear',
            alignItems: 'center',
            borderRadius: 2,
            padding: 15,
            '&:hover': {
                backgroundColor: 'var(--bg-color)',
            }
        },
        title: {
            width: '50%',
        },
        titleText: {
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontWeight: 'bold',
            '&:hover': {
                textDecoration: 'none',
            },
        },
        op: {
            color: 'var(--text-secondary)',
            '&:hover': {
                textDecoration: 'none',
            },
        },
        posts: {
            
        },
        views: {
            marginLeft: '7.5%',
        },
        latest: {
            width: '15%',
        },
        latestLink: {
            color: 'var(--text-primary)',
            fontWeight: 'bold',
            '&:hover': {
                color: 'var(--color-link)',
                textDecoration: 'none',
            },
        },
        latestDate: {
            fontSize: '0.85rem',
        },
        newIcon: {
            width: '1.5rem',
        },
        loadingSpinner: {
            color: 'var(--color-main)',
            width: 50,
        },
        locked: {
            left: -35,
        },
    });
    const classes = styles();

    const [threadsStatus, setThreadsStatus] = useState('loading');
    const [httpError, setHttpError] = useState(false);
    const [threads, setThreads] = useState({ data: [] });
    const { user } = useContext(UserContext);
    const { category, page } = useParams();

    useEffect(async () => {
        const response = await Http.get(`threads?category=${category}&page=${page ?? 1}`);
        if (response.code !== 404 && response.code !== 200) setThreadsStatus('error');
        if (response.code === 200) setThreads(response.data);
        setThreadsStatus('success');
    }, [category]);

    const dbCategory = useQuery(`dbCategory-${category}`, async () => {
        const response = await Http.get(`categories/${category}`);
        if (response.code !== 200) return setHttpError(response.code);
        return response.data;
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [category, page]);

    if (httpError) return <HttpError code={httpError} />

    const render = () => {
        if (dbCategory.status === 'loading') {
            return <Icon className={classnames(classes.loadingSpinner, 'm-auto')} path={mdiLoading} spin={1} />
        }
        return (
            <>
                <div className={classnames(classes.header, 'row mb-2')}>
                    <NavLink className={`${classes.back} d-flex mr-2`} to="/">
                        <Icon path={mdiArrowLeft} />
                    </NavLink>
                    <div className={`${classes.headerText} row w-100`}>
                        {
                            dbCategory.status === 'success' &&
                                <img
                                    className={classes.categoryIcon}
                                    src={`/storage/category-icons/${dbCategory.data.icon}.svg`}
                                    alt={ucfirst(category)}
                                />
                        }
                        <h2 className="ml-2">{ucfirst(category)}</h2>
                    </div>
                </div>
                {
                    user &&
                        <div className={classnames('row mt-2')}>
                            <NavLink className={classnames('btn caps center-children')} to={`/category/${dbCategory.data?.name}/new`}>
                                <Icon className={classnames(classes.newIcon, 'mr-1')} path={mdiPlusBox} />
                                <span>New thread</span>
                            </NavLink>
                        </div>
                }
                <div className={`${classes.threads} col relative`}>
                    {renderThreads()}
                    {
                        threadsStatus === 'success' && threads.data.length > 0
                            ? <Pagination pagination={{
                                currentPage: threads.current_page,
                                lastPage: threads.last_page,
                                perPage: threads.per_page,
                                total: threads.total,
                            }} />
                            : null
                    }
                </div>
            </>
        );
    }

    const renderThreads = () => {
        if (threadsStatus === 'loading') {
            return <Icon className="center-self loadingWheel-2" path={mdiLoading} spin={1} />;
        }
        if (threadsStatus === 'error') {
            return <h3 className={classnames('text-center mt-3')}>Error retrieving the threads</h3>;
        }
        if (threadsStatus === 'success') {
            if (threads.data.length <= 0) {
                return <h3 className={classnames('text-center mt-3')}>No threads were found, be the first to create one!</h3>;
            }
            return threads.data.map(thread => (
                <div className={`${classes.thread} row mt-1`} key={thread.id}>
                    <div className={`${classes.title} col`}>
                        <NavLink className={classnames(classes.titleText, 'w-fit')} to={`/thread/${thread.id}/${thread.slug}`}>
                            {thread.title}
                        </NavLink>
                        <NavLink
                            className={`${classes.op} color-${thread.op.roles[0].clearance} bold mt-2 mr-auto`}
                            to={`/user/${thread.op.username}`}
                        >
                            {thread.op.username}
                        </NavLink>
                    </div>
                    <Tooltip className={`${classes.posts} ml-auto col center-children`} title="Posts">
                        <Icon path={mdiForum} />
                        <span>{thread.postsAmount}</span>
                    </Tooltip>
                    <Tooltip className={`${classes.views} mr-auto col center-children`} title="Views">
                        <Icon path={mdiEye} />
                        <span>{thread.views}</span>
                    </Tooltip>
                    <div className={`${classes.latest} col`}>
                        <span className={`${classes.latestDate} ml-auto`}>
                            Some date
                        </span>
                        <NavLink
                            className={`${classes.latestLink} color-${thread.latestPost.user.roles[0].clearance} ml-auto mt-2`}
                            to={`/thread/${thread.id}/${thread.slug}/${thread.latestPost.pageNumber}/#${thread.latestPost.id}`}
                        >
                            {thread.latestPost.user.username}
                        </NavLink>
                    </div>
                    {thread.locked ? <Icon className={classnames(classes.locked, 'absolute')} path={mdiLock} /> : ''}
                </div>
            ));
        }
    }

    return (
        <>
            <Header />
            <div className={`${classes.container} col py-4`}>
                {render()}
            </div>
        </>
    );
}