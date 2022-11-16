---
title: HTTP/2
date: '2017-07-07T17:18:52+03:00'
status: publish
author: יהודה
excerpt: 'עוד שדרוג קטן לבלוג. הפעם העברתי את השרת מ apache ל nginx, ועל הדרך הפעלתי HTTP/2. זה אמור לשפר את הביצועים, למרות שאני לא ממש מרגיש בזה בנתיים.'
ogImage: 'img/2017/nginx-logs-sm.jpg'
type: post
id: 796
category:
    - וורדפרס
    - לינוקס
    - 'קוד פתוח ותוכנה חופשית'
tags: []
post_format: []
---
עוד שדרוג קטן לבלוג.  
הפעם העברתי את השרת מ apache ל nginx, ועל הדרך הפעלתי HTTP/2.  
זה אמור לשפר את הביצועים, למרות שאני לא ממש מרגיש בזה בנתיים.

![Hex dump of nginx logs](/img/2017/nginx-logs-sm.jpg)

למעוניינים, [המדריך הזה](https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-with-http-2-support-on-ubuntu-16-04) מסביר על התקנת nginx, והגדרות HTTP/2. [כאן](http://nginxlibrary.com/wordpress-permalinks/) תמצאו הסבר על ההגדרות הדרושות ב nginx לטובת הפעלת WordPress במקום mod\_rewrite של apache.

התוצאה הסופית של כל ההגדרות האלה, כפי שנשמרה בקובץ ‎/etc/nginx/sites-available/default היא זו:

```nginx
server {

        listen 443 ssl http2 default_server;
        listen [::]:443 ssl http2 default_server;
        include snippets/gzip.conf;

        ssl_certificate /etc/nginx/ssl/live/yehudab.com/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/live/yehudab.com/privkey.pem;
        ssl_dhparam /etc/nginx/ssl/live/yehudab.com/dhparam.pem;

        root /var/www/yehudab.com;

        index index.html index.htm index.php index.nginx-debian.html;

        server_name yehudab.com;

        location / {
                try_files $uri $uri/ =404;
        }

        location /blog/ {
                try_files $uri $uri/ /blog/index.php?$args;
        }
        location ~ \.php$ {
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/run/php/php7.0-fpm.sock;
        }

        location ~ /\.ht {
                deny all;
        }
        include snippets/expires.conf;
}

server {
       listen         80;
       listen    [::]:80;
       server_name    yehudab.com;
       return         301 https://$server_name$request_uri;
}
```

לאחר סיום ההגדרות, ניתן לוודא את תמיכת האתר ל HTTP/2 באמצעות [דף הבדיקה של KeyCDN](https://tools.keycdn.com/http2-test).
