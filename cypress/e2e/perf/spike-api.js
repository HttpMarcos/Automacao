import http from 'k6/http'
import {sleep } from 'k6'



export const options = {
    stages: [
        {duration: '10s', target: 30}, // ramp-up, maior quantidade de uusário de VUs possíveis
        {duration: '5s', target: 0}, //Ramp-down, em 5s eu zero minhas VUs
    ]
};


export default function () {    
    http.get('https://test.k6.io')    
    sleep(1);
} 
