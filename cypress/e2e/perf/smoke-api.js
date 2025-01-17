import http from 'k6/http'
import {sleep } from 'k6'



export const options = {
    vus: 5, //Uusários virtuais simultâneos para smoke-testes é até +- 5(recomendação do k6)
    duration: '30s',  //Duração para smoke teste é de alguns segundos a poucos minutos (recomendação do k6)
};


export default function () {    
    http.get('https://test.k6.io')    
    sleep(1);
} 
