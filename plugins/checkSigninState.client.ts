import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "@firebase/auth"
import { auth } from "./firebase"

export default function () {
  return new Promise((resolve: Function) => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        signInWithRedirect(auth, new GoogleAuthProvider())
      } else {
        resolve()
      }
    })
  })
}