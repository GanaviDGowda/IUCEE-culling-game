export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Member Details</h1>
      <div className="p-4 border border-zinc-800 rounded-lg">
        <p className="text-zinc-400 text-sm">Details for member: {id}</p>
      </div>
    </div>
  );
}
