import { PageHeader } from "@/components/ui/page-header";

type StagePlaceholderProps = {
  title: string;
  description: string;
  stage: string;
};

export function StagePlaceholder({
  title,
  description,
  stage,
}: StagePlaceholderProps) {
  return (
    <div className="pb-16">
      <PageHeader eyebrow={stage} title={title} description={description} />
    </div>
  );
}
