---
title: 'רק שניה'
date: '2017-07-01T11:28:09+03:00'
status: publish
author: יהודה
excerpt: 'רק שניה מפרידה בין השעה 03:14:07 ל 03:14:08 בתאריך: 19 בינואר 2038. לכאורה, זה לא צריך לעניין אף אחד. אבל אם אתה יוניקס/טיים גיק כמוני, התאריך הזה מייד אמור להדליק לך נורה אדומה.'
ogImage: 'img/2017/07/raspberry-pi-open-sprinkler.jpg'
type: post
id: 787
tags:
    - זמן
    - לינוקס
    - 'קוד פתוח ותוכנה חופשית'
post_format: []
---
רק שניה מפרידה בין השעה 03:14:07 ל 03:14:08 בתאריך: 19 בינואר 2038. לכאורה, זה לא צריך לעניין אף אחד. אבל אם אתה יוניקס/טיים גיק כמוני, התאריך הזה מייד אמור להדליק לך נורה אדומה.  
למה? כי בשניה הזאת יעברו בדיוק 2,147,483,648 (או 2 בחזקת 31) שניות מתאריך 1.1.1970 בשעה 00:00:00. מחשב לינוקס בארכיטקטורת 32 ביט לא יכול להציג את הזמן הזה.  
 נסו להריץ את הפקודה הבאה על מחשב הלינוקס הקרוב:

```bash
date --date='@2147483647'
```

או במערכות מבוססות BSD (כמו macOS), את הפקודה הזאת:

```bash
date -r 2147483647
```

זה אמור לעבוד בלי בעיה. אבל אם תוסיפו שניה נוספת (כלומר להחליף את ה-7 ב-8), אתם עלולים לראות משהו כזה:  
![2038 on 32 bit Linux ](/img/2017/07/Unix-date-32-bit.jpg)

לעומת זאת, על מחשב 64 ביט, התוצאה תקינה:  
![2038 on 64 bit Linux ](/img/2017/07/Unix-date-64-bit.jpg)

אז למה זה מעניין עכשיו, ומה איכפת לי ממשהו שיקרה בעוד קצת יותר מ-20 שנה?

קודם כל, כי הזמן עובר. 20 שנה נשמע כמו המון זמן, אבל אם תסתכלו סביבכם בחדר, תראו לא מעט מכשירי חשמל שעובדים 20 שנה ויותר. תוסיפו לזה את העובדה שהיום כמעט כל מכשיר (ממנורה ועד טלוויזיה) מחובר לאינטרנט, ותבינו שיתכן שזו פצצת זמן שנדרכת עם כל קניה של מכשיר חדש שנעשית היום. וזה עוד בלי להזכיר מטוסים, בתי חולים, מערכות רכב (מישהו מוכן להיכנס למכונית אוטונומית ב 2038?) רמזורים, מעליות.

צילום המסך העליון, לדוגמה, נלקח ממחשב Raspberry Pi שמחובר למערכת ההשקיה בגינה שלי.  
![Raspberry Pi with Open Sprinkler ](/img/2017/07/raspberry-pi-open-sprinkler.jpg)  
האם הוא ישרוד עד 2038? אולי. עד עכשיו, החלפתי בממוצע מחשב השקייה כל 10 שנים: הראשון בגלל הבטרייה שזלגה, והשני עדיין עבד, רק שרציתי להחליף אותו בדגם שמאפשר תכנות דרך הרשת במקום ממשק לא ידידותי. למזלי, ה 19 בינואר יוצא בחורף, כך שיהיו לי כמה חודשים טובים לדאוג למחליף במידת הצורך.

ולמה נזכרתי בכל זה עכשיו? כי מחר (2 ביולי 2017) יעבור מספר השניות את סף ה 1.499 מיליארד, ובעוד שבועיים (14 ביולי) הוא יעבור את סף ה 1.5 מיליארד.

השעון מתקתק…

<figure class="text-center p-4 border-slate-600	border-2">
<pre class="to-be-replaced-by-time-ticker text-2xl">
</pre>
</figure>
