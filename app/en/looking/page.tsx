import type { Metadata } from "next";
import LookingPage from "../../looking/LookingPage";
export const metadata: Metadata = { title: "Looking for yarn | Dyeloty", description: "Post a request for a specific yarn, color, or dye lot.", alternates: { canonical: "/en/looking" } };
export default function Page() { return <LookingPage language="en" />; }
