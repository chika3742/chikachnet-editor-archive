import * as app from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyANZOTsYyoYqQ64oP0L84W5Zh3E8FgewP0",
  authDomain: "chikach-net.firebaseapp.com",
  projectId: "chikach-net",
  storageBucket: "chikach-net.appspot.com",
  messagingSenderId: "746759118595",
  appId: "1:746759118595:web:1d75851c0fafeccd9ed336",
  measurementId: "G-6B9710G5XC"
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