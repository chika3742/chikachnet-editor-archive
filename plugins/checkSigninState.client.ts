import { GoogleAuthProvider, signInWithPopup } from "@firebase/auth"
import { auth } from "./firebase"

export default function () {
  return new Promise((resolve: Function) => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        signInWithPopup(auth, new GoogleAuthProvider()).then((result) => {
          resolve()
        })
      } else {
        resolve()
      }
    })
  })
}