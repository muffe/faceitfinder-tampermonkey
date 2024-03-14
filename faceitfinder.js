// ==UserScript==
// @name         Faceitfinder
// @namespace    muffe
// @version      2024-03-14
// @description  Add faceitfinder info to steam profile if it exists
// @author       muffe
// @match        https://steamcommunity.com/profiles/*
// @match        https://steamcommunity.com/id/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @connect      faceitfinder.com
// @resource     REMOTE_CSS https://faceitfinder.com/css/main.css
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

(async function() {
    'use strict';

    const url = new URL(window.location.href);
    const pathData = url.pathname.split('/').reverse();
    const steamId =pathData.find((str) => str.length > 0);

    if (!steamId) {
        return;
    }

    const formData = new FormData()
    formData.append('name', steamId)

    const redirectData = await GM.xmlHttpRequest({
        method: "POST",
        url: "https://faceitfinder.com",
        data: formData,
        fetch: true
    })

    const redirectTo =redirectData.responseText.match(/.*\("(.+)"\)/).slice(-1).find(Boolean);

    const faceitFinderData = await GM.xmlHttpRequest({
        method: "GET",
        url: `https://faceitfinder.com${redirectTo}`,
    });

    if (faceitFinderData.responseText.includes('account not found')) {
        return;
    }

    const parser = new DOMParser();
    const htmlData = (faceitFinderData.responseText).replaceAll('src="/', 'src="https://faceitfinder.com/');
    const htmlDocument = parser.parseFromString(htmlData, "text/html");
    const section = htmlDocument.documentElement.querySelector(".account-row");


    const externalCss = GM_getResourceText("REMOTE_CSS");
    GM_addStyle(externalCss);
    GM_addStyle('.account-row { width: 50%;  margin-left: 25%;}');

    const faceitBlock = document.querySelector('.profile_customization_block');

    if(faceitBlock) {
        faceitBlock.append(section);
    }

})();
