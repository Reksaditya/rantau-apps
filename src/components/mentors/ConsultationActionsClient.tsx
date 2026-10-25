"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import type { ConsultationBooking } from "@/types/database";

interface ConsultationActionsClientProps {
  booking: ConsultationBooking;
}

export function ConsultationActionsClient({
  booking,
}: ConsultationActionsClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(booking.status);
  const [meetingNotes, setMeetingNotes] = useState(
    booking.meeting_notes ?? ""
  );
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleUpdate(newStatus: "completed" | "cancelled") {
    try {
      setUpdating(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch(`/api/consultations/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          meeting_notes: meetingNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal memperbarui status sesi konsultasi.");
        setUpdating(false);
        return;
      }

      setStatus(newStatus);
      setSuccessMsg(data.message);
      setUpdating(false);
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kendala jaringan saat memperbarui status sesi.");
      setUpdating(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-4">
      <h2 className="font-heading text-lg font-bold text-[#172B25]">
        Catatan Hasil Sesi & Pengelolaan Status
      </h2>

      {errorMsg && <AlertBanner variant="error" message={errorMsg} />}
      {successMsg && <AlertBanner variant="success" message={successMsg} />}

      <div>
        <label
          htmlFor="session-notes"
          className="block text-sm font-medium text-[#172B25]"
        >
          Rangkuman Diskusi / Tindak Lanjut dari Mentor
        </label>
        <textarea
          id="session-notes"
          rows={4}
          disabled={status === "cancelled" || updating}
          value={meetingNotes}
          onChange={(e) => setMeetingNotes(e.target.value)}
          placeholder="Catat poin-poin arahan mentor atau tindakan perbaikan bisnis setelah sesi berlangsung..."
          className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078] disabled:bg-[#EEF2F0]"
        />
      </div>

      {status === "confirmed" && (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            type="button"
            variant="primary"
            isLoading={updating}
            onClick={() => handleUpdate("completed")}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Tandai Sesi Selesai & Simpan Catatan</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            isLoading={updating}
            onClick={() => handleUpdate("cancelled")}
          >
            <XCircle className="h-4 w-4" />
            <span>Batalkan Jadwal</span>
          </Button>
        </div>
      )}
    </div>
  );
}

