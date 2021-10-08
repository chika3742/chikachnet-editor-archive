import * as app from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBP2qHBlXgsml8jU6s9IgPI3Awx9uJ_Qh4",
  authDomain: "mydatauploader.firebaseapp.com",
  projectId: "mydatauploader",
  storageBucket: "mydatauploader.appspot.com",
  messagingSenderId: "218237880785",
  appId: "1:218237880785:web:3bdec8deeba92d63aaf8f0",
  measurementId: "G-9GRHHH0SSV"
}

let firebaseApp: app.FirebaseApp
const apps = app.getApps()
if (!apps.length) {
  firebaseApp = app.initializeApp(firebaseConfig)
} else {
  firebaseApp = apps[0]
}

const auth = getAuth(firebaseApp)

export { auth }