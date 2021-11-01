self.importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js')
self.importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: "AIzaSyANZOTsYyoYqQ64oP0L84W5Zh3E8FgewP0",
  authDomain: "chikach-net.firebaseapp.com",
  projectId: "chikach-net",
  storageBucket: "chikach-net.appspot.com",
  messagingSenderId: "746759118595",
  appId: "1:746759118595:web:1d75851c0fafeccd9ed336",
  measurementId: "G-6B9710G5XC"
}

firebase.initializeApp(firebaseConfig)

try {
  const messaging = firebase.messaging()

  messaging.onBackgroundMessage(function(payload) {
    self.registration.showNotification(payload.notification.title, payload.notification)
  })
} catch (e) {
  console.error(e)
}

// onBackgroundMessage(getMessaging(getApps()[0]), (payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload)
//   // Customize notification here
//   const notificationTitle = 'Background Message Title'
//   const notificationOptions = {
//     body: 'Background Message body.',
//     icon: '/firebase-logo.png'
//   }
// })