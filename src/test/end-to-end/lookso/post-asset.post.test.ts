// import {describe} from "mocha";
// import {clearDB} from "../../helpers/database-helper";
// import {
//   HACKER_MAN_JWT, HACKER_MAN_UP
// } from "../../helpers/constants";
// import {fastify} from "../../../api/fastify";
// import {expect} from "chai";
//
// import {LSPXXProfilePost} from "../../../lib/lookso/registry/types/profile-post";
// import {POST_VALIDATOR_ADDRESS} from "../../../environment/config";
// import {Blob} from "buffer";
// const FormData = require('form-data');
//
// export const PostAssetPOSTTests = () => {
//
//   describe('POST lookso/post/asset', () => {
//
//     const post: LSPXXProfilePost = {
//       version: '0.1.1',
//       author: HACKER_MAN_UP,
//       validator: POST_VALIDATOR_ADDRESS[0],
//       nonce: '12345',
//       message: 'message',
//       links: [],
//       tags: []
//     }
//
//     let blob: any = new Blob([""], { type: 'image/jpeg' });
//     blob["lastModifiedDate"] = "";
//     blob["name"] = "filename";
//     const fakeF:File = blob;
//
//     // const asset = new File([""], "filename", { type: 'image/jpeg' });
//     const formData = new FormData();
//     formData.append('lspXXProfilePost', JSON.stringify(post));
//     formData.append('asset', JSON.stringify(fakeF));
//
//     beforeEach(async () => {
//       await clearDB();
//     });
//
//     it ('should return 200 on correct request', async () => {
//       const res = await fastify.inject({
//         method: 'POST', url: `/lookso/post/asset`,
//         payload: formData,
//         headers: {
//           authorization: 'Bearer ' + HACKER_MAN_JWT
//         }});
//       expect(res.statusCode).to.equal(200);
//     });
//
//     it ('should return the correct post object', async () => {
//       const res = await fastify.inject({
//         method: 'POST', url: `/lookso/post/asset`,
//         payload: formData,
//         headers: {
//           authorization: 'Bearer ' + HACKER_MAN_JWT
//         }});
//       const resPost: LSPXXProfilePost = JSON.parse(res.payload).LSPXXProfilePost;
//       expect(resPost.asset?.fileType).to.equal('image/webp');
//       expect(resPost.author).to.equal(post.author);
//       expect(resPost.nonce).to.equal(post.nonce);
//       expect(resPost.validator).to.equal(post.validator);
//       expect(resPost.message).to.equal(post.message);
//       expect(resPost.version).to.equal(post.version);
//       expect(resPost.links).to.equal(post.links);
//       expect(resPost.tags).to.equal(post.tags);
//     });
//
//     it('should return 501 if not supported file type', async () => {
//       // const video = new File([""], "filename", { type: 'video/mp4' });
//       const formDataVideo = new FormData();
//       formDataVideo.append('lspXXProfilePost', JSON.stringify(post));
//       formDataVideo.append('asset', fakeF);
//
//       const res = await fastify.inject({
//         method: 'POST', url: `/lookso/post/asset`,
//         payload: formDataVideo,
//         headers: {
//           "content-type": 'multipart/form-data',
//           authorization: 'Bearer ' + HACKER_MAN_JWT
//         }});
//       expect(res.statusCode).to.equal(501);
//     });
//
//     it('should return 403 if invalid JWT', async () => {
//       const res = await fastify.inject({
//         method: 'POST', url: `/lookso/post/asset`,
//         payload: formData,
//         headers: {
//           authorization: 'Bearer a' + HACKER_MAN_JWT
//         }});
//       expect(res.statusCode).to.equal(403);
//     });
//
//   });
//
// }
