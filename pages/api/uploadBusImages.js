// import formidable from "formidable";
// import fs from "fs";
// import { sanity } from "../../lib/sanity";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(req, res) {
//   console.log("Received request:", req.method, req.url);

//   if (req.method !== "POST") {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//     if (req.method === "OPTIONS") {
//       res.status(200).end();
//       return;
//     }
//     res.status(405).json({ error: "Method not allowed" });
//     return;
//   }

//   const form = formidable({
//     multiples: true,
//     maxTotalFileSize: 1024 * 1024 * 1024, // 1GB
//     maxFileSize: 1024 * 1024 * 1024,
//     keepExtensions: true
//   });

//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       if (err.code === 1009) {
//         return res.status(413).json({
//           error: "Uploaded files exceed the 1GB server limit. If you are using Vercel/Netlify, try a file under 100MB.",
//         });
//       }
//       console.error("Formidable error", err);
//       return res.status(500).json({
//         error: "File parsing error. " + (err.message || "Unknown error"),
//       });
//     }

//     let busId = fields.busId;
//     if (Array.isArray(busId)) busId = busId[0];
//     if (!busId) {
//       return res.status(400).json({ error: "Missing busId" });
//     }

//     let fileArr = files.files;
//     if (!fileArr) {
//       return res.status(400).json({ error: "No files found in upload." });
//     }
//     if (!Array.isArray(fileArr)) fileArr = [fileArr];

//     // Only allow JPEG/PNG, and log all files/types
//     const allowedTypes = ['image/jpeg', 'image/png'];
//     const invalidFiles = [];
//     const results = [];

//     for (const file of fileArr) {
//       console.log(Checking file: ${file.originalFilename}, type: ${file.mimetype});
//       if (!allowedTypes.includes(file.mimetype)) {
//         invalidFiles.push(file.originalFilename);
//         continue; // skip file
//       }
//       try {
//         const data = fs.readFileSync(file.filepath);
//         const uploadRes = await sanity.assets.upload("image", data, {
//           filename: file.originalFilename,
//         });

//         const imageDoc = {
//           _type: "busImage",
//           bus: { _type: "reference", _ref: busId },
//           label: file.originalFilename.replace(/\.[^/.]+$/, ""),
//           image: {
//             _type: "image",
//             asset: {
//               _type: "reference",
//               _ref: uploadRes._id,
//             },
//           },
//           uploadDate: new Date().toISOString(),
//         };

//         const createdDoc = await sanity.create(imageDoc);
//         results.push(createdDoc);
//       } catch (e) {
//         console.error("Upload error:", e, file.originalFilename);
//         invalidFiles.push(file.originalFilename + " (upload error)");
//       }
//     }

//     if (results.length === 0) {
//       return res.status(400).json({
//         error: "No valid image files uploaded. Only JPEG and PNG images are supported.",
//         invalidFiles,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       images: results,
//       invalidFiles: invalidFiles.length > 0 ? invalidFiles : undefined
//     });
//   });
// }