import ConversationPage from "../../../messages/[id]/ConversationPage";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ConversationPage id={id} language="en" />; }
