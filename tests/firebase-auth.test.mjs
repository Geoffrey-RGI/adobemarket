import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalJWKSet,SignJWT,generateKeyPair} from 'jose';
import {verifyFirebaseToken,authenticate,sessionCookie} from '../worker/firebase-auth.js';
import {token,keySet,projectId,mockGoogleKeys} from './firebase-fixture.mjs';
const keys=createLocalJWKSet(keySet);mockGoogleKeys();
test('valid signed Firebase token returns stable user identity',async()=>{assert.equal((await verifyFirebaseToken(await token('farmer-123'),projectId,keys)).uid,'farmer-123')});
test('forged identity headers are ignored',async()=>{assert.equal(await authenticate(new Request('https://market.example/api/me',{headers:{'oai-authenticated-user-id':'victim'}}),{FIREBASE_PROJECT_ID:projectId}),null)});
test('rejects wrong audience / project',async()=>{await assert.rejects(verifyFirebaseToken(await token(),'wrong-project',keys),{status:401})});
test('rejects modified JWT signatures',async()=>{const t=await token();const [h,p,s]=t.split('.');await assert.rejects(verifyFirebaseToken([h,p,s.slice(0,10)+(s[10]==='a'?'b':'a')+s.slice(11)].join('.'),projectId,keys),{status:401})});
test('rejects expired, future-issued, and malformed authentication claims',async()=>{const now=Math.floor(Date.now()/1000);for(const claims of [{exp:now-100},{iat:now+100},{auth_time:now+100},{auth_time:'not-a-number'}]){
 // Fixture sets standard timestamps last; sign modified payload with a new valid test key.
 const pair=await generateKeyPair('RS256'),jwk=await import('jose').then(m=>m.exportJWK(pair.publicKey));
 const jwt=await new SignJWT({sub:'u',iss:`https://securetoken.google.com/${projectId}`,aud:projectId,iat:now,exp:now+3600,auth_time:now,...claims}).setProtectedHeader({alg:'RS256'}).sign(pair.privateKey);
 await assert.rejects(verifyFirebaseToken(jwt,projectId,createLocalJWKSet({keys:[{...jwk,alg:'RS256'}]})),{status:401})
 }});
test('rejects unsigned and malformed tokens',async()=>{for(const t of ['bad-token','eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1In0.'])await assert.rejects(verifyFirebaseToken(t,projectId,keys),{status:401})});
test('missing project configuration fails closed',async()=>{await assert.rejects(verifyFirebaseToken(await token(),null,keys),{status:503})});
test('session cookie has secure browser protections',()=>{const c=sessionCookie('signed.token');for(const flag of ['__Host-abode_session=','Secure','HttpOnly','SameSite=Lax','Path=/'])assert.ok(c.includes(flag));assert.ok(sessionCookie('',true).includes('Max-Age=0'))});
test('Firebase bearer and cookie identities both work',async()=>{const t=await token('buyer-c');for(const headers of [{Authorization:'Bearer '+t},{Cookie:'__Host-abode_session='+t}])assert.equal((await authenticate(new Request('https://market.example/api/me',{headers}),{FIREBASE_PROJECT_ID:projectId})).uid,'buyer-c')});
test('Google accounts are accepted without a phone claim',async()=>{const user=await verifyFirebaseToken(await token('google-user',{phone_number:undefined,firebase:{sign_in_provider:'google.com'}}),projectId,keys);assert.equal(user.uid,'google-user');assert.equal(user.phone,null)});
test('email/password accounts are accepted without a phone claim',async()=>{const user=await verifyFirebaseToken(await token('email-user',{phone_number:undefined,firebase:{sign_in_provider:'password'}}),projectId,keys);assert.equal(user.uid,'email-user');assert.equal(user.phone,null)});
