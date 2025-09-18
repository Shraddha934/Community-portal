import IssueStatus from "@/components/IssueStatus";

export default async function IssuesPage() {
  const res = await fetch("http://localhost:3000/api/issues", {
    cache: "no-store", // always fetch fresh data
  });
  const issues = await res.json();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Reported Issues</h1>
      <ul>
        {issues.map((issue) => (
          <li key={issue._id} className="flex justify-between items-center mb-2 p-2 border rounded">
            <div>
              <p>{issue.title}</p>
              <p className="text-sm text-gray-500">{issue.description}</p>
            </div>
            <IssueStatus issue={issue} />
          </li>
        ))}
      </ul>
    </div>
  );
}
