// @flow

import React, {useState, useEffect, useRef} from 'react';
import {connect} from 'react-redux';
import {Switch, Route, withRouter, Redirect} from 'react-router-dom';
import routes from 'routes';
import '@mdi/font/css/materialdesignicons.min.css';

import Loader from 'components/Loader';
import DefaultLayout from 'layouts/Default';
import UnAuthorizedLayout from 'layouts/UnAuthorized';

import NotFound from 'components/NotFound';

import Login from 'Auth/Login';
import ConfirmEmail from 'Auth/ConfirmEmail';

import Dashboards from 'Dashboards';
import Stacks from 'Stacks';
import Settings from 'Settings';

import {isSignedIn} from 'utils';
import {fetchUser, setSearch} from './actions';
import css from './styles.module.css';
import {useTracking} from 'hooks';

const DefaultLayoutRoute = ({component: Component, ...rest}) => {
    return (
        <Route
            {...rest}

            render={props => (
                <DefaultLayout>
                    <Component {...props} />
                </DefaultLayout>
            )}
        />
    );
};

const UnAuthorizedLayoutRoute = ({component: Component, ...rest}) => {
    return (
        <Route
            {...rest}

            render={props => (
                <UnAuthorizedLayout>
                    <Component {...props} />
                </UnAuthorizedLayout>
            )}
        />
    );
};

type Props = {
    location: {
        pathname: string,
    },

    fetchUser: Function,
    userLoading: boolean,
    userData: ?{user: string},
    setSearch: Function,
}

const App = ({location, fetchUser, userData, userLoading, history: {push}, setSearch}: Props) => {
    const [loading, setLoading] = useState(true);
    const isInitialMount = useRef(true);

    useTracking();

    useEffect(() => {
        if (isSignedIn())
            fetchUser(
                () => {},
                () => {
                    setLoading(false);
                    push(routes.authLogin());
                }
            );
        else
            setLoading(false);
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setLoading(userLoading);
        }
    }, [userLoading]);

    useEffect(() => {
        setSearch('');
    }, [location.pathname]);

    return (
        <div className={css.app}>
            {!loading && (
                <Switch>
                    {isSignedIn() && userData && (
                        <Redirect
                            exact
                            from="/"
                            to={routes.stacks(userData.user)}
                        />
                    )}

                    <Redirect
                        exact
                        from="/"
                        to={routes.authLogin()}
                    />

                    <Route path={routes.authLogin()} component={Login}/>
                    <DefaultLayoutRoute path={routes.verifyUser()} component={ConfirmEmail}/>

                    {isSignedIn() && (
                        <Switch>
                            <DefaultLayoutRoute path={routes.notFound()} component={NotFound} />
                            <DefaultLayoutRoute path={routes.settings()} component={Settings} />
                            <DefaultLayoutRoute path={routes.dashboards()} component={Dashboards} />
                            <DefaultLayoutRoute path={routes.stacks()} component={Stacks} />
                        </Switch>
                    )}

                    {!isSignedIn() && (
                        <Switch>
                            <UnAuthorizedLayoutRoute path={routes.notFound()} component={NotFound} />
                            <UnAuthorizedLayoutRoute path={routes.dashboards()} component={Dashboards} />
                            <UnAuthorizedLayoutRoute path={routes.stacks()} component={Stacks} />
                        </Switch>
                    )}

                    <Redirect
                        to={routes.notFound()}
                    />
                </Switch>
            )}

            {loading && <DefaultLayout>
                <Loader />
            </DefaultLayout>}
        </div>
    );
};

export default connect(
    state => ({
        userLoading: state.app.userLoading,
        userData: state.app.userData,
    }),
    {fetchUser, setSearch},
)(withRouter(App));
