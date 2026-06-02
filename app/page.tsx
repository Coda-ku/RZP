import { redirect } from "next/navigation"

export default function Home() {
  // Redirect ke login atau dashboard
  redirect("/login")
}
