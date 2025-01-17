import http from 'k6/http'
import {sleep } from 'k6'



export const options = {
    stages: [
        {duration: '5s', target: 5}, // ramp-up, igual do averageload
        {duration: '1m', target: 5}, // Platô por MUITO mais tempo que o averageLoad
        {duration: '5s', target: 0}, //Ramp-down, igual do averageload
    ]
};


export default function () {    
    http.get('https://test.k6.io')    
    sleep(1);
} 
