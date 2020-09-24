#!/bin/sh

certbot renew
service apache2 restart
