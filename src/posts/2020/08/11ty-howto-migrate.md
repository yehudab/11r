---
date: 2020-08-01T15:00:54.000+00:00
status: publish
author: יהודה
type: post
title: מוורדפרס ל-11ty
path: 11ty-howto-migrate
excerpt: ''
ogImage: 'img/2020/08/export.png'
tags:
- Nunjucks
- Comments
- 11ty
- וורדפרס

---
אז אחרי שמחליטים על מעבר ל-11ty, צריך לדאוג לשמר את תוכן הפוסטים והתגובות.

בשלב הראשון של המעבר יש צורך ליצא את כל התוכן מוורדפרס ל-Markdown. לטובת זה השתמשתי בפלאגאין לוורדפרס שפותח דווקא עבור Gatsby ונקרא: [WP Gatsby Markdown Exporter](https://wordpress.org/plugins/wp-gatsby-markdown-exporter/). בקישור ניתן לקרוא כיצד להפעיל אותו. אני השתמשתי באופציית ה [WP-CLI](https://wp-cli.org/ "WordPress Command Line"). משום מה הייתה לו בעיה ליצא את התמונות, ולכן הפעלתי את האופציות שמנטרלות את החלק הזה. הפקודה הסופית הייתה:

```bash
wp gatsby-markdown-export --skip_copy_uploads --skip_original_images --directory=/var/www/html/md-export
```

זה מייצר אוסף של קבצי Markdown, שנראה בערך ככה:

![היררכיית קבצים לאחר היצוא מוורפרס](/img/2020/08/export.png)

שמות הקבצים בכל תיקייה נלקחים מה slag, ולמזלי הקפדתי לאורך השנים להשתמש בשמות באנגלית, כך שכעת קל למצוא את הפוסטים לפי שנה, חודש וה slag.

בשלב הבא בחרתי ב starter project מתוך [דף התבניות של Eleventy](https://jamstackthemes.dev/ssg/eleventy/ "Eleventy Themes"). המבחר די דל, ואין עדיין אף תבנית מותאמת עברית. לבסוף, בחרתי בתבנית [11r](https://github.com/reeseschultz/11r).  זוהי תבנית dark mode, ומבוססת [Tailwind CSS](https://tailwindcss.com/), ורוב היפוכי הכוון הגיעו out of the box, ברגע שהוספתי `dir=rtl` לתגית הראשית של הדף. את התוצאה אחרי הגיור תוכלו למזלג [מהריפו שלי](https://github.com/yehudab/11r). את הפוסטים בהיררכיה המקורית מעלים לתיקיית `src/posts`, ואחרי מעקב אחרי ההוראות בREADME, אפשר לראות את התוצאה.

החלק היותר מורכב בתהליך הוא תמיכה בתגובות. כאן עדיין אין פתרון בית-ספר, ונאלצתי לאלתר [מכמה](https://github.com/dKab/blog/blob/master/_includes/comments.liquid) [מקורות](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html). הבעיה הבסיסית היא שאתר סטטי מטיבו אינו מאפשר הוספת תוכן דינמי כמו תגובות. אחד הפתרון האפשריים הוא שימוש בתוסף צד שלישי כמו [Disqus](https://disqus.com/), אבל [הדעה](https://fatfrogmedia.com/delete-disqus-comments-wordpress/ "Why I Deleted Disqus and Why You Should Too") [המקובלת](https://markosaric.com/remove-disqus/ "Why you should remove Disqus from your site") בקרב בעלי האתרים הסטטים הוא שזה לא לעניין, הן בגלל [תוספת הקוד לכל דף](https://markosaric.com/remove-disqus/#site-speed-and-performance), והן בגלל טענות על [הפרת פרטיות של משתמשי המערכת](https://twitter.com/martingund/status/1207327648093003777 "disqus shared the personal data of tens of millions of users ").

האפשרות שאני בחרתי בה היא שימוש ב [Staticman](https://staticman.net/). הרעיון כאן הוא שכל תגובה היא בעצם קובץ שנשמר גם כן בgit, ומנגנון אישור התגובה נעשה באופן דומה לאישור Pull Request. המנוע של Staticman דואג לייצר את ה PR-ים, כך שמבחינת המשתמשים באתר שליחת התגובה מתבצעת באמצעות טופס על הדף, בדומה לוורדפרס.

בנוסף לזה, יש צורך לייבא ולשמר את התגובות מהבלוג הישן. כאן השתמשתי [בכלי](https://github.com/arthurlacoste/wordpress-comments-jekyll-staticman) שבמקור נכתב לטובת העברת תגובות לאתרים סטטים מבוססי [Jekyll](https://jekyllrb.com/). נדרשו שינויים קלים, אבל בסופו של דבר גם כאן זה מסתכם בהרצה לפי ה README, והוספה של כל קבצי התגובות תחת התיקיה [`src/globals/comments`](https://github.com/yehudab/11r/tree/master/11r/src/globals/comments) כך שכל התגובות לפוסט מסויים מרוכזות תחת תיקיה לפי ה slag של הפוסט. מי שמעוניין יכול לקרוא עוד על [מודל הנתונים של Eleventy](https://www.11ty.dev/docs/data-global/).

התוספת האחרונה היא מעט קוד שידע לשלוף את התגובות המתאימות לכל פוסט ולהציג אותן לפי ההיררכיה המקורית. הקוד הזה מחולק בין קוד JS, שאותו ניתן למצוא ב `/filters/comments-tree.js` ונראה כך:

```js
module.exports = (obj) => {
  const allComments = obj ? Object.values(obj) : [];
  const commentsById = {};
  allComments.forEach(c => {
    c.id = c.id || c._id;
    commentsById[c.id] = c;
  });
  const rootComments = [];
  allComments.forEach(c => {
    if (c.parentId && c.parentId !== "0") {
      const parent = commentsById[c.parentId];
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(c);
      } else {
        console.error(`can't find parentID: ${c.parentId} for ID: ${c.id}`);
      }
    } else {
      rootComments.push(c);
    }

  });
  return rootComments;
};
```

והחלק המשלים שנמצא בתבנית התגובות [`src/includes/comments.njk`](https://github.com/yehudab/11r/blob/master/src/includes/comments.njk). על ריקורסיה ב nunjucks למדתי [מהissue הזה](https://github.com/mozilla/nunjucks/issues/416#issuecomment-206335032). עכשיו ניתן לראות גם את התגובות בהתאם לדו-שיח שנוהל בזמנו:

![תגובות משורשרות](/img/2020/09/comments-dark.png)

בפוסט הבא ארחיב על הכנת הטופס לתגובות והאינטגרציה עם הבוט של Staticman.