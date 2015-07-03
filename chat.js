var box = document.getElementById('input');
var chat = document.getElementById('chat');

if (chat) {
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
}


function processChatMessage(message) {
  var smoke = /spam|\/smokedetector|low quality|offensive|\brude\b|\babus/i;
  var beep = new Audio('http://cdn-chat.sstatic.net/chat/meta2.mp3');
  var content = message.children[1].innerHTML;
  var i, msg = {}, parts, ch, post, path, hash;
  
  if (smoke.test(content) && /http/i.test(content)) {
      beep.play();
      ch = message.children[1].children;
      post = 'na-na';
      for (i=ch.length-1; i>=0; i--) {
        if (ch[i].tagName == 'A') {
          hash = ch[i].href.split('#');
          path = ch[i].href.split('/');
          if (path[3] == 'questions' && hash.length>1) {
           post = path[2]+'-'+hash[1];
          }
          else if (path[3] == 'a' || path[3] == 'q' || path[3] == 'questions') {
           post = path[2]+'-'+path[4];
          }
        }
      }

        msg.id = 'chat'+'-'+post+'-'+Date.now();
        parts = m.children[1].textContent.split(': ');
        if (parts.length > 1) {
          msg.title = parts[0];
          msg.message = parts[1];
        }
        else {
          msg.title = 'Flag Request';
          msg.message = m.children[1].textContent;
        }
        msg.type = 'chat';
        chrome.runtime.sendMessage(msg);
      }
    }
  }
  formatLink();
  window.setTimeout(f,500);
}


function formatLink() {
  var cnt, parts, id, site, hash, i;
  cnt = box.value;
  if (cnt.slice(0,4) === 'http' && cnt.indexOf(' ') === -1) {
    parts = cnt.split('/');
    site = parts[2];
    id = parts[4];
    i = cnt.indexOf('#');
    if (i>-1) {
      id = cnt.slice(i+1);
    }
    niceLink(site, id);
  }
}


function clearLog() {
  var chat = document.getElementById("chat");
  while (chat.firstElementChild) {
    chat.removeChild(chat.firstElementChild);
  }
}


function newElem(eType,eId,eClass,eText) {
  var e = document.createElement(eType);
  if (eId.length>0) {e.id = eId}
  if (eClass.length>0) {e.classList.add(eClass)}
  if (eText.length>0) {e.textContent = eText}
  return e;
}


function niceLink(site, id) {
  var apiKey = '1gtS)lKgyVceC11VlgjyQw((';
  var request = '//api.stackexchange.com/2.2/posts/'+id+'?pagesize=1&order=desc&sort=creation&site='+site+'&filter=!iC9ulls4nEIRFJfXM.Rp8o&key='+apiKey;
  getStuff(request, 'json', function(e) {
    var q = e.currentTarget.response.items[0];
    box.value = q.post_type + ': [' + htmlDecode(q.title) + '](' + q.share_link + ') by [' + q.owner.display_name + '](' + q.owner.link + ') on `' + site + '`';
  });
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
