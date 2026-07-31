import { redirect } from "next/navigation";

/* /about is the canonical route for the letter surface (URL matches the
   nav label); this catches old links and muscle memory. */
export default function Contact() {
  redirect("/about");
}
