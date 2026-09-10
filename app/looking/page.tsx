import type { Metadata } from "next";
import LookingPage from "./LookingPage";
export const metadata: Metadata = { title: "Szukam włóczki | Dyeloty", description: "Dodaj ogłoszenie, gdy szukasz konkretnej włóczki lub dye lotu.", alternates: { canonical: "/looking" } };
export default function Page() { return <LookingPage language="pl" />; }
