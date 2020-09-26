---
title: 'מאקו VOD – קצת אחרת'
date: '2011-12-30T11:34:03+02:00'
status: publish
author: יהודה
excerpt: ''
type: post
id: 661
category:
    - נגנים
tags: []
post_format: []
---
אחרי פניות רבות בעניין מאקו VOD, חזרתי לבדוק את המצב שם ולראות איך ניתן לצפות בשידורים על מק ולינוקס ללא שימוש בסקריפטים. מסתבר שמאקו עברו בחלק מן הסדרות לנגן פלאש, שבסך הכל פועל לא רע. לסדרות אחרות (כמו רמזור), נדרשים עדיין מעקפים לצפיה במק. הפתעה לטובה היתה לי דווקא בלינוקס (נבדק על אובונטו 11.10), אבל נתחיל קודם במק:  
נכון לעכשיו, ניסיון של custup (ספקית הווידאו ברשת של מאקו) לתמוך במק יחד עם ישום לא מוצלח של flip4mac גורמים לבעיה. כדי להתגבר עליה, יש להתקין את הנגן [VLC](http://www.videolan.org/vlc/download-macosx.html), ולגרום לאתר לחשוב שאנחנו רצים דווקא על חלונות. אני אדגים את השיטה על סאפרי, אבל ניתן ליישם באופן דומה על פיירפוקס עם התוסף User Agent Switcher.

בספארי, צריך לבחור בתפריט הראשי Prefrences ושם בטאב ה Advanced, לבחור את האפשרות: Show Develop menu in menu bar. נסגור את החלון ונאתחל את ספארי.  
![הגדרות ספארי](https://img.skitch.com/20111228-kjbwn1ya1us757kd3yhtcrkirx.png)

יופיע תפריט חדש: Develop ושם נבחר בתת-התפריט User Agent את האפשרות Safari 5.1 – Windows. בעקרון אפשר לבחור כל כניסה אחרת המכילה את המילה Windows, אבל זו נראית לי הכי בטוחה (וגם תעזור לשמור על הסטטיסטיקות של ספארי, במקרה שמישהו במאקו בודק אותן).  
![שינוי שם הדפדפן](https://img.skitch.com/20111228-fhcppetmmx6shtj77pdsqxbx67.png)

שימו לב שהבחירה משפיעה רק על הטאב הנוכחי. עכשיו ניגש לדף התוכנית במאקו. נקבל את החלון הבא, ובו יש ללחוץ על הכתפור Click to Play:

![Click to Play](https://img.skitch.com/20111228-bwerwtcq2qipxnqm9y6ywnj85f.png)

יפתח טאב חדש ובו הווידאו ינסה לנגן. רוב הסיכויים שהוא יכשל, וכאן יש להעתיק את ה URL מראש הדף ולהדביק ב VLC.

![להעתיק את ה URL](https://img.skitch.com/20111228-f57921p9yiuxhs6igtjdeci7p9.png)

ב VLC, נבחר את האפשרות File-&gt;Open Network ונדביק את ה URL.

![Open Network](https://img.skitch.com/20111228-graukaq7utnuj15eafxwf7k643.png)  
![להדביק](https://img.skitch.com/20111228-88dcgisktijmai6ff14f49a4jj.png)

צפיה מהנה:

![סרט](https://img.skitch.com/20111228-1xyiamn37huhunpwkpy8yjpe36.jpg)
