import type { Metadata } from "next";
import ComingSoon from "../../ComingSoon";
export const metadata: Metadata = { title: "Dyeloty — Coming soon", description: "Dyeloty will invite its first knitters soon.", robots: { index: false, follow: false } };
export default function Page() { return <ComingSoon language="en" />; }
