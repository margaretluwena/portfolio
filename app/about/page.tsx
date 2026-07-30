import { redirect } from "next/navigation";

/* ABOUT resolves to the contact page (the nav link points there directly);
   this route just catches old links and muscle memory. */
export default function About() {
  redirect("/contact");
}
