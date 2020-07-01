document.addEventListener("readystatechange", eventController);
function eventController() {
	if ( document.readyState == "interactive" ) {
				//EVENTOS
        document.getElementById("spawnNotification").addEventListener("click", spawnNotification, false);


let reg;
if (navigator.serviceWorker){
     reg = navigator.serviceWorker.register("/sw.js");
}
function notifyMe() {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification("Hola bro!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("Pedazo noti!");
      }
    });
  }


  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them any more.
}
function spawnNotification(e,theBody="Este es el contenido de la mejor nota de la historia",theIcon="icon1.png",theTitle="Buenos dias por la mañana") {
  var options = {
      body: theBody,
      icon: theIcon
  }
  var n = new Notification(theTitle,options);
}



Notification.requestPermission().then(function(result) {
  console.log(result);
});








//NOTIFICACIONES PUSH

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}
const applicationServerPublicKey = 'BAOO683t1HM-3UIXm5tjZJQhItbE6NB7QLr4H8R1EEQ8KWGp3gJjjpM1g_XWHaN4bbpTgHpcgaZBcGqXCR_q5a0';



let pushButton = document.getElementById("pushButton");

function initialiseUI() {
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      // TODO: Unsubscribe user
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed:', subscription);

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

let pText = document.getElementById("pText");

function updateBtn() {
  if (isSubscribed) {
    pText.textContent = 'Disable Push Messaging';
  } else {
    pText.textContent = 'Enable Push Messaging';
  }

  pText.disabled = false;
}

navigator.serviceWorker.register('sw.js')
.then(function(swReg) {
  console.log('Service Worker is registered', swReg);

  swRegistration = swReg;
  initialiseUI();
});

const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
swRegistration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: applicationServerKey
});



}


}
