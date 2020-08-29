const mariadb = require('mariadb/callback');
const conn = mariadb.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DTBS,
        connectionLimit: 5
    }
);

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