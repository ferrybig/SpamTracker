chrome.runtime.onMessage.addListener(function(msg, sender) {
  var opt = {};
  if (msg.type == 'dismiss') {
    dismissRealtime(msg.id);
  }
  else {
    opt.type = 'basic';
    opt.title = msg.title;
    opt.message = msg.message;
    opt.iconUrl = 'icon128.png';
    if (msg.type == 'question') {
      opt.buttons = [{title: 'False Alarm'}];
    }
    if (msg.type == 'chat') {
      opt.buttons = [{title: 'Go To Room'}];
    }
    chrome.notifications.create(msg.id, opt, callbackNotification);
  }
});


chrome.notifications.onClicked.addListener(function(id) {
  var t = id.split('-');
  if (/^chat/.test(t[0]) && t[1] != 'na') {
    chrome.windows.create({url: 'http://'+t[1]+'/q/'+t[2]});
  }
  if (!/^chat/.test(t[0]))  {
    chrome.windows.create({url: 'http://'+t[0]+'/q/'+t[1]});
    chrome.tabs.query({url: '*://stackexchange.com/search?tab=realtime'}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {dismiss: id});
    });
  }
  chrome.notifications.clear(id, callbackNotificationCleared);
});


function dismissRealtime(id) {
  chrome.tabs.query({url: '*://stackexchange.com/search?tab=realtime'}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {dismiss: id});
  });
  chrome.notifications.clear(id, callbackNotificationCleared);
}

chrome.notifications.onButtonClicked.addListener(function(id,buttonIndex) {
  if (/^chat/.test(id)) {
    chrome.tabs.query({url: '*://'+id.split('-')[0]+'*'}, function(tabs) {
      chrome.tabs.update(tabs[0].id, {active: true});
    });
  }
  else {
    dismissRealtime(id);
  }
});

chrome.notifications.onClosed.addListener(function(id, byUser) {
  if (byUser && !/^chat/.test(id)) {
    dismissRealtime(id);
  }
});

function callbackNotification(id) {
}

function callbackNotificationCleared(yeah) {
}
