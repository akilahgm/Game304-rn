import axios from 'axios';
import {API_URL} from '../utils/appConstants';


export async function Get(url) {
  const headers = {
    'Content-Type': 'application/json'
  };
  return await axios({
    method: 'GET',
    url: API_URL + url,
    headers: headers,
  }).then((response) => {
    return response.data;
  }).catch((error) => {
    return error;
  });
}

export async function POST(url, data) {
  const headers = {
    'Content-Type': 'application/json'
  };
  return await axios({
    method: 'POST',
    url: API_URL + url,
    data: data,
    headers: headers,
  }).then((response) => {
  
    return {response};
  }).catch((error) => {
    console.log(error);
    return error;
  });
}

export async function PATCH(url, data) {
  const headers = {
    'Content-Type': 'application/json'
  };
  return await axios({
    method: 'PATCH',
    url: API_URL + url,
    data: data,
    headers: headers,
  }).then((response) => {
    return response;
  }).catch((error) => {
    console.log(error);
    return error;
  });
}









