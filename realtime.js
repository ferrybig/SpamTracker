var titleRules = [
  /care\b/i,
  /\bwatch\b/i,
  /\bsell/i,
  /\bcleans/i,
  /\bloss\b/i,
  /\blose\b/i,
  /\bhelpline\b/i,
  /\bbuy\b/i,
  /\blose\b/i,
  /\b(phone|support).*number\b/i,
  /\bimprove\b/i,
  /\bonline\b/i,
  /\byou\scan\b/i,
  /\bwow\sgold\b/i,
  /\bfree\b/i,
  /\bwholesale\b/i,
  /\bpurchas/i,
  /\blover?\b/i,
  /\bfull\shd\b/i,
  /\bbaba\s?ji\b/i,
  /\+91[\s\-\(]/i,
  /\bcraigslist\b/i,
  /\bbenefits?\b/i,
  /beneficial/i
];

var sumRules = [
  /^\S*$/i,
  /^[A-Z][^a-z]*$/,
  /!\?|\?\?|!!/,
  /\bcolon.*clean/i,
  /\bcleans/i,
  /\b(phone|support).*number\b/i,
  /\bwow\sgold\b/i,
  /\bessays?\b/i,
  /\bbaba\s?ji\b/i,
  /\+91[\s\-\(]/i,
  /professional.*writ/i,
  /kickstarter/i,
  /natural.*ingredient/i,
  /\baffiliate\b/i,
  /\baging\b/i,
  /\bfifa\b/i,
  /\bbajotz\b/i,
  /\bbagprada\b/i,
  /\bbabyliss/i,
  /\bblack magic\b/i,
  /fuck/i,
  /\bshit/i,
  /bitch/i,
  /\bsuck/i,
  /vashikaran/i,
  /advantage.*price/i,
  /brain.*boost/i,
  /facts?\sabout/i,
  /\b100%\b/i,
  /live\sstream/i,
  /make\smoney/i,
  /natural(ly)?\b/i,
  /pure\sbody/i,
  /for\ssale/i,
  /\bfifa.*coin/i,
  /\bcheap/i,
  /\bskin/i,
  /\bweight\b/i,
  /\bacne\b/i,
  /\bage\b/i,
  /\bbody.*build/i,
  /\bsupplements?\b/i,
  /\bhealth/i,
  /\bnutrition/i,
  /\bfat\b/i,
  /\bwrinkl/i,
  /\bdiet/i,
  /\bmuscle\b/i,
  /\bbrain\b/i
];

var mathRules = [
   /\burgent\b/i,
   /advanced/i,
   /anyone/i,
   /basic/i,
   /beautiful/i,
   /beginning/i,
   /challeng/i,
   /confus/i,
   /difficult/i,
   /doubt/i,
   /easy/i,
   /elegant/i,
   /elementary/i,
   /exercise/i,
   /\bgre\b/i,
   /hard/i,
   /help/i,
   /homework/i,
   /\bim\b/i,
   /interesting/i,
   /please/i,
   /problem/i,
   /query/i,
   /question/i,
   /\bsat\b/i,
   /someone/i,
   /struggl/i,
   /stuck/i,
   /stump/i,
   /tough/i,
   /tricky/i,
   /troubl/i,
   /ugly/i,
   /weird/i,
   /pmatrix/i,
   /dfrac/i,
   /displaystyle/i,
   /\\limits/i,
   /\\begin/i,
   /\s[0-9]$/i
];

var prioritySites = ['android', 'beer', 'bicycles', 'boardgames', 'bricks', 'chess', 'coffee', 'cooking', 'datascience', 'ebooks', 'engineering', 'genealogy', 'ham', 'freelancing', 'martialarts', 'mechanics', 'money', 'musicfans', 'outdoors', 'patents', 'pm', 'poker', 'productivity', 'quant', 'ru', 'rus', 'sound', 'startups', 'sustainability', 'travel', 'webapps'];
var timeSensitiveSites = ['drupal', 'meta'];
var ignoredSites = ['biology', 'christianity', 'fitness', 'health', 'hermeneutics', 'hinduism', 'islam', 'ja', 'judaism', 'lifehacks', 'pt'];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var elem, elemId, list;
  if (request.dismiss) {
    elem = document.getElementById(request.dismiss);
    if (elem) {
      list = elem.parentNode;
      list.removeChild(elem);
      updateTitle();
    }
  }
});

