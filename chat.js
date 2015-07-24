var sumRules = [/^\S*$/i, /\bcolon.*clean/i, /cleans/i, /\b(phone|support).*number\b/i, /\bwow\sgold\b/i, /\bessays?\b/i, /\bbaba\s?ji\b/i,
  /\+91[\s\-\(]/i, /professional.*writ/i, /kickstarter/i, /natural.*ingredient/i, /\baffiliate\b/i, /\baging\b/i, /\bfifa\b/i, /\bbajotz\b/i,
  /\bbagprada\b/i, /\bbabyliss/i, /\bblack magic\b/i, /vashikaran/i, /advantage.*price/i,  /natural(ly)?\b/i, /pure\sbody/i, /fuck/i, /\bshit/i, /bitch/i, /\bsuck/i,
  /brain.*(boost|power)/i, /facts?\sabout/i, /\b100%\b/i, /live\sstream/i, /make\smoney/i, /sale/i, /\bhack/i, /cheat/i, /\bwow\sgold\b/i, /runescape/i,
  /\bfifa.*coin/i, /\bcheap/i, /\bskin/i, /\bweight\b/i, /\bacne\b/i, /\bage\b/i, /\bbody.*build/i, /\bsupplements?\b/i, /\bhealth/i, /\bpenis\b/i,
  /\bnutrition/i, /\bfat\b/i, /\bwrinkl/i, /\bdiet/i, /muscle/i, /\bbrain\b/i, /\bbaba\b/i, /clash ?of ?clans/i, /\bmale\b/i, /testo/i,
  /\blover?\b/i, /\bloans?/i, /serum/i, /overcome/i, /workout/i, /fitness/i, /\bAlpha\b/, /\bultra\b/i, /\bPro\b/ ];
var titleRules = sumRules.concat([/(\d)\1{2}/, /care\b/i, /\bwatch\b/i, /\bsell/i, /\bcleans/i, /\bloss\b/i, /\blose\b/i, /\bhelpline\b/i, /\bbuy\b/i, /\blose\b/i,
  /\b(phone|support).*number\b/i, /\bimprove/i, /\bonline\b/i, /\byou\scan\b/i, /\bfree\b/i, /\bwholesale\b/i, /\bmarriage\b/i, /\blove\b/i,
  /\bpurchas/i, /\bfull\shd\b/i, /\bcraigslist\b/i, /\bbenefits?\b/i, /beneficial/i, /advice/i, /perfect/i ]);


var prioritySites = ['academia', 'android', 'beer', 'bicycles', 'boardgames', 'bricks', 'chess', 'civicrm', 'coffee', 'cooking', 'cs', 'datascience',
  'drupal', 'ebooks', 'economics', 'elementaryos', 'engineering', 'expatriates', 'freelancing', 'gamedev', 'genealogy', 'ham', 'hsm', 'law',
  'martialarts', 'mechanics', 'meta', 'money', 'musicfans', 'mythology', 'opensource', 'outdoors', 'patents', 'pm', 'poker',
  'productivity', 'quant', 'robotics', 'ru', 'sound', 'startups', 'sustainability', 'travel', 'webapps', 'webmasters', 'woodworking', 'writers'];

var timeSensitiveSites = ['drupal', 'meta', 'superuser', 'askubuntu', 'unix'];

var ignoredSites = ['biology', 'christianity', 'fitness', 'health', 'hermeneutics', 'hinduism', 'islam', 'ja', 'judaism', 'lifehacks', 'pt'];

var insertRef, ws, clearchat, clearside, observer, priorityList, savingData, wsVolume=0;
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
    
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.dismiss) {
    var elem = document.getElementById(request.dismiss);
    if (elem) {
      elem.remove();
    }
  }
});

var box = document.getElementById('input');
var chat = document.getElementById('chat');
var room = window.location.href.match(/chat[^/]*\/rooms\/\d+/)[0];
var keepGoing = true;

