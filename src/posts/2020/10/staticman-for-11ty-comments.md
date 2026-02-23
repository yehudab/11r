---
date: '2020-10-03T10:18:58.000+00:00'
status: draft
author: יהודה
type: post
title: ניהול תגובות באמצעות staticman
excerpt: 'בפוסט הקודם הסברתי איך לייבא את התגובות הישנות מ Wordpress ל-11ty. בפוסט הזה, אראה איך להתקין שרת Staticman, ואיך לחבר אליו את טופס התגובות באתר.'
ogImage: 'img/2020/10/staticman-logo.png'
tags:
- staticman
- 11ty
path: staticman-for-11ty-comments

---
ב[פוסט הקודם](/blog/2020/08/11ty-howto-migrate/ "מוורדפרס ל-11ty") הסברתי איך לייבא את התגובות הישנות מ Wordpress ל-[11ty](https://www.11ty.dev/). בפוסט הזה, אראה איך להתקין שרת [Staticman](https://staticman.net/), ואיך לחבר אליו את טופס התגובות באתר.

![Staticman logo](/img/2020/10/staticman-logo.png)
Staticman logo by [Erlen Masson](http://erlen.co.uk)

גם הפעם הסתמכתי על [מדריך קיים](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html "Adding Staticman Comments by Travis Downs") שחיבר Travis Downs עבור שילוב Staticman בבלוג מבוסס Jekyll. בסופו של דבר, ביצעתי את השלבים הבאים:

1. [יצירת חשבון בוט ב GitHub](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html#set-up-github-bot-account) (לגמרי לפי המדריך הנ"ל)
2. [הגדרות staticman.yml](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html#configuring-staticmanyml) (גם כן לפי המדריך)
3. הגדרות staticman בתוך `src/globals/site.json`. כאן יש הבדל לעומת המדריך, מכוון שקובץ זה יחודי ל 11ty, ובמדריך ההתיחסות היא לסביבת Jekyll. בכל מקרה, העקרונות דומים, ו[כאן](https://github.com/yehudab/11r/blob/master/src/includes/comments.njk "site.json") תוכלו לראות את ההגדרות שלי.
4. [הקמת שרת staticman](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html#set-up-the-api-bridge). אחרי יצירת המפתחות, בחרתי בדרך שונה מהמומלץ (הקמה דרך Heroku), ובמקום זה העלתי שרת עצמאי שרץ דרך docker. בניגוד למוסבר בדקומנטציה, כאן יש חוסר [בתיעוד המקורי](https://github.com/eduardoboucas/staticman/blob/master/docs/docker.md), ויש לזכור להגדיר את מפתחות ההצפנה בקובץ [docker-compose.yml](https://github.com/eduardoboucas/staticman/blob/master/docker-compose.yml)
5. [הזמנת הבוט להשתתף ב repo](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html#invite-and-accept-bot-to-blog-repo "Invite and Accept Bot to Blog Repo") (ע"פ המדריך)
6. [הפעלת reCAPCHA](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html#enable-recaptcha "Enable reCAPTCHA") - בעיקר על פי המדריך. יש לשים לב שבחלק המתייחס ל `‎_config.yml` יש לבצע את השינויים במקום זאת ב `src/globals/site.json`
7. [שילוב התגובות באתר](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html#integrate-comments-into-site "Integrate Comments Into Site"). כאן ההבדלים מעט יותר משמעותיים, הן בגלל ההבדלים בין Jekyll ל-11ty, והן בגלל הרצון שלי לתמוך בקינון מעבר לרמה אחת. בנוסף, לא אהבתי את ה JS של הפוסט המקורי שמשתש במעורב ב jQuery ו-Vanilla JS. במקום זה השתמשתי בספריה רזה יותר בשם [cash](https://github.com/fabiospampinato/cash), שמאפשרת סינטקס דמוי jQuery במחיר של תמיכה בפחות פיצ'רים ופחות דפדפנים ישנים (אבל עדיין תומכת ב IE11). על הצגת התגובות כתבתי בפוסט הקודם. העבודה על טופס התגובות החדשות מסתכמת בסופו של דבר בקבצי ה [HTML](https://github.com/yehudab/11r/blob/master/src/includes/comment-form.njk "comment-form.njk"), [CSS](https://github.com/yehudab/11r/blob/master/src/styles/comments.css "comments.css"), ו-[JS ](https://github.com/yehudab/11r/blob/master/src/scripts/comment-form.js "comment-form.js")אותם תוכלו לראות ב repo הסופי.

מוזמנים להגיב למטה ולראות איך כל ה flow עובד. עד לאישור, תוכלו לצפות בתגובות שלכם באזור ה [Pull Requests](https://github.com/yehudab/11r/pulls) של הבלוג.
