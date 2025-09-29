// pages/api/updateStations.js
import { createClient } from "../../lib/supabaseClient";
import xml2js from "xml2js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // 1️⃣ Récupérer le XML du gouvernement
    const response = await fetch(https://data.economie.gouv.fr/explore/dataset/prix-carburants-quotidien/api/records/1.0/search/?dataset=prix-carburants-quotidien&rows=10000
);
    const xmlData = await response.text();

    // 2️⃣ Parser le XML
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    // 3️⃣ Ici tu peux traiter les données et les mettre dans Supabase
    // Exemple :
    // await supabase.from("stations").upsert([...]);

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
