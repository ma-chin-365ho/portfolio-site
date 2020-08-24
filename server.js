const http = require('http');
 
// const hostname = 'www.ma299.me';
const hostname = '127.0.0.1'
// const port = 80;
const port = 3000;
 
var fs = require('fs');

/***************************************************************/
const server = http.createServer((req, res) => {
    fs.readFile('./public/index.html', 'utf-8' , doReard );    
    function doReard(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    }
});

 
/*
server.on('request', doRequest);
 
function doRequest(req, res) {
    
    fs.readFile('./public/index.html', 'utf-8' , doReard );    
    function doReard(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    }
    
}
*/
/***************************************************************/

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
