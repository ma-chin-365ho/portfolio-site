const mariadb = require('mariadb/callback');
const request = require('request');

const conn = mariadb.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DTBS,
        connectionLimit: 5
    }
);

const URL_INSTAGRAM_API='https://graph.facebook.com/v8.0/';
const INSTAGRAM_USERID=process.env.INSTAGRAM_USERID;
const INSTAGRAM_APP_TOKEN=process.env.INSTAGRAM_APP_TOKEN;
const INSTAGRAM_APP_OEMBED_TOKEN=process.env.INSTAGRAM_APP_OEMBED_TOKEN;
const URL_INSTAGRAM_POSTS=URL_INSTAGRAM_API + INSTAGRAM_USERID + '?fields=name,media.limit(99){caption,like_count,media_url,permalink,timestamp,username,comments_count}&access_token=' + INSTAGRAM_APP_TOKEN;
const URL_INSTAGRAM_OEMBED=URL_INSTAGRAM_API + 'instagram_oembed?fields=html,thumbnail_width,type,width&access_token=' + INSTAGRAM_APP_OEMBED_TOKEN + '&url=';

var get_instagram_options_base = {
    url: '',
    method: 'GET',
    json: true
};

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

var html_data = [];

var get_instagram_options_1 = get_instagram_options_base;
get_instagram_options_1.url = URL_INSTAGRAM_POSTS;
request(get_instagram_options_1, function (error, response, posts) {
    var url_list = [];
    posts.media.data.forEach(data => {
        url_list.push(data.permalink);
    });
    // console.log(url_list);
    urlToHtml_OEmbed(
        url_list,
        function() {
            // console.log(html_data);
            // conn.end();
            replace_db_record(5);
            return;
        }
    );
});

function urlToHtml_OEmbed(urls, callback) {
    if (urls.length == 0) {
        return callback();
    }
    else
    {
        let url = urls.shift();

        var get_instagram_options_2 = get_instagram_options_base;
        get_instagram_options_2.url = URL_INSTAGRAM_OEMBED + url;
        request(get_instagram_options_2, function (error, response, oembed) {
            html_data.push(oembed.html);
            // console.log(urls.length);
            urlToHtml_OEmbed(
                urls,
                callback
            );
        });
    }
}

function replace_db_record(web_site_id) {
    conn.query(query_text_1, [web_site_id], (err, res) => {
        let i = 0;
        let query_param_2 = [];
        var query_text_2 = query_text_2_base1;
        // console.log(html_data);
        html_data.forEach(html => {
            // make query
            query_text_2 = query_text_2 + query_text_2_base2;
            if (html_data.length != (i+1)) {
                query_text_2 = query_text_2 + ",";
            }

            // make query param
            query_param_2.push(i);
            query_param_2.push(html);
            query_param_2.push(web_site_id);

            i++;
        });
        query_text_2 = query_text_2 + ";";

        conn.query(query_text_2, query_param_2, (err, res) => {
          conn.end();
        });
    });
}
