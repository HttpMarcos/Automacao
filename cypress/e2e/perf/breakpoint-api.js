import http from 'k6/http'
import {sleep } from 'k6'



export const options = {
    executor: 'ramping-arrival-rate',
    stages: [
        {duration: '1m', target: 100}, // ramp-up, maior quantidade de VUs possiveis
    ]
}

export default function () {    
    http.get('https://test.k6.io')    
    sleep(1);
} 
