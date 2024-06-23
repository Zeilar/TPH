import { NewThread, Category, Thread } from '../threads';
import { FeedbackModalContext } from '../../contexts';
import { ScrollToTop, FeedbackModal } from '../misc';
import { Route, Switch } from 'react-router';
import { Home, Chat, Settings } from './';
import React, { useContext } from 'react';
import { Register, Login } from '../auth';
import { PostSingle } from '../layout';
import { AdminRoute } from '../routes';
import { Dashboard } from '../admin';
import { Profile } from '../profile';
import { HttpError } from '../http';
import { Search } from '../search';

export default function RouterPages() {
    const { type, message } = useContext(FeedbackModalContext);

    return (
        <>
            <Switch>
                <Route component={Home} path="/" exact />
                <Route component={PostSingle} path="/post/:id" exact />
                <Route component={Profile} path="/user/:id/:tab?/:page?" exact />
                <Route component={NewThread} path="/category/:category/new" exact />
                <Route component={Category} path="/category/:category/:page?" exact />
                <Route component={Thread} path="/thread/:id/:slug?/:page?" exact />
                <Route component={Login} path="/login" exact />
                <Route component={Register} path="/register" exact />
                <Route component={Chat} path="/chat" exact />
                <Route component={Settings} path="/settings" exact />
                <Route component={Search} path="/search/:query?/:tab?/:page?" exact />
                <AdminRoute component={Dashboard} path="/admin" />
                <Route>
                    <HttpError code={404} />
                </Route>
            </Switch>
            {message && <FeedbackModal message={message} type={type} />}
            <ScrollToTop />
        </>
    );
}
