import EditWantedPage from "../../EditWantedPage";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <EditWantedPage id={id} language="pl" />; }
