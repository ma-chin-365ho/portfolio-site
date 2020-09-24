#!/bin/zsh

cd /var/www/html

forever stop server.js

# Update Instagram HTML
node batch_instagram.js
# Update Yotube HTML
node batch_youtube.js
# Update Qiita HTML
node batch.js

forever start server.js