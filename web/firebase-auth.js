import {initializeApp} from 'firebase/app';
import {getAuth,onIdTokenChanged,browserLocalPersistence,setPersistence,RecaptchaVerifier,signInWithPhoneNumber,signOut} from 'firebase/auth';
let auth=null,verifier=null,confirmation=null;
const friendlyErrors={
 'auth/invalid-phone-number':'Enter a valid Ghana phone number.',
 'auth/invalid-verification-code':'That code is not correct. Please try again.',
 'auth/code-expired':'That code has expired. Request a new code.',
 'auth/too-many-requests':'Too many attempts. Please wait before trying again.',
 'auth/quota-exceeded':'SMS sign-in is temporarily unavailable. Please try again later.',
 'auth/operation-not-allowed':'Phone sign-in is not available yet.',
 'auth/unauthorized-domain':'Sign-in is not available on this address yet.',
 'auth/captcha-check-failed':'Please complete the verification and try again.'
};
export const authMessage=e=>friendlyErrors[e.code]||'Sign-in could not be completed. Please try again.';
export async function startFirebase(onChange){const response=await fetch('/api/config');if(!response.ok)throw Error('Sign-in could not be loaded.');const config=await response.json();if(!config.configured)return false;auth=getAuth(initializeApp(config.firebase));await setPersistence(auth,browserLocalPersistence);onIdTokenChanged(auth,user=>onChange(user));return true}
export const currentUser=()=>auth?.currentUser||null;
export async function sendPhoneCode(number,container){if(!auth)throw Error('Sign-in is not available yet.');resetCaptcha();verifier=new RecaptchaVerifier(auth,container,{size:'normal'});try{await verifier.render();confirmation=await signInWithPhoneNumber(auth,number,verifier)}catch(e){resetCaptcha();throw e}}
export async function confirmPhoneCode(code){if(!confirmation)throw Error('Request a code first.');return confirmation.confirm(code)}
export function resetCaptcha(){if(verifier){verifier.clear();verifier=null}}
export async function logoutFirebase(){if(auth)await signOut(auth);confirmation=null;resetCaptcha()}
