---
title: 'php 7.4'
date: '2020-03-01T22:07:57+02:00'
status: publish
author: יהודה
excerpt: ''
type: post
id: 859
categories:
    - וורדפרס
    - לינוקס
    - 'קוד פתוח ותוכנה חופשית'
tags:
    - nano
    - php
    - vi
    - wordpress
post_format: []
---
חלפה למעלה משנה מאז ש[התמיכה ב-7.0 php הופסקה](https://www.php.net/eol.php), וזה הזמן לשדרג את הבלוג לגרסה 7.4. כרגיל, צריך לקרוא את כל ה breaking changes, אבל אם הבלוג והתוספים מתוחזקים לגרסה העדכנית ביותר, אפשר לסמוך בדרך כלל שהכל יעובד. גיבוי של הקוד והדאטה רצוי גם כן.

את הגיבויים אני מבצע לאחרונה בעזרת [restic](https://restic.net/), כאשר הקבצים מועלים לאכסון (הזול יחסית) של [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html).

אחרי שמכניסים את הגדרות ל restic למשתני סביבה, סקריפט הגיבוי פשוט למדי:

```
#!/bin/bash
d=$(date +%Y-%m-%d)
mysqldump -u *** -p *** > ~/backup/sql/yehudab-${d}.sql
gzip ~/backup/sql/*.sql
tar -czf ~/backup/site/yehudab.com-${d}.tar.gz yehudab.com
restic backup ~/backup
```

לצורך השדרוג, עקבתי אחרי [המדריך ב CloudBooklet](https://www.cloudbooklet.com/upgrade-php-version-to-php-7-4-on-ubuntu/). מכוון שאני מריץ php דרך ngnix, ביצעתי את הסעיפים הרלוונטים לגרסת fpm.

אה, וכמובן, להשתמש ב vi, כי nano זה לחלשים.

אחרי השדרוג, אני מנסה לשמור את הפוסט הזה ובום error 500. בדיקה מהירה בלוג של nginx על השרת מגלה ששכחתי להתקין את php7.4-memcache שהמדריך הנ"ל לא מחשיב כ common extension. הרצת:

```
sudo apt install php7.4-memcache
```

וריסטרט לשרת פתרו את הבעיה.  
![שדרוג](/img/2020/upgrade.png)
