interface Props {
  html: string | null;
  title?: string;
}

export function TextAnalysis({ html, title = "ניתוח המספרים" }: Props) {
  if (!html) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-[#1a1a2e] mb-3">{title}</h2>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <div
          className="prose prose-sm max-w-none text-[#1a1a2e] leading-relaxed [&_ul]:list-disc [&_ul]:pr-4 [&_ol]:list-decimal [&_ol]:pr-4 [&_h2]:font-bold [&_h2]:text-base [&_h3]:font-semibold [&_strong]:font-bold"
          dir="rtl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
