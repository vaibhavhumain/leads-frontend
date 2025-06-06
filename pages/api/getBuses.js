// import { sanity } from "../../lib/sanity";

// export default async function handler(req, res) {
//   const buses = await sanity.fetch(
//     `*[_type == "bus"]{_id, serialNumber, model->{title}}`
//   );
//   res.status(200).json({ buses });
// }