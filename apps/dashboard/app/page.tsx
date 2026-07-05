import { redirect } from "next/navigation";

// The dashboard layout decides between /onboarding and the dashboard itself;
// unauthenticated users are bounced to /login by middleware.
export default function Home() {
  redirect("/dashboard");
}
