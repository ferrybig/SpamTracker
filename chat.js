var sumRules = [/^\S*$/i, /\bcolon.*clean/i, /\bcleans/i, /\b(phone|support).*number\b/i, /\bwow\sgold\b/i, /\bessays?\b/i, /\bbaba\s?ji\b/i,
  /\+91[\s\-\(]/i, /professional.*writ/i, /kickstarter/i, /natural.*ingredient/i, /\baffiliate\b/i, /\baging\b/i, /\bfifa\b/i, /\bbajotz\b/i,
  /\bbagprada\b/i, /\bbabyliss/i, /\bblack magic\b/i, /fuck/i, /\bshit/i, /bitch/i, /\bsuck/i, /vashikaran/i, /advantage.*price/i,
  /brain.*(boost|power)/i, /facts?\sabout/i, /\b100%\b/i, /live\sstream/i, /make\smoney/i, /natural(ly)?\b/i, /pure\sbody/i, /for\ssale/i,
  /\bfifa.*coin/i, /\bcheap/i, /\bskin/i, /\bweight\b/i, /\bacne\b/i, /\bage\b/i, /\bbody.*build/i, /\bsupplements?\b/i, /\bhealth/i,
  /\bnutrition/i, /\bfat\b/i, /\bwrinkl/i, /\bdiet/i, /\bmuscle\b/i, /\bbrain\b/i ];

var titleRules = sumRules.concat([ /care\b/i, /\bwatch\b/i, /\bsell/i, /\bcleans/i, /\bloss\b/i, /\blose\b/i, /\bhelpline\b/i, /\bbuy\b/i, /\blose\b/i,
  /\b(phone|support).*number\b/i, /\bimprove\b/i, /\bonline\b/i, /\byou\scan\b/i, /\bwow\sgold\b/i, /\bfree\b/i, /\bwholesale\b/i,
  /\bpurchas/i, /\blover?\b/i, /\bfull\shd\b/i, /\bbaba\s?ji\b/i, /\+91[\s\-\(]/i, /\bcraigslist\b/i, /\bbenefits?\b/i, /beneficial/i ]);


var prioritySites = ['android', 'beer', 'boardgames', 'bricks', 'chess', 'civicrm', 'coffee', 'cooking', 'datascience',
  'ebooks', 'economics', 'engineering', 'expatriates', 'freelancing', 'genealogy', 'ham', 'hsm', 'law',
  'martialarts', 'mechanics', 'money', 'musicfans', 'mythology', 'outdoors', 'patents', 'pm', 'poker',
  'productivity', 'quant', 'robotics', 'sound', 'startups', 'sustainability', 'travel', 'webapps', 'woodworking'];

var timeSensitiveSites = ['drupal', 'meta', 'superuser', 'askubuntu'];

var ignoredSites = ['biology', 'christianity', 'fitness', 'health', 'hermeneutics', 'hinduism', 'islam', 'ja', 'judaism', 'lifehacks', 'pt'];

var insertRef, ws, clearchat, clearside, observer, priorityList, savingData;
var observer = new MutationObserver(function(mutations) {
      var messageList = document.getElementsByClassName('message');
      var message = messageList[messageList.length-1];
      if (message && !message.classList.contains('checkedForSpam')) {
        message.classList.add('checkedForSpam');
        if (message.children[1] && !message.parentNode.parentNode.classList.contains('mine') && !message.querySelector('.onebox')) {
          processChatMessage(message);
        }
      }
    });

var box = document.getElementById('input');
var chat = document.getElementById('chat');

insertRef = document.getElementById('footer-legal');
var separator = document.createTextNode(' | ');
insertRef.insertBefore(separator, insertRef.firstChild);

var onoff = newElem('a', 'on-off', '', 'spamtracker: off');
onoff.title = 'toggle spam tracking';
onoff.onclick = toggleTracking;
onoff.style.cursor = 'pointer';
insertRef.insertBefore(onoff, insertRef.firstChild);

var beep = new Audio('http://cdn-chat.sstatic.net/chat/se.mp3');   // vs meta2.mp3
var apiKey = '1gtS)lKgyVceC11VlgjyQw((';
var stored = {maxQ: {}, maxU: {}, track: {}};
var inserted = [], time = 0;

chrome.storage.sync.get(stored, function(items) {
  var add = window.location.hash.split('/');
  var room = window.location.href.match(/chat[^/]*\/rooms\/\d+/)[0];
  stored = items;
  if (add[0]=='#log') {
    console.log(stored.maxQ);
    console.log(stored.maxU);
  }
  if (stored.track[room]) {
    switchOn();
  }
});


function switchOn() {
  var prot = (window.location.protocol === 'https' ? 'wss' : 'ws');
  ws = new WebSocket(prot+'://qa.sockets.stackexchange.com/');
  ws.onmessage = function(e) { processQuestion(JSON.parse(JSON.parse(e.data).data)) };
  ws.onopen = function() { ws.send('155-questions-active'); };
  observer.observe(chat, {childList: true});

  clearchat = newElem('a', 'clearchat', 'button', 'clear');
  clearchat.title = 'remove all chat messages';
  clearchat.onclick = clearChat;
  insertRef = document.querySelector('#container br');
  insertRef.parentNode.insertBefore(clearchat, insertRef);

  clearside = newElem('a', 'clearside', 'button', 'clear');
  clearside.title = 'dismiss all reports';
  clearside.onclick = clearSide;
  insertRef = document.querySelector('.fl');
  insertRef.appendChild(clearside);

  insertRef = document.getElementById('roomtitle');
  priorityList = newElem('div','priorityList','question-list','');
  insertRef.parentNode.insertBefore(priorityList, insertRef);
}


function switchOff() {
  ws.close();
  observer.disconnect();
  clearchat.remove();
  clearside.remove();
  priorityList.remove();
}


function processQuestion(q) {
  var i, data, url, site, shortSite, qId, uId, siteQid, title, user, summary, qblock, insert, consider, hh, report, reg;
  var msgId, msgTitle;
  time = Math.max(time, q.lastActivityDate);
  title = q.titleEncodedFancy;
  site = q.siteBaseHostAddress;
  shortSite = site.split('.')[0];
  qId = q.id;
  url = '//'+site+'/q/'+qId;
  user = q.ownerDisplayName;
  summary = q.bodySummary;
  uId = (q.ownerUrl ? parseInt(q.ownerUrl.split('/')[4],10) : 0);
  if (!stored.maxQ[site]) {
    stored.maxQ[site] = 1;
  }
  if (!stored.maxU[site]) {
    stored.maxU[site] = 1;
  }
  siteQid = shortSite+qId;
  consider = (uId > stored.maxU[site]-3 && uId < stored.maxU[site] + 10) ;
  consider = consider && (qId > stored.maxQ[site] && qId < stored.maxQ[site] + 20);
  consider = consider && (ignoredSites.indexOf(shortSite) == -1);
  consider = consider && (inserted.indexOf(siteQid) == -1);
  report = site+'/'+qId+' ';
  if (consider) {
    insert = false;
    if (summary.length < 100) {
      insert = true;
      report = report + 'short summary:' + summary + '\n';
    }
    hh = new Date().getUTCHours();
    insert = insert || (timeSensitiveSites.indexOf(shortSite)!=-1 && hh>=1 && hh<= 10);
    reg = bad(title, titleRules);
    if (reg) {
      insert = true;
      report = report + 'title matched ' + reg;
    }
    else {
      reg = bad(summary, sumRules);
      if (reg) {
        insert = true;
        report = report + 'summary matched ' + reg;
      }
    }
    if (insert) {
      console.log(report);
      inserted.push(siteQid);
      msgId = site+'-'+qId;
      msgTitle = shortSite+': '+title;
      qblock = newPost(msgId,url,title,shortSite,q.ownerUrl,user,summary);
      beep.play();
      priorityList.insertBefore(qblock, priorityList.firstElementChild);
      notifyMe(msgId, msgTitle, summary);
    }
  }
  if (prioritySites.indexOf(shortSite)!=-1) {
    window.setTimeout(fetchBody, 60000, shortSite);
  }
  if (qId>stored.maxQ[site]) {
    stored.maxQ[site] = qId;
  }
  if (uId>stored.maxU[site]) {
    stored.maxU[site] = uId;
  }
}


function newPost(msgId,url,title,shortSite,ownerURL,ownerName,summary) {
  var qblock = newElem('div',msgId,'q-block',''), elem = newElem('span', '', '', '');
	qblock.innerHTML = '<a class="q-title" target="_blank" href="'+url+'">' + title + (shortSite=='math' ? '' : ' &mdash; '+shortSite) + '</a><a target="_blank" href="'+ownerURL+'">' + ownerName + '</a>';
  qblock.onclick = removeBlock;
  elem.innerHTML = ': '+summary;
  qblock.appendChild(elem);
  return qblock;
}


function fetchBody(shortSite) {
  var request = '//api.stackexchange.com/2.2/posts?pagesize=1&order=desc&sort=creation&site='+(shortSite=='ru'?'ru.stackoverflow':shortSite)+'&filter=!iC9ukKyJYHQsubblNz.rBx&key='+apiKey;
  getStuff(request, 'json', function(e) {
    var q=e.currentTarget.response.items[0], url, site, shortSite, summary, qblock, siteQid, title, elem, report;
    shortSite = q.share_link.split('/')[2].split('.')[0];
    siteQid = shortSite + q.post_id;
    if (q.owner.reputation == 1 && inserted.indexOf(siteQid) == -1) {
      inserted.push(siteQid);
      title = (q.post_type=='question' ? 'Q: ' : 'A: ') + q.title;
      url = q.share_link;
      site = url.split('/')[2];
      shortSite = site.split('.')[0];
      elem = document.createElement('span');
      elem.innerHTML = q.body;
      summary = elem.textContent.slice(0,150);
      qblock = newPost(site+'-'+q.post_id, url, title, shortSite, q.owner.link, q.owner.display_name, summary);
      priorityList.insertBefore(qblock, priorityList.firstElementChild);
      report = url+ ' new user on a priority site';
      console.log(report);
    }
  });
}


function notifyMe(id,title,message) {
  var msg = {};
  msg.id = id;
  msg.title = title;
  msg.message = message;
  msg.type = 'question';
  chrome.runtime.sendMessage(msg);
}


function dismissNotification(id) {
  var msg = {};
  msg.id = id;
  msg.type = 'dismiss';
  chrome.runtime.sendMessage(msg);
}


function removeBlock(e) {
  killBlock(e.target);
}


function killBlock(elem) {
  var list = elem.parentNode;
  if (list.classList.contains('question-list')) {
    dismissNotification(elem.id);
    list.removeChild(elem);
  }
  else {
    killBlock(list);
  }
}



function processChatMessage(message) {
  var smoke = /spam|\/smokedetector|low quality|offensive|\brude\b|\babus/i;
  var beep = new Audio('http://cdn-chat.sstatic.net/chat/meta2.mp3');
  var content = message.children[1].innerHTML;
  var i, msg = {}, parts, ch, post, path, hash, room, siteQid;
  
  if (smoke.test(content) && /http/i.test(content)) {
    beep.play();
    ch = message.children[1].children;
    post = 'na-na';
    siteQid = '';
    for (i=ch.length-1; i>=0; i--) {
      if (ch[i].tagName == 'A') {
        hash = ch[i].href.split('#');
        path = ch[i].href.split('/');
        if (path[3] == 'questions' && hash.length>1) {
         post = path[2]+'-'+hash[1];
        }
        else if (path[3] == 'a' || path[3] == 'q' || path[3] == 'questions') {
          post = path[2]+'-'+path[4];
          if (/^q/.test(path[3])) {
            siteQid = path[2].split('.')[0] + path[4];
          }
        }
      }
    }
    if (siteQid) {
      inserted.push(siteQid);
    }
    room = window.location.href.match(/chat[^/]*\/rooms\/\d+/)[0];
    msg.id = room+'-'+post+'-'+Date.now();
    parts = message.children[1].textContent.split(': ');
    if (parts.length > 1) {
      msg.title = parts[0];
      msg.message = parts[1];
    }
    else {
      msg.title = 'Flag Request';
      msg.message = message.children[1].textContent;
    }
    msg.type = 'chat';
    chrome.runtime.sendMessage(msg);
  }
}


function clearChat() {
  var chat = document.getElementById("chat");
  while (chat.firstElementChild) {
    chat.removeChild(chat.firstElementChild);
  }
}


function clearSide() {
  while (priorityList.firstElementChild) {
    priorityList.removeChild(priorityList.firstElementChild);
  }
}


function toggleTracking() {
  room = window.location.href.match(/chat[^/]*\/rooms\/\d+/)[0];
  if (/off$/.test(onoff.textContent)) {
    onoff.textContent = 'spamtracker: on';
    switchOn();
    stored.track[room] = true;
  }
  else {
    onoff.textContent = 'spamtracker: off';
    switchOff();
    stored.track[room] = false;
  }
}


function saveData() {
  chrome.storage.sync.set(stored);
  window.setTimeout(saveData, 120000);
}


function bad(text, rules) {
  var report;
  for (var i=0; i<rules.length; i++) {
    if (rules[i].test(text)) {
      return rules[i];
    }
  }
  return false;
}


function newElem(eType,eId,eClass,eText) {
  var e = document.createElement(eType);
  if (eId.length>0) {e.id = eId}
  if (eClass.length>0) {e.classList.add(eClass)}
  if (eText.length>0) {e.textContent = eText}
  return e;
}

 
function getStuff(theUrl, type, listener) {
  var req = new XMLHttpRequest();
  req.responseType = type;
  req.onload = listener;
  req.open("GET", theUrl, true);
  req.send();
}


function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.textContent;
}
