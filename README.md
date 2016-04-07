# SpamTracker  

**Alerts of suspicious new posts on Stack Exchange, as well as of spam reports in chat.**

*This Chrome extension is also available in [Chrome Web Store](https://chrome.google.com/webstore/detail/fight-spam-on-se-sites/pkpdgmdicibddkgkikdfnaggkdobhmgk)*

Adds a spam tracker to Stack Exchange chat rooms. Its switch is in the footer:

    spamtracker: off | help | faq | legal | ... 

The default mode is "chat only", when the extension generates desktop notifications (with sound) based on the reports of spam posts in chat by the [Smoke Detector](https://github.com/Charcoal-SE/SmokeDetector/wiki) bot. You can: 

* click the notification to open the post in a new window, or 
* click "False Report" to dismiss it as such, or
* click "Go to Room" to go to the tab with the chat room.

One can choose sites to be notified about by adding URL parameters `?alert=site,site2` or `?ignore=site,site2` to the chat room URL. For example: 

- `http://chat.stackexchange.com/rooms/11540/charcoal-hq?alert=stackoverflow` means only Stack Overflow posts will generate a notification
- `http://chat.stackexchange.com/rooms/11540/charcoal-hq?ignore=stackoverflow,programmers` means Stack Overflow and Programmers posts will **not** generate a notification. 

The site parameter here is the first part of the site's hostname: askubuntu, cooking, pt, ru, superuser, and so on. By default (no URL parameter) all sites are included. 

In the "on" mode, the tracker also uses websockets and Stack Exchange API to monitor new posts across the network. The sidebar of the chat room will display new posts that possibly merit attention. You can:

* click on the title to open the post in another window, or
* click on post summary to dismiss the report, or
* click "clear" button on top to dismiss all reports.

License: [WTFPL](http://www.wtfpl.net)
