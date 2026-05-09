import { redirect } from "next/navigation";

export default function HouseholdListLegacyRedirectPage() {
  redirect("/grocery-lists");
}
