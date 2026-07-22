import { redirect } from "next/navigation";
import { currentMondayKey } from "@/lib/week";

export default function CalendarioIndexPage() {
  redirect(`/calendario/${currentMondayKey()}`);
}
