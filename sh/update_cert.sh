#!/bin/zsh

certbot renew
service apache2 restart
