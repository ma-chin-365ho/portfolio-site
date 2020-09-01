const mariadb = require('mariadb/callback');
// const https = require('https');
const request = require('request');
const hogan = require("hogan.js");


const conn = mariadb.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DTBS,
        connectionLimit: 5
    }
);

const URL_MY_QIITA = 'https://qiita.com/api/v2/users/ma-chin-365ho/items';

// const URL_QIITA_OEMBED_ENDPOINT = 'https://qiita.com/oembed';

const get_qiita_options = {
    url: URL_MY_QIITA,
    method: 'GET',
    json: true
};

const html_mst = '<p><a href="{{url}}">{{title}}</a>&nbsp&nbspLGTM:{{likes_count}}&nbsp&nbspコメント数:{{comments_count}}</p>';

const query_text_1 = 
    "DELETE "                + 
    " FROM emb_html"         + 
    " WHERE web_site_id = ?"          + 
    ";";

const query_text_2_base1 = 
    "INSERT INTO emb_html (" + 
    "id , html, web_site_id" + 
    ") VALUES ";
const query_text_2_base2 = 
    "(?, ?, ?)";

// https.get(URL_MY_QIITA, function (res) {
request(get_qiita_options, function (error, response, posts) {
 
    var tmpl_html = hogan.compile(html_mst);

    // console.log(body);
    var html_data = [];
    posts.forEach(post => {
    /*
        console.log(post.title);
        console.log(post.updated_at);
        console.log(post.likes_count);
        console.log(post.comments_count);
        console.log(post.url);
    */
        html_data.push (
            tmpl_html.render({
                url : post.url,
                title : post.title,
                likes_count : post.likes_count,
                comments_count : post.comments_count
            })
        );
    });

    // console.log (html_data);

    conn.query(query_text_1, [1], (err, res) => {
        // console.log(res); //[ {val: 1}, meta: ... ]

        let i = 0;
        let query_param_2 = [];
        var query_text_2 = query_text_2_base1;
        html_data.forEach(html => {
            // make query
            query_text_2 = query_text_2 + query_text_2_base2;
            if (html_data.length != (i+1)) {
                query_text_2 = query_text_2 + ",";
            }

            // make query param
            query_param_2.push(i);
            query_param_2.push(html);
            query_param_2.push(1);

            i++;
        });
        query_text_2 = query_text_2 + ";";

        // console.log(query_text_2); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
        // console.log(query_param_2); // { affectedRows: 1, insertId: 1, warningStatus: 0 }

        conn.query(query_text_2, query_param_2, (err, res) => {
          // console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.end();
        });
    });
});



/*
var query_text = 
    "SELECT"                          +  
    "  eh.html AS html,"              +
    "  ws.nm   AS web_site_nm"        +
    " FROM emb_html AS eh"            + 
    " LEFT OUTER JOIN web_site AS ws" + 
    " ON eh.web_site_id = ws.id"      +
    " ORDER BY eh.id"                 +
    ";";
conn.query(query_text, (db_err, rows) => {
//conn.query("SELECT id as val from web_site", (err, rows) => {
    console.log(rows); //[ {val: 1}, meta: ... ]
    console.log(typeof(rows));

    var toString = Object.prototype.toString
    console.log(toString.call(rows));
    
    console.log(rows.length);

    conn.end();
});
*/