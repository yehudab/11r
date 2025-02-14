!function(){"use strict";function e(){$("#alert-ok [role=button]").on("click",(()=>{$("#alert-ok").hide()})),$("#alert-error [role=button]").on("click",(()=>{$("#alert-error").hide()})),$(".js-form").on("submit",(function(){var e=this;$("#comment-form-submit").html('<svg class="icon spin"><use xlink:href="#icon-loading"></use></svg> על זה...'),$(e).addClass("disabled"),$("#alert-ok").hide(),$("#alert-error").hide();const o=$(this).attr("action");return fetch(o,{method:$(this).attr("method"),body:$(this).serialize(),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then((e=>e.json())).then((o=>{if(o&&o.success)$("#alert-ok").show(),$("#comment-form-submit").html("שליחה"),$(e)[0].reset(),$(e).removeClass("disabled"),grecaptcha.reset();else{let r="Unknown error";o&&(o.errorCode?r=o.errorCode:o.error&&o.error.text&&(r=o.error.text)),console.error(r),t(r),$("#comment-form-submit").html("שליחה"),$(e).removeClass("disabled"),grecaptcha.reset()}})).catch((o=>{t(o.toString()),$("#comment-form-submit").html("שליחה"),$(e).removeClass("disabled"),grecaptcha.reset()})),!1}))}function t(e){$("#error-reason").text(e),$("#alert-error").show()}function o(){return Math.floor(Date.now()/1e3)}const r=[1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,19,20,21,22,23,24,25,26];function n(e,t){let o=document.createElement("script");o.setAttribute("src",e),o.setAttribute("type","text/javascript"),o.setAttribute("async",!0),document.body.appendChild(o),o.addEventListener("load",(()=>{t(!0)})),o.addEventListener("error",(o=>{console.log(`Error on loading file ${e}`,o),t(!1)}))}function a(){let e={$schema:"https://vega.github.io/schema/vega-lite/v5.json",width:300,height:600,background:"transparent",view:{stroke:"transparent"},config:{geoshape:{filled:!1,strokeWidth:1,color:"#B56045"}}};const t=r.map((e=>{const t=e.toString().padStart(2,"0");return{data:{url:`/topojson/trail-${t}.topojson`,format:{type:"topojson",feature:`trail-${t}`}},mark:{type:"geoshape",href:`/maps/trail-${e}/#map`}}}));e.layer=[{data:{url:"/topojson/israel-legal.topojson",format:{type:"topojson",feature:"Israel"}},mark:{type:"geoshape",filled:!0,strokeWidth:0,color:"#bbb"}},{data:{url:"/topojson/lakes.topojson",format:{type:"topojson",feature:"lakes"}},mark:{type:"geoshape",filled:!0,strokeWidth:0,color:"#63bfea"}}].concat(t),function(e){let t=0;const o=["https://cdn.jsdelivr.net/npm/vega@5.25.0","https://cdn.jsdelivr.net/npm/vega-lite@5.16.3","https://cdn.jsdelivr.net/npm/vega-embed@6.22.2"],r=o.length,a=s=>{s&&(t++,t>=r?e():n(o[t],a))};n(o[0],a)}((()=>{vegaEmbed("#vega-map",e,{renderer:"svg",actions:!1})}))}$((()=>{e(),$("button.comment-reply").on("click",(function(){const t=$(this).parent(),o=$(".comments-form"),r=o.find(".cancel-comment"),n=t.data("comment-id"),a=$("#comment-replying-to-id");a.val(n),t.append(o.remove()),e(),o.find("textarea").trigger("focus"),r.one("click",(function(){return $("#respond").append(o.remove()),e(),a.val(""),!1}))})),function(){const e=$("a[href=to-be-replaced-by-email]");if(e.length){const t=["yehudab","@","gmail",".","com"];e.attr("href",`mailto:${t.join("")}`).text(t.join(""))}}(),function(){const e=$(".to-be-replaced-by-time-ticker");e.length&&(e.each(((e,t)=>{$(t).text(o())})),window.setInterval((function(){e.each(((e,t)=>{$(t).text(o())}))}),1e3))}(),$("#vega-map").length&&a(),function(){const e=$("#menu");$("#menu-toggle").on("click",(function(){e.toggleClass("hidden")}))}()}))}();
