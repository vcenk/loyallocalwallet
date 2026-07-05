import { PageHeader, EmptyState } from "@llw/ui";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        title={`${title} coming soon`}
        description="This section is part of an upcoming build phase."
      />
    </div>
  );
}