if (box && chat && room) {
  insertRef = document.getElementById('footer-legal');
  var separator = document.createTextNode(' | ');
  insertRef.insertBefore(separator, insertRef.firstChild);
  
  var onoff = newElem('a', 'on-off', '', 'spamtracker: off');
  onoff.title = 'toggle spam tracking';
  onoff.onclick = toggleTracking;
  onoff.style.cursor = 'pointer';
  insertRef.insertBefore(onoff, insertRef.firstChild);
  
  var metabeep = new Audio('http://cdn-chat.sstatic.net/chat/meta2.mp3');
  
  var apiKey = '1gtS)lKgyVceC11VlgjyQw((';
  var stored = {maxQ: {}, maxU: {}, track: {}};
  var inserted = [], time = 0;

  clearchat = newElem('a', 'clearchat', 'button', 'clear chat');
  clearchat.title = 'remove all chat messages';
  clearchat.onclick = clearChat;
  insertRef = document.querySelector('#chat-buttons');
  insertRef.appendChild(clearchat, insertRef);

  chrome.storage.sync.get(stored, function(items) {
    var room = window.location.href.match(/chat[^/]*\/rooms\/\d+/)[0];
    stored = items;
    if (stored.track[room]) {
      switchOn();
    }
    console.log('Max post Id');
    console.log(stored.maxQ);
    console.log('Max user Id');
    console.log(stored.maxU);
  });
}


function switchOn() {
  var prot = (window.location.protocol === 'https' ? 'wss' : 'ws');
  ws = new WebSocket(prot+'://qa.sockets.stackexchange.com/');
  ws.onmessage = function(e) {
    wsVolume = wsVolume + e.data.length;
    processQuestion(JSON.parse(JSON.parse(e.data).data));
  };
  ws.onopen = function() { ws.send('155-questions-active'); };
  ws.onclose = function() {if (keepGoing) {window.setTimeout(switchOn, 10000);} };

  observer.observe(chat, {childList: true});

  clearside = newElem('a', 'clearside', 'button', 'clear');
  clearside.title = 'dismiss all reports';
  clearside.onclick = clearSide;
  insertRef = document.querySelector('.fl');
  insertRef.appendChild(clearside);

  insertRef = document.getElementById('roomtitle');
  priorityList = newElem('div','priorityList','question-list','');
  insertRef.parentNode.insertBefore(priorityList, insertRef);

  onoff.textContent = 'spamtracker: on';
  savingData = window.setInterval(function() {chrome.storage.sync.set(stored);}, 120000);
  keepGoing = true;
}


function pauseST() {
  keepGoing = false;
  ws.close();
  clearside.remove();
  priorityList.remove();
  onoff.textContent = 'spamtracker: chat only';
  window.clearInterval(savingData);
}


function switchOff() {
  observer.disconnect();
  onoff.textContent = 'spamtracker: off';  
}


function processQuestion(q) {
  var i, data, url, site, shortSite, qId, uId, title, user, summary, qblock, insert, consider, hh, report, reg;
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
  insert = false;
  consider = (uId > stored.maxU[site]-3 && uId < 1.01*stored.maxU[site]) ;
  consider = consider && (qId > stored.maxQ[site] && qId < 1.01*stored.maxQ[site]);
  consider = consider && (ignoredSites.indexOf(shortSite) == -1);
  report = 'http://'+site+'/q/'+qId+' ';
  if (consider) {
    if (summary.length < 100) {
      insert = true;
      report = report + 'short summary: ' + summary + '\n';
    }
    hh = new Date().getUTCHours();
    if (timeSensitiveSites.indexOf(shortSite)!=-1 && hh>=1 && hh<= 10) {
      insert = true;
      report = report + 'peak spam time\n';
    }
    reg = bad(title, titleRules);
    if (reg) {
      insert = true;
      report = report + 'title matched ' + reg + '\n';
    }
    else {
      reg = bad(summary, sumRules);
      if (reg) {
        insert = true;
        report = report + 'summary matched ' + reg + '\n';
      }
    }
    if (insert) {
      reportIt(report, site, qId, 'Q', title, url, q.ownerUrl, user, summary);
    }
  }
  if (!insert && prioritySites.indexOf(shortSite)!=-1) {
    window.setTimeout(fetchBody, 60000, shortSite);
  }
  if (qId>stored.maxQ[site]) {
    stored.maxQ[site] = qId;
  }
  if (uId>stored.maxU[site]) {
    stored.maxU[site] = uId;
  }
}


