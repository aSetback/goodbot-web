import { redirect } from "next/navigation";

// Mirrors GoodBotController::OAuth() -- an old post-login landing route that
// just forwards to the character server picker.
export default function OAuthRedirectPage() {
  redirect("/characters");
}
