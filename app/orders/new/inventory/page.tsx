import { redirect } from "next/navigation";

/** Legacy wizard URL — inventory step removed. */
export default function InventoryStepRedirect() {
  redirect("/orders/new/review");
}
