!function(){"use strict";function e(){$("#alert-ok [role=button]").on("click",(()=>{$("#alert-ok").hide()})),$("#alert-error [role=button]").on("click",(()=>{$("#alert-error").hide()})),$(".js-form").on("submit",(function(){var e=this;$("#comment-form-submit").html('<svg class="icon spin"><use xlink:href="#icon-loading"></use></svg> על זה...'),$(e).addClass("disabled"),$("#alert-ok").hide(),$("#alert-error").hide();const r=$(this).attr("action");return fetch(r,{method:$(this).attr("method"),body:$(this).serialize(),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then((e=>e.json())).then((r=>{if(r&&r.success)$("#alert-ok").show(),$("#comment-form-submit").html("שליחה"),$(e)[0].reset(),$(e).removeClass("disabled"),grecaptcha.reset();else{let o="Unknown error";r&&(r.errorCode?o=r.errorCode:r.error&&r.error.text&&(o=r.error.text)),console.error(o),t(o),$("#comment-form-submit").html("שליחה"),$(e).removeClass("disabled"),grecaptcha.reset()}})).catch((r=>{t(r.toString()),$("#comment-form-submit").html("שליחה"),$(e).removeClass("disabled"),grecaptcha.reset()})),!1}))}function t(e){$("#error-reason").text(e),$("#alert-error").show()}function r(){return Math.floor(Date.now()/1e3)}$((()=>{const e=document.querySelector("a[href=to-be-replaced-by-email]");if(e){const t=["yehudab","@","gmail",".","com"];e.href=`mailto:${t.join("")}`,e.innerHTML=t.join("")}const t=document.getElementById("to-be-replaced-by-time-ticker");t&&(t.innerHTML=r(),window.setInterval((function(){t.innerHTML=r()}),1e3))})),$((()=>{e(),$("button.comment-reply").on("click",(function(){const t=$(this).parent(),r=$(".comments-form"),o=r.find(".cancel-comment"),n=t.data("comment-id"),i=$("#comment-replying-to-id");i.val(n),t.append(r.remove()),e(),r.find("textarea").trigger("focus"),o.one("click",(function(){return $("#respond").append(r.remove()),e(),i.val(""),!1}))}))}))}();
