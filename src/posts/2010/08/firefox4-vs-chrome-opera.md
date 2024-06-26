---
title: 'כרום ואופרה זהירות: פיירפוקס 4 מאחוריכם! (ולפעמים גם משיג)'
date: '2010-08-30T08:09:30+03:00'
status: publish
author: יהודה
excerpt: 'רבים וטובים נוטשים לאחרונה את פיירפוקס לטובת כרום או אופרה. כמעט כולם מציגים את עניין המהירות (במיוחד על לינוקס) כסיבה הראשית לנטישה. מוזילה שמה את שיפור המהירות של פיירפוקס כאחד היעדים העיקריים של גרסה 4, והשחרור של הבטא הרביעית של פיירפוקס 4 הוא סיבה טובה לבדוק האם ההבטחה מתממשת.'
ogImage: 'img/2010/08/mandelbrot.png'
type: post
id: 503
tags:
    - דפדפנים
    - 'קוד פתוח ותוכנה חופשית'
post_format: []
---
[רבים](http://www.holesinthenet.co.il/archives/3509) ו[טובים](http://blog.k1789.org/?p=1272) [נוטשים](http://idanm.wordpress.com/2010/08/26/%D7%9E%D7%95%D7%96%D7%99%D7%9C%D7%94-%D7%9E%D7%90%D7%91%D7%93%D7%AA-%D7%90%D7%AA-%D7%9B%D7%95%D7%97%D7%94-%D7%91%D7%A9%D7%95%D7%A7-%D7%94%D7%93%D7%A4%D7%93%D7%A4%D7%A0%D7%99%D7%9D/) לאחרונה את פיירפוקס לטובת כרום או אופרה. כמעט כולם מציגים את עניין המהירות (במיוחד על לינוקס) כסיבה הראשית לנטישה. מוזילה שמה את שיפור המהירות של פיירפוקס כאחד היעדים העיקריים של גרסה 4, [והשחרור של הבטא הרביעית](http://mozilla.org.il/news/2010/08/24/firefox4b4/) של פיירפוקס 4 הוא סיבה טובה לבדוק האם ההבטחה מתממשת.

בתור התחלה, חזרתי על מבחן ה SunSpider [שביצע CHAOS6](http://www.whatsup.org.il/modules.php?op=modload&name=News&file=article&sid=6707), כאשר המטרה היא לבחון את פיירפוקס מול המתחרים העיקריים (כרום ואופרה), אבל גם להשוות את גרסת החלונות מול גירסת לינוקס. הגרסאות שנבדקו הן: פיירפוקס 3.6.8, פיירפוקס 4.0b4, כרום 5 (כרומיום בלינוקס), ואופרה 10.61. מערכות ההפעלה הן XP SP3 ו – Xubuntu 10.04. התוצאות הן די טובות מבחינת פיירפוקס, כאשר שיפור הביצועים הוא קצת פחות מפי 2 על חלונות ופי 2.3 על לינוקס. ולא פחות חשוב: הפערים בין גרסאות הלינוקס וחלונות של פיירפוקס 4 מבחינת ביצועים צומצמו בהרבה, והם אפילו טובים יותר מהפערים בין גרסאות כרום על פלטפורמות אלה. במבחן זה פיירפוקס עדיין לא שובר את השוק, אבל בהחלט חזר להתחרות בליגה של הגדולים. התוצאות המלאות בגרף המצורף (ערכים קטנים יותר טובים יותר)  
![SunSpider firefox4 firfox3.6 chrome opera](/img/2010/08/sunspider-test.png)

בשלב השני הרצתי השוואה שונה לגמרי. כאן לא מדובר על מבחן סינטטי, אלא [דף שלם](http://yehudab.com/apps/mandelbrot2), שכל מטרתו להציג אזורים יפים של [קבוצת מנדלברוט](http://he.wikipedia.org/wiki/%D7%A7%D7%91%D7%95%D7%A6%D7%AA_%D7%9E%D7%A0%D7%93%D7%9C%D7%91%D7%A8%D7%95%D7%98). את הדף המקורי כתב [Kostas Symeonidis](http://www.atopon.org/) ואני שכללתי אותו כך שיכלול אופטימזציות נוספות מצד אחד, אבל גם הגדלה של רוחב אזור הציור, ו"העמקה" של החישוב (הגדלה של מספר האיטרציות המקסימלי לפני הכרזה על צבע שחור). בנוסף, הכנסתי אפשרות לשימוש ב [Web workers](https://developer.mozilla.org/en/Using_web_workers), שמאפשרת ניצול טוב יותר של מחשבים עם מספר מעבדים (או ליבות) לטובת החישוב הכבד, וגם מונעת הודעות מעצבנות על סקריפטים תקועים. לטובת המבחן נבחר האזור המוצג למטה ([וגם להרצה אצלכם](http://yehudab.com/apps/mandelbrot2/#640,360,0.3178943432911429,0.31789886999774175,-0.03259077318982726,-0.03258818319755894)), המתאפיין בכך שיש לו אזורים שחורים רבים (יותר חישובים), וגם האזורים הצבעוניים שלו "עמוקים" למדי. תודה [לסיימון](http://www.smontagu.org/blog/) על הקורדינטות.  
![Mandelbrot speed test](/img/2010/08/mandelbrot.png)

את המבחן הרצתי רק על סביבת חלונות (אין לי מחשב לינוקס מרובה ליבות), והתוצאות מפתיעות ביותר, כאשר כרום נמצא הרחק מאחור (פער של פי 8 על מעבד אחד ופי 5 על שניים) ואופרה אולי נותן פייט יפה על מעבד אחד מול פיירפוקס 3.6, אבל נכשל לחלוטין במבחן ריבוי המעבדים ובוודאי מול פיירפוקס 4.0.  
![Floating point speed test firefox4 firefox 3.6 chrome opera](/img/2010/08/mandelbrot-test.png)

אז נכון, זה רק מבחן אחד, אבל איזה יופי של מבחן…
