import {createRemoteJWKSet, jwtVerify, customFetch} from 'jose';
const keys=createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),{[customFetch]:(...args)=>globalThis.fetch(...args),timeoutDuration:8000});
export class AuthError extends Error {constructor(message='Your sign-in has expired. Please sign in again.',status=401){super(message);this.status=status}}
export async function verifyFirebaseToken(token,projectId,keySet=keys){
 if(!projectId)throw new AuthError('Sign-in is not configured yet.',503);
 try{const {payload}=await jwtVerify(token,keySet,{issuer:`https://securetoken.google.com/${projectId}`,audience:projectId,algorithms:['RS256'],requiredClaims:['exp','iat','sub','auth_time'],clockTolerance:5});
 const now=Math.floor(Date.now()/1000);
 if(typeof payload.sub!=='string'||!payload.sub||payload.sub.length>128||typeof payload.iat!=='number'||payload.iat>now+5||typeof payload.auth_time!=='number'||payload.auth_time>now+5)throw Error('Invalid Firebase claims');
 return {uid:payload.sub,phone:payload.phone_number||null};
 }catch(e){if(e instanceof AuthError)throw e;throw new AuthError()}
}
export async function authenticate(request,env){const header=request.headers.get('authorization');let token;
 if(header){if(!header.startsWith('Bearer ')||header.length>16000)throw new AuthError();token=header.slice(7)}
 else{const cookie=request.headers.get('cookie')||'';token=cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('__Host-abode_session='))?.slice('__Host-abode_session='.length)}
 if(!token)return null;return verifyFirebaseToken(token,env.FIREBASE_PROJECT_ID)
}
export function sessionCookie(token,clear=false){return `__Host-abode_session=${clear?'':token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${clear?0:3600}`}
