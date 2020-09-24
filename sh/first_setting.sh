
#!/bin/sh

# export NODE_ENV=production
export NODE_ENV=development


export DB_HOST=
export DB_USER=
export DB_PASS=
export DB_DTBS=

export YOTUBE_APP_KEY=
export YOUTUBE_CHANNEL_ID=

export INSTAGRAM_USERID=
export INSTAGRAM_APP_TOKEN=
export INSTAGRAM_APP_OEMBED_TOKEN=

# dev only
mysql.server start
export PATH=$PATH:~/.nodebrew/current/bin/
