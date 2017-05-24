import * as types from './types';
import fetch from 'isomorphic-fetch';

// All data types merged
export function filterTable(filter) {
    return {
        type: types.FILTER,
        filter
    };
}

export function selectData(venomkb_id) {
    return {
        type: types.SELECT_DATA,
        venomkb_id
    };
}

function requestData(venomkb_id) {
    return {
        type: types.REQUEST_DATA,
        venomkb_id
    };
}

function receiveData(venomkb_id, json) {
    return {
        type: types.RECEIVE_DATA,
        venomkb_id,
        json,
        receivedAt: Date.now()
    };
}

export function fetchData(venomkb_id) {
    const dataType = venomkb_id.charAt(0);
    switch (dataType) {
        case 'P':
            return dispatch => {
                dispatch(requestData(venomkb_id));
                return fetch(`http://localhost:3001/proteins/${venomkb_id}`)
                    .then(response => response.json())
                    .then(json => dispatch(receiveData(venomkb_id, json[0])));
            };

        case 'S':
            return dispatch => {
                dispatch(requestData(venomkb_id));
                return fetch(`http://localhost:3001/species/${venomkb_id}`)
                    .then(response => response.json())
                    .then(json => dispatch(receiveData(venomkb_id, json[0])));
            };
        default:
            return 'Error: Bad Venomkb ID passed to fetchData()';
    }
}
