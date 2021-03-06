// @flow
import api from 'api';
import actionsTypes from './actionsTypes';
import config from 'config';
import {getDataFailedRequest} from 'utils';

export const updateSettings = ({user, ...params}) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.UPDATE});

    try {
        const request = await api.post(config.UPDATE_SETTINGS_URL, {
            user,
            ...params,
        });

        dispatch({
            type: actionsTypes.UPDATE_SUCCESS,
            payload: request.data,
        });


    } catch (e) {
        dispatch({
            type: actionsTypes.UPDATE_FAIL,
            payload: getDataFailedRequest(e),
        });
    }
};