function reportIt(report, site, qId, type, title, url, ownerURL, ownerName, summary) {
  var qblock, elem, msgId, shortSite = site.split('.')[0], ueTitle, ueSummary;
  if (inserted.indexOf(shortSite+qId) == -1) {
    report = report + 'At ' + new Date().toString().split(" ")[4] + '\nWebsockets volume: '+wsVolume+'\n';
    console.log(report);
    inserted.push(shortSite+qId);
    msgId = room+'-'+site+'-'+qId+'-'+Date.now();
    elem = newElem('span', '', '', '');
    elem.innerHTML = title;
    ueTitle = elem.textContent;
    elem.innerHTML = summary;
    ueSummary = elem.textContent;
    notifyMe(msgId, shortSite + ' ' + type + ': ' + ueTitle, ueSummary);
  
    qblock = newElem('div',msgId,'q-block','');
    qblock.innerHTML = '<a class="q-title" target="_blank" href="'+url+'">' + shortSite + ' ' + type+': '+title + '</a><a target="_blank" href="'+ownerURL+'">' + ownerName + '</a>';
    qblock.onclick = removeBlock;
    elem.innerHTML = ': '+summary;
    qblock.appendChild(elem);
    priorityList.insertBefore(qblock, priorityList.firstElementChild);
  }
}


function fetchBody(shortSite) {
  var request = '//api.stackexchange.com/2.2/posts?pagesize=1&order=desc&sort=creation&site='+(shortSite=='ru'?'ru.stackoverflow':shortSite)+'&filter=!5RBFam4sA56hQ2Q5G3*uvo3fl&key='+apiKey;
  getStuff(request, 'json', function(e) {
    var q=e.currentTarget.response.items[0], url, site, body, elem, report, qId, insert, reg;
    url = q.share_link;
    site = url.split('/')[2];
    qId = q.post_id;
    elem = document.createElement('span');
    elem.innerHTML = q.body;
    body = elem.textContent;
    report = url+' ';
    insert = false;
    if (q.owner && q.owner.reputation == 1) {
      if (q.post_type == 'answer') {
        insert = true;
        report = report+' answer by a rep 1 user\n';
      }
      if (body.length < 100) {
        insert = true;
        report = report + 'short post: ' + body + '\n';
      }
      if (q.post_type == 'question') {
        reg = bad(body, sumRules);
      }
      if (reg) {
        insert = true;
        report = report + 'body matched ' + reg + '\n';
      }
    }
    if (insert) {
      reportIt(report, site, qId, (q.post_type=='question' ? 'Q' : 'A'), q.title, url, q.owner.link, q.owner.display_name, body.slice(0,150));
      report = 'Quota remaining: '+e.currentTarget.response.quota_remaining;
      console.log(report);
    }
  });
}


function notifyMe(id,title,message) {
  var msg = {};
  msg.id = id;
  msg.title = title;
  msg.message = message;
  msg.type = 'post';
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
  var content = message.children[1].innerHTML;
  var i, msg = {}, parts, ch, path, hash, site = '', qId = '', sq;
  if (smoke.test(content) && /http/i.test(content)) {
    ch = message.children[1].children;
    for (i=ch.length-1; i>=0; i--) {
      if (ch[i].tagName == 'A') {
        hash = ch[i].href.split('#');
        path = ch[i].href.split('/');
        if (path[3] == 'questions' && hash.length>1) {
          site = path[2];
          qId = hash[1];
        }
        else if (/^[qa]/.test(path[3])) {
          site = path[2];
          qId = path[4];
        }
      }
    }
    if (site && qId) {
      metabeep.play();
      sq = site.split('.')[0] + qId;
      if (inserted.indexOf(sq) != -1) {
        return;
      }
      else {
        inserted.push();
      }
    }
    msg.id = room+'-'+site+'-'+qId+'-'+Date.now();
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
    console.log(message.children[1].textContent);
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
  var currentStatus = onoff.textContent.split(': ')[1];
  switch (currentStatus) {
    case "off":
      switchOn();
      stored.track[room] = true;
      break;
    case "on":
      pauseST();
      stored.track[room] = false;
      break;
    case "chat only":
      switchOff();
  }
}


function bad(text, rules) {
  for (var i=0; i<rules.length; i++) {
    if (rules[i].test(text)) {
      return rules[i];
    }
  }
  return false;
}


function newElem(eType,eId,eClass,eText) {
  var e = document.createElement(eType);
  if (eId.length>0) {e.id = eId;}
  if (eClass.length>0) {e.classList.add(eClass);}
  if (eText.length>0) {e.textContent = eText;}
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
