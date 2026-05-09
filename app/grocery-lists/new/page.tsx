import { redirect } from "next/navigation";

export default function GroceryListsNewRedirectPage() {
  redirect("/orders/new?reset=1");
}
