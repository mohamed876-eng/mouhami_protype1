// Page d'accueil — redirige vers la connexion

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