var elem;
var beep = new Audio('http://cdn-chat.sstatic.net/chat/se.mp3');   // vs meta2.mp3
var apiKey = '1gtS)lKgyVceC11VlgjyQw((';
var stored = {maxQ: {}, maxU: {}};
var inserted = [], time = 0;
var main = document.getElementById('content');
var leftHalf = newElem('div','','bucket','');
main.appendChild(leftHalf);
var rightHalf = newElem('div','','bucket','');
main.appendChild(rightHalf);

elem = newElem('h3','priorityList-clear','list-title','Priority');
elem.onclick = removeList;
leftHalf.appendChild(elem);
var priorityList = newElem('div','priorityList','question-list','');
leftHalf.appendChild(priorityList);

elem = newElem('h3','mathList-clear','list-title','Math');
elem.onclick = removeList;
rightHalf.appendChild(elem);
var mathList = newElem('div','mathList','question-list','');
rightHalf.appendChild(mathList);

var topLinks = document.querySelector('.topbar-menu-links');
topLinks.removeChild(topLinks.children[2]);
topLinks.removeChild(topLinks.children[1]);
var removeLink = newElem('a','','','clear all');
removeLink.onclick = removeAll;
topLinks.insertBefore(removeLink, topLinks.firstElementChild);

chrome.storage.sync.get(stored, function(items) {
  var add  = window.location.hash.split('/');
  stored = items;
  if (add[0]=='#log') {
    console.log(stored.maxQ);
    console.log(stored.maxU);
  }
  titleRules = titleRules.concat(sumRules);
  window.setTimeout(saveData, 120000);
  getQuestions();
});

function getQuestions() {
  getStuff('http://stackexchange.com/questions/poll-realtime?since='+time, 'json', processQuestions);
  window.setTimeout(getQuestions, 60000);
}

