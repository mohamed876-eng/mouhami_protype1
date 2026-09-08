// Page de création d'un dossier (redirige vers la page liste avec la modale)

import { redirect } from "next/navigation";

export default function NewCasePage() {
  redirect("/cases");
}
