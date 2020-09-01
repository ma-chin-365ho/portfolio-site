//const http = require('http');
const https = require('https');
const hogan = require("hogan.js");
const fs = require('fs');
// const mariadb = require('mariadb/callback');
const mariadb = require('mariadb/callback');

const env_setting = {
    production : {
        hostname : 'www.ma299.me',
        port : 3000,
        ssl_server_key : '/etc/letsencrypt/live/www.ma299.me/privkey.pem',
        ssl_server_crt : '/etc/letsencrypt/live/www.ma299.me/cert.pem'
    },
    development : {
        hostname : '127.0.0.1',
        port : 3000,
        ssl_server_key : '/Users/stmsnr/server.key',
        ssl_server_crt : '/Users/stmsnr/server.crt'
    }
}

const hostname = env_setting[process.env.NODE_ENV]['hostname'];
const port = env_setting[process.env.NODE_ENV]['port'];
var ssl_server_key = env_setting[process.env.NODE_ENV]['ssl_server_key'];
var ssl_server_crt = env_setting[process.env.NODE_ENV]['ssl_server_crt'];

var options = {
        key: fs.readFileSync(ssl_server_key),
        cert: fs.readFileSync(ssl_server_crt)
};

const conn = mariadb.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DTBS,
        connectionLimit: 5
    }
);

/***************************************************************/
var v_youtube_postings = [];
var v_qiita_postings = [];
var v_soundcloud_postings = [];
var v_instagram_postings = [];

const query_text = 
    "SELECT"                          +  
    "  eh.html AS html,"              +
    "  ws.nm   AS web_site_nm"        +
    " FROM emb_html AS eh"            + 
    " LEFT OUTER JOIN web_site AS ws" + 
    " ON eh.web_site_id = ws.id"      +
    " ORDER BY eh.id"                 +
    ";";
conn.query(query_text, (db_err, emb_html_rows) => {
    // console.log(emb_html_rows.length);

    var youtube_postings = [];
    var qiita_postings = [];
    var soundcloud_postings = [];
    var instagram_postings = [];

    for (var i = emb_html_rows.length - 1; i >= 0; i--)
    {
        if (emb_html_rows[i]['web_site_nm'] == 'Yotube')
        {
            youtube_postings.push(emb_html_rows[i]['html']);
        }
        else if (emb_html_rows[i]['web_site_nm'] == 'Qiita')
        {
            qiita_postings.push(emb_html_rows[i]['html']);
        }
        else if (emb_html_rows[i]['web_site_nm'] == 'Soundcloud')
        {
            soundcloud_postings.push(emb_html_rows[i]['html']);
        }
        else if (emb_html_rows[i]['web_site_nm'] == 'Instagram')
        {
            instagram_postings.push(emb_html_rows[i]['html']);                    
        }
    }

    var v_tmpLine = { post1 : '', post2 : '' };
    var idx = 0;

    v_tmpLine = { post1 : '', post2 : '' };
    idx = 0;
    youtube_postings.forEach(html => {
        if ((idx % 2) == 0) {
            v_tmpLine["post1"] = html;
        } else {
            v_tmpLine["post2"] = html;
            v_youtube_postings.push(v_tmpLine);
            v_tmpLine = { post1 : '', post2 : '' };
        }
        idx++;
    });
    if ((idx % 2) == 1) {v_youtube_postings.push(v_tmpLine);}

    v_qiita_postings = qiita_postings;

    v_tmpLine = { post1 : '', post2 : '' };
    idx = 0;
    soundcloud_postings.forEach(html => {
        if ((idx % 2) == 0) {
            v_tmpLine["post1"] = html;
        } else {
            v_tmpLine["post2"] = html;
            v_soundcloud_postings.push(v_tmpLine);
            v_tmpLine = { post1 : '', post2 : '' };
        }
        idx++;
    });
    if ((idx % 2) == 1) {v_soundcloud_postings.push(v_tmpLine);}

    v_tmpLine = { post1 : '', post2 : '' };
    idx = 0;
    instagram_postings.forEach(html => {
        if ((idx % 2) == 0) {
            v_tmpLine["post1"] = html;
        } else {
            v_tmpLine["post2"] = html;
            v_instagram_postings.push(v_tmpLine);
            v_tmpLine = { post1 : '', post2 : '' };
        }
        idx++;
    });
    if ((idx % 2) == 1) {v_instagram_postings.push(v_tmpLine);}

    conn.end();
});


// const server = http.createServer((req, res) => {
const server = https.createServer(options, (req, res) => {
    fs.readFile('./public/index.html', 'utf-8' , doReard );    
    function doReard(frd_err, data) {

            var tmpl_index = hogan.compile(data);
            var res_data = tmpl_index.render({
                youtube: v_youtube_postings,
                qiita: v_qiita_postings,
                soundcloud: v_soundcloud_postings,
                instagram: v_instagram_postings
            });

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(res_data);
            res.end();
    }
});

/***************************************************************/

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
