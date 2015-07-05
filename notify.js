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
    opt.buttons = [{title: 'False Alarm'}, {title: 'Go To Room'}];
    chrome.notifications.create(msg.id, opt, callbackNotification);
  }
});


chrome.notifications.onClicked.addListener(function(id) {
  var t = id.split('-');
  if (t[1] != 'na') {
    chrome.windows.create({url: 'http://'+t[1]+'/q/'+t[2], width: 850});
    chrome.tabs.query({url: '*://'+t[0]+'*'}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {dismiss: id});
    });
  }
  chrome.notifications.clear(id, callbackNotificationCleared);
});


function dismissRealtime(id) {
  chrome.tabs.query({url: '*://'+id.split('-')[0]+'*'}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {dismiss: id});
  });
  chrome.notifications.clear(id, callbackNotificationCleared);
}

chrome.notifications.onButtonClicked.addListener(function(id,buttonIndex) {
  if (buttonIndex == 1) {
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
