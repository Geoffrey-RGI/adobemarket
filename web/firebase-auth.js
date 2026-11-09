import {initializeApp} from 'firebase/app';
import {getAuth,onIdTokenChanged,browserLocalPersistence,setPersistence,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,signOut} from 'firebase/auth';
let auth=null;
const friendlyErrors={
 'auth/invalid-email':'Enter a valid email address.',
 'auth/invalid-credential':'The email or password is incorrect.',
 'auth/wrong-password':'The email or password is incorrect.',
 'auth/user-not-found':'The email or password is incorrect.',
 'auth/email-already-in-use':'An account already uses this email. Sign in or reset your password.',
 'auth/weak-password':'Choose a stronger password with at least six characters.',
 'auth/password-does-not-meet-requirements':'Choose a password that meets the account password requirements.',
 'auth/popup-blocked':'Your browser blocked the Google sign-in window. Allow popups and try again.',
 'auth/popup-closed-by-user':'The Google sign-in window was closed. You can try again.',
 'auth/cancelled-popup-request':'Another sign-in window is open. Complete it or try again.',
 'auth/account-exists-with-different-credential':'Use your existing sign-in method for this email address.',
 'auth/too-many-requests':'Too many attempts. Please wait before trying again.',
 'auth/network-request-failed':'Check your connection and try again.',
 'auth/operation-not-allowed':'This sign-in method is not available yet.',
 'auth/unauthorized-domain':'Sign-in is not available on this address yet.',
 'auth/user-disabled':'This account is disabled. Contact support.'
};
export const authMessage=e=>friendlyErrors[e.code]||'Sign-in could not be completed. Please try again.';
export async function startFirebase(onChange){const response=await fetch('/api/config');if(!response.ok)throw Error('Sign-in could not be loaded.');const config=await response.json();if(!config.configured)return false;auth=getAuth(initializeApp(config.firebase));await setPersistence(auth,browserLocalPersistence);onIdTokenChanged(auth,user=>onChange(user));return true}
export const currentUser=()=>auth?.currentUser||null;
export async function loginGoogle(){if(!auth)throw Error('Sign-in is not available yet.');const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});return signInWithPopup(auth,provider)}
export async function loginEmail(email,password,create=false){if(!auth)throw Error('Sign-in is not available yet.');return create?createUserWithEmailAndPassword(auth,email,password):signInWithEmailAndPassword(auth,email,password)}
export async function resetPassword(email){if(!auth)throw Error('Sign-in is not available yet.');return sendPasswordResetEmail(auth,email)}
export async function logoutFirebase(){if(auth)await signOut(auth)}
