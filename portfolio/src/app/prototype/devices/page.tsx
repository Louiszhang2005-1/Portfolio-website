import { redirect } from "next/navigation";

// The prototype graduated to the homepage; keep old links working.
export default function DevicePrototypePage() {
  redirect("/");
}
