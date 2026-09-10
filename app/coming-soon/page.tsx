import type { Metadata } from "next";
import ComingSoon from "../ComingSoon";
export const metadata: Metadata = { title: "Dyeloty — Wkrótce", description: "Dyeloty wkrótce zaprosi pierwsze dziewiarki.", robots: { index: false, follow: false } };
export default function Page() { return <ComingSoon language="pl" />; }
