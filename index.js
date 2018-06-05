const fs = require('fs'); //Funciones de file system para node
const request = require('request'); // obtenermos paquete request
const cheerio = require('cheerio'); //obtenemos cheerio para navergar en el DOM
const chalk = require('chalk');
const moment = require('moment');
const url = 'http://www.odeonstar.com.au/session-times/'; // definimos la URL donde obtener la petición

const options = {
  headers: {'User-Agent': 'node.js'}
}
let objetFinal=[]
console.log(`${chalk.green('Obteniendo la url:')} ${url}`);
request(url, options, (err, res, html) => {
  if(!err && res.statusCode === 200){
    let $  = cheerio.load(html);
    let fecha= null;
    $('.movie-listing').each(function(i,elem){
      $(this).find('.movie-content-column').each( function(i, elem){
        let title = $(this).find('.movie-title').text();

        $(this).find('.show-on-desktop').find('tr').find('td').each( function(i2, elem2){
          let dayStr = $(this).text();
          let hours = null;
          let fechaCompleta = null;
          let sesion = {};
          sesion.title = title;
          if($(this).hasClass('date')){
            let day =dayStr.split(' ')[1].substr(0, 2);
            let month = dayStr.split(' ')[2];
            fecha = `${day}-${month}`;
          }else{
            hours = dayStr.replace(".",":");
            hours = `${hours.slice(0, -2)} ${hours.slice(-2)}`;
          }
          if(hours!== null && hours.trim()){
            if(hours.includes('no on')){
              hours = hours.replace('no on',':00 am');
            }
            fechaCompleta = moment(`${fecha} ${hours}`, 'DD-MMMM hh:mm A').format('DD/MM/YYYYTHH:mm');
            sesion.horario = fechaCompleta;
            objetFinal.push({sesion});
          }
        });
      });
    });
    fs.writeFileSync('archive.json',JSON.stringify(objetFinal));
    console.log(`${chalk.green('archivo generado correctamente.')}`);
  } else {
    console.error(`${chalk.red('Error no se puede procesar la solucitud: ')} ${err}`);
    process.exit(1);
  }
});