function processQuestions(e) {
  var liveList = e.currentTarget.response;
  var i, q, data, url, site, shortSite, qId, uId, hash, title, user, summary, qblock, insert, priority, mathPriority, hh, apiSites = [];
  var msgId, msgTitle;
  for (i=0; i<liveList.length; i++) {
    q = liveList[i];
    time = Math.max(time, q.lastActivityDate);
    title = q.titleEncodedFancy;
    site = q.siteBaseHostAddress;
    shortSite = site.split('.')[0];
    qId = q.id;
    url = '//'+site+'/q/'+qId;
    user = q.ownerDisplayName;
    summary = q.bodySummary;
    uId = (q.ownerUrl ? parseInt(q.ownerUrl.split('/')[4],10) : 0);
    if (!stored.maxQ[site] || qId>stored.maxQ[site]) {
      stored.maxQ[site] = qId;
    }
    if (!stored.maxU[site] || uId>stored.maxU[site]) {
      stored.maxU[site] = uId;
    }
    hash = qId*100000 + uId;
    priority = false;
    mathPriority = false;
    insert = false;
    insert = insert || (uId > stored.maxU[site]-3);
    insert = insert || (uId > stored.maxU[site]-10 && shortSite == 'math');
    if (summary.length < 170 && shortSite == 'math') {
      insert = true;
      mathPriority = true;
    }
    insert = insert && qId==stored.maxQ[site];
    insert = insert || (shortSite == 'math' && bad(title, mathRules));
    insert = insert && ignoredSites.indexOf(shortSite) == -1;
    insert = insert && inserted.indexOf(hash) == -1;
    if (insert) {
      inserted.push(hash);
	    msgId = site+'-'+qId;
	    msgTitle = shortSite+': '+title;
      qblock = newPost(msgId,url,title,shortSite,q.ownerUrl,user,summary);
      hh = new Date().getUTCHours();
      priority = priority || (timeSensitiveSites.indexOf(shortSite)!=-1 && hh>=2 && hh<= 12);
	    priority = priority || bad(title, titleRules) || bad(summary, sumRules);
      if (priority) {
        beep.play();
        priorityList.insertBefore(qblock, priorityList.firstElementChild);
        notifyMe(msgId, msgTitle, summary);
      }
      else if (shortSite == 'math') {
        mathList.insertBefore(qblock, mathList.firstElementChild);
      }
    }
    if (prioritySites.indexOf(shortSite)!=-1 && apiSites.indexOf(shortSite)==-1) {
      window.setTimeout(fetchBody, 50000+Math.floor(20000*Math.random()), shortSite);
      apiSites.push(shortSite);
    }
  }
  updateTitle();
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
    var q=e.currentTarget.response.items[0], url, site, shortSite, summary, qblock, hash, title, elem;
    hash = 100000*q.post_id + q.owner.user_id;
    if (q.owner.reputation == 1 && inserted.indexOf(hash) == -1) {
      inserted.push(hash);
      title = (q.post_type=='question' ? 'Q: ' : 'A: ') + q.title;
      url = q.share_link;
      site = url.split('/')[2];
      shortSite = site.split('.')[0];
      elem = document.createElement('span');
      elem.innerHTML = q.body;
      summary = elem.textContent.slice(0,200);
      qblock = newPost(site+'-'+q.post_id, url, title, shortSite, q.owner.link, q.owner.display_name, summary);
      priorityList.insertBefore(qblock, priorityList.firstElementChild);
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


function updateTitle() {
  var numP = priorityList.children.length;
  var numM = mathList.children.length;
  document.title = numP+'+'+numM+' posts to review';
}

function removeBlock(e) {
  killBlock(e.target);
}

function killBlock(elem) {
  if (elem.classList.contains('question-list')) {
    return;
  }
  var list = elem.parentNode;
  if (list.classList.contains('question-list')) {
    if (list.id == 'priorityList') {
      dismissNotification(elem.id);
    }
    list.removeChild(elem);
    updateTitle();
  }
  else {
    killBlock(list);
  }
}

function removeList(e) {
  var listId = e.target.id.split('-')[0];
  var list = document.getElementById(listId);
  if (list) {
    clearList(list);
  }
}

function clearList(list) {
  if (list.id == 'priorityList') {
    while (list.firstElementChild) {
      dismissNotification(list.firstElementChild.id);
      list.removeChild(list.firstElementChild);
    }
  }
  else {
    while (list.firstElementChild) {
      list.removeChild(list.firstElementChild);
    }
  }
  updateTitle();
}

function removeAll(e) {
  clearList(priorityList);
  clearList(mathList);
  updateTitle();
}
 
function saveData() {
  chrome.storage.sync.set(stored);
  window.setTimeout(saveData, 120000);
}

function bad(text, rules) {
  var report;
  for (var i=0; i<rules.length; i++) {
    if (text.match(rules[i])) {
      report = '"'+text+'" matched '+rules[i];
      console.log(report);
      return true;
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


// Top bar indicators

var taskNames = ["close", "late-answers", "low-quality-posts", "reopen"];
var taskAbbr = {"close":"cv", "late-answers":"la", "low-quality-posts":"lq", "reopen":"re"};
var taskFullNames = {"close":"Close Votes", "late-answers":"Late Answers", "low-quality-posts":"Low Quality Posts", "reopen":"Reopen Votes"};

replaceTopbar();
refreshTasks();

function replaceTopbar() {
  var elem, i, taskName;
  var reviewSpan = newElem('span','revIndicators','topbar-menu-links','');

  if (!document.getElementById('revIndicators')) {
    for (i=0; i<taskNames.length; i++) {
      taskName = taskNames[i];
      elem = newElem('a',taskName,'',taskAbbr[taskName]);
      elem.href = '//math.stackexchange.com/review/'+taskName;
      elem.target = '_blank';
      elem.title = taskFullNames[taskName];
      elem.style.opacity = '0.2';
      reviewSpan.appendChild(elem);
    }
  
    var newReview = newElem('div','','links-container','');
    newReview.appendChild(reviewSpan);
    topLinks.insertBefore(newReview, topLinks.firstElementChild);
  }
}


function refreshTasks() {
  var i, elem, count, taskName;
  getStuff('//math.stackexchange.com/review','document', function(e) {
    var inds, indicators, i, ch, taskTitle, taskLink, taskName, taskStates = {};
    var tasks = e.currentTarget.responseXML.querySelectorAll('.dashboard-item');
    for (i=0; i<tasks.length; i++) {
      ch = tasks[i].children;
      if (ch.length>=4) {
        taskTitle = ch[1].firstElementChild;
        taskLink = ch[2].children[ch[2].children.length-1].href.split('/stats')[0];
        taskName = taskLink.split('/review/')[1];
        taskStates[taskName] = (taskTitle.classList.contains('dashboard-faded') ? 0 : parseInt(ch[0].textContent,10));
      }
    }
    indicators = document.getElementById('revIndicators');
    if (indicators) {
      inds=indicators.children;
      for (i=0; i<inds.length; i++) {
        taskName = inds[i].id;
        if (taskStates[taskName]>0) {
          inds[i].style.opacity = '1.0';
        }
        else {
          inds[i].style.opacity = '0.2';
        }
      }
    }
  });
  window.setTimeout(refreshTasks,120000);
}
 

function getStuff(theUrl, type, listener) {
  var req = new XMLHttpRequest();
  req.responseType = type;
  req.onload = listener;
  req.open("GET", theUrl, true);
  req.send();
}