import EditWantedPage from "../../../../looking/EditWantedPage";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <EditWantedPage id={id} language="en" />; }
