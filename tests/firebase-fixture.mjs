import {generateKeyPair,exportJWK,SignJWT} from 'jose';
const {privateKey,publicKey}=await generateKeyPair('RS256');
export const projectId='adobe-market-test';
export const jwk={...await exportJWK(publicKey),kid:'test-key',alg:'RS256',use:'sig'};
export const keySet={keys:[jwk]};
export async function token(uid='seller-a',overrides={}){const now=Math.floor(Date.now()/1000);return new SignJWT({auth_time:now,phone_number:'+233241234567',...overrides}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setSubject(uid).setIssuer(`https://securetoken.google.com/${projectId}`).setAudience(projectId).setIssuedAt(now).setExpirationTime(now+3600).sign(privateKey)}
export function mockGoogleKeys(){const original=globalThis.fetch;globalThis.fetch=async(url,init)=>{if(String(url)==='https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')return Response.json(keySet,{headers:{'Cache-Control':'public, max-age=3600'}});return original(url,init)}}
