import { createClient } from "@sanity/client";

export const sanity = createClient({
  projectId: "042nc3zq",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});