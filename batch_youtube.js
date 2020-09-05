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

const URL_YOUTUBE_API='https://www.googleapis.com/youtube/v3/';
const YOUTUBE_APP_KEY=process.env.YOTUBE_APP_KEY;
const MY_YOUTUBE_CHANNEL_ID=process.env.YOUTUBE_CHANNEL_ID;
const URL_YOUTUBE_CHANNELS=URL_YOUTUBE_API + 'channels?key=' + YOUTUBE_APP_KEY + '&part=snippet,statistics,contentDetails&id=' + MY_YOUTUBE_CHANNEL_ID;
const URL_YOUTUBE_PLAYLISTITEMS=URL_YOUTUBE_API + 'playlistItems?key=' + YOUTUBE_APP_KEY + '&part=snippet,contentDetails&playlistId=';
const URL_YOUTUBE_VIDEOS=URL_YOUTUBE_API + 'videos?key=' + YOUTUBE_APP_KEY + '&part=player&id=';

var get_yotube_options_base = {
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

var get_youtube_options_1 = get_yotube_options_base;
get_youtube_options_1.url = URL_YOUTUBE_CHANNELS;
request(get_youtube_options_1, function (error, response, ch_info) {

    var playlistId = ch_info.items[0].contentDetails.relatedPlaylists.uploads;
    var get_youtube_options_2 = get_yotube_options_base;
    get_youtube_options_2.url = URL_YOUTUBE_PLAYLISTITEMS + playlistId;
    request(get_youtube_options_2, function (error, response, playlist_info) {
        var videoId_list = [];
        playlist_info.items.forEach(item => {
            videoId_list.push(item.snippet.resourceId.videoId);
        });
        var get_youtube_options_3 = get_yotube_options_base;
        get_youtube_options_3.url = URL_YOUTUBE_VIDEOS + videoId_list.join(',');
        request(get_youtube_options_3, function (error, response, video_info) {
            video_info.items.forEach(item => {
                html_data.push(item.player.embedHtml);
            });
            // console.log(html_data);
            replace_db_record();
        });
    });
});

function replace_db_record() {
    conn.query(query_text_1, [0], (err, res) => {
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
            query_param_2.push(0);

            i++;
        });
        query_text_2 = query_text_2 + ";";

        conn.query(query_text_2, query_param_2, (err, res) => {
          conn.end();
        });
    });
}
