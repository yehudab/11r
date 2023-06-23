---
title: חישוב מסלול נסיעה בתחבורה ציבורית
date: 2012-05-18T11:21:13+03:00
status: publish
author: יהודה
excerpt: 'משרד התחבורה החל לפרסם לפני כשבוע מאגר מידע חדש הכולל לוחות זמנים ונתיבים של התחבורה הציבורית בארץ. המאגר מפורסם לפי תקן פתוח של גוגל שנקרא GTFS. במסגרת שיתוף פעולה של מספר חברים ברשימת התפוצה של המקור, הקמנו פיילוט שמדגים את יכולות המאגר'
ogImage: 'img/2012/05/otp-il-1.png'
type: post
id: "665"
tags:
    - קוד פתוח ותוכנה חופשית
post_format: []

---
משרד התחבורה החל לפרסם לפני כשבוע מאגר מידע חדש הכולל לוחות זמנים ונתיבים של התחבורה הציבורית בארץ. [המאגר](http://data.gov.il/dataset/383) מפורסם לפי תקן פתוח של גוגל שנקרא GTFS. במסגרת שיתוף פעולה של מספר חברים ברשימת התפוצה של [המקור](http://www.hamakor.org.il/), הקמנו פיילוט שמדגים את יכולות המאגר. הקוד בפיילוט מבוסס על פרויקט OpenTripPlanner. תודה לירון על עבודת התרגום, ולשאר החברים על העידוד והתמיכה.

עד להקמת שרת ציבורי, ניתן להתרשם מצילומי המסך:

מסלול שלם:  
![מסלול שלם](/img/2012/05/otp-il-1.png)

התמקדות על מקטעים:  
![התמקדות על מקטעים](/img/2012/05/otp-il-2.png)

גרסה להדפסה:  
![גרסה להדפסה](/img/2012/05/otp-il-3.png)

### ההסבר בהמשך מיועד למי שרוצה להקים שרת. לא למי שרוצה לחשב מסלול !! (מה שנקרא: Don't try this at home).

להקמת השרת, יש לבצע את הפעולות הבאות: (זה הרקע. הקוד בפסקה הבאה מבצע את הפעולות)

לוודא שאזור הזמן של השרת הוא Asia/Jerusalem.  
להוריד ולפתוח את הקוד של OpenTripPlanner (גודל הקובץ כ 90MB) וליצור קישור סימבולי ל / .  
להוריד ולפתוח קובץ Open Street Map של ישראל מהאתר [cloudmade.com](http://downloads.cloudmade.com/asia/western_asia/israel) (גודל הקובץ 22MB).  
למצוא את כתובת קובץ ה GTFS [מאתר מאגרי המידע ](http://data.gov.il/dataset/383)של הממשלה, ולהוריד אותו. מכוון שהקובץ מוגש (זמנית?) משרת ftp ולא http, צריך לארח אותו מחדש על שרת אחר. בדוגמאות הקוד בהמשך האירוח הוא בשרת מקומי

```shell
$ date
# Make sure timezone is correct. If not, run the command:
# $ sudo ln -sf /usr/share/zoneinfo/Asia/Jerusalem /etc/localtime
# make sure ntp is installed and running. if not, follow these instructions: <a href="http://www.ehow.com/how_8251011_sync-time-centos.html">http://www.ehow.com/how_8251011_sync-time-centos.html</a>
$ mkdir ~/GTFS
$ cd ~/GTFS
$ curl -L -O "http://maps5.trimet.org/otp-dev/otp.zip"
$ curl -L -O "http://downloads.cloudmade.com/asia/western_asia/israel/israel.osm.bz2"
$ curl -L -O "ftp://199.203.58.18/israel-public-transportation.zip"
# !! replace IP above with correct IP
$ unzip otp.zip
$ bunzip2 israel.osm.bz2
$ sudo ln -s ~/GTFS/otp /
$ ln -s ~/GTFS/israel.osm /otp/cache/osm/
```

יש לערוך מספר קבצי הגדרות:

```shell
$ vi /otp/graph-builder.xml
# Line 13, change properties to 'name="path" value="/home/yehuda/GTFS/israel-public-transportation.zip"'
#              (or whatever path you placed the file in)
# Line 40, change file name of OSM from or-wa.osm to israel.osm (just file part)
$ vi /otp/bin/build-graph.sh
# Line 1, change -Xmx2048m to -Xmx6114m. If you have more memory, put as much as possible
$ vi /otp/bin/start-server.sh
# Line 1, change -Xmx2048m to -Xmx4096m. If you have more memory, put as much as possible
```

בניית הגרף (משלב נתוני OSM עם נתוני תח"ץ)

```shell
$ cd /otp
$ bin/build-graph.sh >& ~/GTFS/build-graph.err
# might take 15-30 minutes depending on processor power and memory
$ ls -l /otp/Graph.obj
# should be around 1GB
```

אחרי הריצה חשוב לוודא בלוג שאין תעופה בגלל חוסר זכרון !!

עכשיו אפשר להריץ את השרת האפליקטיבי:

```shell
$ cd /otp
$ bin/start-server.sh
# Wait for line: "Winstone Servlet Engine v0.9.10 running..."
```

עכשיו אפשר לפתוח דפדן לכתובת : http://localhost:8080/opentripplanner-webapp/index.html (אם השרת אינו מקומי, להחליף localhost בכתובת השרת). ולנסות לחשב מסלול.

תרגום לעברית:  
לבדוק האם הקובץ ‎/otp/webapps/opentripplanner-webapp/js/otp/locale/Hebrew.js‏ קיים. אם לא, להוריד אותו [מכאן](https://github.com/openplans/OpenTripPlanner/blob/master/opentripplanner-webapp/src/main/webapp/js/otp/locale/Hebrew.js) ולשמור בנתיב הנ"ל. אחר-כך, יש לבצע מספר תיקונים בקוד:

```shell
$ vi /otp/webapps/opentripplanner-webapp/index.html
# line 2, add 'dir="rtl"' to html tag
# line 53, duplicate this line and change file name to "js/otp/locale/Hebrew.js"
$ vi /otp/webapps/opentripplanner-webapp/js/otp/config.js
# line 12, change otp.locale.English to otp.locale.Hebrew (at end of line)
# line 175, change value of 'enabled' to 'true'
# line 177, add this to end of string:
# + '<div style="margin:10px auto;width:205px"><a href="http://www.opentripplanner.org/"><img src="images/logo-otp.png" title="OpenTripPlanner" /></a>' +  '<a style="margin:0 10px" href="http://www.hamakor.org.il/"><img src="images/logo-hamakor.png" title="עמותת המקור" /></a>' + '<a href="http://www.hetz.biz/"><img src="images/logo-hetz.png" title="חץ ביז" /></a></div>'
$ vi /otp/webapps/opentripplanner-webapp/js/otp/locale/Hebrew.js
# line 28, change title to: "אודות האתר"
# line 29, change content to:
# 'אתר זה הוקם ע"י יהודה ב. על בסיס נתוני "לו"ז ומידע גאוגראפי בתחבורה הציבורית" הזמינים מאתר <a href="http://data.gov.il/">data.gov.il</a> ועל בסיס תוכנת הקוד הפתוח <a href="http://www.opentripplanner.org/">OpenTripPlanner</a>.' + '<br>' + 'תרגום התוכנה לעברית בוצע ע"י ירון שהרבני. אירוח אתר זה בחסות <a href="http://www.hamakor.org.il/">עמותת המקור</a> ובאדיבות <a href="http://www.hetz.biz/">חץ ביז</a>.' + '<br>' +  'תנאי שימוש: עמותת המקור עושה כמיטב יכולתה בכדי לספק שירות זה על בסיס נתונים מדוייקים ועדכניים אולם ייתכנו טעויות. המידע ניתן כפי שהוא ללא אחריות. ראו גם <a href="http://data.gov.il/dataset/383">תנאי שימוש של משרד התחבורה</a>.'
```

עכשיו לרפרש את הדפדפן ולהנות מההמשק העברי. יתכן שתתקבל הודעה על כשלון בחישוב המסלול. במקרה זה, יש לבחור תאריך חדש לחישוב בתחום המכוסה על-ידי הקובץ (יום הורדת הקובץ ועד שבועיים קדימה)
