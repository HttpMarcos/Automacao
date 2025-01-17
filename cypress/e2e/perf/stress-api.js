import http from 'k6/http'
import {sleep } from 'k6'



export const options = {
    stages: [
        {duration: '10s', target: 10}, // ramp-up, mais usuários do que o averageLoad
        {duration: '20s', target: 10}, // Platô por mais tempo que o averageLoad
        {duration: '5s', target: 0}, //Ramp-down, pode ser o mesmo que o averageLoad
    ]
};


export default function () {    
    http.get('https://test.k6.io')    
    sleep(1);
} 
