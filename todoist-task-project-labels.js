// ==UserScript==
// @name         Task Project Labels
// @namespace    http://tampermonkey.net/
// @version      2024-07-02
// @description  try to take over the world!
// @author       Ben Oeyen
// @match        https://app.todoist.com/app/upcoming
// @icon         https://www.google.com/s2/favicons?sz=64&domain=todoist.com
// @grant        none
// @require https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

(function() {
    'use strict';

    var observer = new MutationObserver(check);
    observer.observe(document, {childList: true, subtree: true});

    function check(changes, observer) {
        if(document.querySelector('div.task_list_item__content')) {
            document.querySelectorAll("div.task_list_item__content").forEach(function(task){
                observer.disconnect()
                var color = getTaskColor(task)
                var label = getTaskLabel(task);

                var task_content = task.querySelector('div.task_content')
                var task_title = task_content.lastChild.textContent
                task_content.innerHTML = '<span style="background:' + color + ';color: white;border-radius: 5px;padding: 2px 8px;margin-right: 5px;">' + label + '</span>' + task_title;
                observer.observe(document, {childList: true, subtree: true});
            });
        }
    }

   //Get Color get "task_list_item__project" -> a -> svg -> style
   function getTaskColor(task){
       return task.querySelector("span.task_list_item__project svg").style.color;
   }

   //Get Label get "task_list_item__project" -> div -> div -> span -> get Content
   function getTaskLabel(task){
       return task.querySelector("div.task_list_item__project__label span").innerText;
   }

})();
