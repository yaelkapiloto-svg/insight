interface Props {
  html: string | null;
  title?: string;
}

export function TextAnalysis({ html, title = "ניתוח המספרים" }: Props) {
  if (!html) return null;

  return (
    <section>
      <div className="relative">
        {/* accent bar */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#e94560] to-[#7c3aed] rounded-full" />

        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#fafaff] to-white border-b border-[#e2e8f0] px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e94560] to-[#7c3aed] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-[#1a1a2e]">{title}</h2>
          </div>
          <div
            className="p-6 prose prose-sm max-w-none text-[#1a1a2e] leading-loose [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5 [&_h2]:font-bold [&_h2]:text-base [&_h3]:font-semibold [&_strong]:font-bold [&_p]:mb-3"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  );
}
