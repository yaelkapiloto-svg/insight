"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Props {
  clientId: string;
  month: string;
}

function monthBounds(month: string): { min: string; max: string } {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, "0");
  return {
    min: `${y}-${mm}-01`,
    max: `${y}-${mm}-${String(lastDay).padStart(2, "0")}`,
  };
}

function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y.slice(-2)}`;
}

function DateList({
  dates,
  onAdd,
  onRemove,
  month,
}: {
  dates: string[];
  onAdd: (d: string) => void;
  onRemove: (d: string) => void;
  month: string;
}) {
  const [draft, setDraft] = useState("");
  const { min, max } = monthBounds(month);

  function handleAdd() {
    if (!draft) return;
    if (dates.includes(draft)) {
      setDraft("");
      return;
    }
    onAdd(draft);
    setDraft("");
  }

  return (
    <div>
      <div className="flex gap-2 items-center mb-2">
        <input
          type="date"
          value={draft}
          min={min}
          max={max}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 border border-[#e2e8f0] rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#e94560]"
        />
        <Button onClick={handleAdd} size="sm" disabled={!draft}>
          הוסף
        </Button>
      </div>
      {dates.length === 0 ? (
        <p className="text-xs text-gray-400">אין תאריכים</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {dates.map((d) => (
            <li
              key={d}
              className="metric-num inline-flex items-center gap-1 bg-[#f8f8fb] border border-[#e2e8f0] rounded-full pr-2 pl-1 py-0.5 text-xs"
            >
              <span dir="ltr">{formatDate(d)}</span>
              <button
                type="button"
                onClick={() => onRemove(d)}
                aria-label="הסר"
                className="rounded-full w-4 h-4 flex items-center justify-center text-gray-400 hover:bg-[#e94560] hover:text-white transition"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DatesEditor({ clientId, month }: Props) {
  const [filming, setFilming] = useState<string[]>([]);
  const [meetings, setMeetings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLoading(true);
    setDirty(false);
    fetch(`/api/clients/${clientId}/dates?month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setFilming(Array.isArray(data.filmingDates) ? data.filmingDates : []);
        setMeetings(Array.isArray(data.meetingDates) ? data.meetingDates : []);
      })
      .finally(() => setLoading(false));
  }, [clientId, month]);

  function addFilming(d: string) {
    setFilming((prev) => [...prev, d].sort());
    setDirty(true);
  }
  function removeFilming(d: string) {
    setFilming((prev) => prev.filter((x) => x !== d));
    setDirty(true);
  }
  function addMeeting(d: string) {
    setMeetings((prev) => [...prev, d].sort());
    setDirty(true);
  }
  function removeMeeting(d: string) {
    setMeetings((prev) => prev.filter((x) => x !== d));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/dates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, filmingDates: filming, meetingDates: meetings }),
      });
      if (res.ok) {
        setSavedAt(Date.now());
        setDirty(false);
        setTimeout(() => setSavedAt(null), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-2 border-[#e94560]/30 bg-[#fff8f9]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[#e94560] text-base">📅 ימי צילום ופגישות</h2>
        <div className="flex items-center gap-2">
          {savedAt && <span className="text-xs text-green-600">נשמר ✓</span>}
          <Button onClick={save} disabled={!dirty || saving} size="sm">
            {saving ? "שומר..." : "שמור"}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">טוען...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-[#1a1a2e] mb-2">🎬 ימי צילום</div>
            <DateList
              dates={filming}
              onAdd={addFilming}
              onRemove={removeFilming}
              month={month}
            />
          </div>
          <div>
            <div className="text-sm font-medium text-[#1a1a2e] mb-2">🤝 פגישות</div>
            <DateList
              dates={meetings}
              onAdd={addMeeting}
              onRemove={removeMeeting}
              month={month}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
