var url = "https://api.eve-echoes-market.com/market-stats/stats.csv";
var data;
var data_ajax;
var rows;
var res;
var data_call = [];
var xhr = new XMLHttpRequest();
xhr.open("GET", url);

var obj = {};


xhr.onreadystatechange = function () {
   if (xhr.readyState === 4) {
	   data = xhr.responseText;

      rows = data.split("\r\n");
      for (var i = 0; i < rows.length; i++) {
         var cells = rows[i].split(",");
         if (cells.length > 1) {
            var customer = {};
             customer[cells[1]] = {
               id: cells[0],
               name: cells[1],
               time: cells[2],
               sell: cells[3],
               buy: cells[4],
               lowest_sell: cells[5],
               highest_buy: cells[6],
           }
           data_call.push(customer);
         }
      }
	   document.getElementById("dvCSV").innerHTML = JSON.stringify(data_call);
      obj = JSON.stringify(data_call);
   }};

xhr.send();

