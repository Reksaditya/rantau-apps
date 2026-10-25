"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import type { Mentor, MentorAvailability, PlanTier } from "@/types/database";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";

interface MentorBookingClientProps {
  mentor: Mentor;
  availabilities: MentorAvailability[];
  planTier: PlanTier;
}

export function MentorBookingClient({
  mentor,
  availabilities,
  planTier,
}: MentorBookingClientProps) {
  const router = useRouter();
  const entitlement = PLAN_ENTITLEMENTS[planTier];

  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [businessTopic, setBusinessTopic] = useState<string>("");
  const [questionNotes, setQuestionNotes] = useState<string>("");
  const [booking, setBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedSlotId) {
      setErrorMsg("Silakan pilih salah satu slot jadwal yang tersedia.");
      return;
    }
    if (businessTopic.trim().length < 5) {
      setErrorMsg("Tuliskan topik utama konsultasi (minimal 5 karakter).");
      return;
    }
    if (questionNotes.trim().length < 15) {
      setErrorMsg(
        "Tuliskan konteks bisnis dan pertanyaan Anda (minimal 15 karakter)."
      );
      return;
    }

    try {
      setBooking(true);
      const res = await fetch("/api/consultations/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentor_id: mentor.id,
          availability_id: selectedSlotId,
          business_topic: businessTopic.trim(),
          question_notes: questionNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data.error || "Gagal mengonfirmasi jadwal konsultasi mentor."
        );
        setBooking(false);
        return;
      }

      router.push(
        data.booking?.id
          ? `/consultations/${data.booking.id}`
          : "/consultations"
      );
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kendala jaringan saat memesan jadwal konsultasi.");
      setBooking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/mentors"
          className="text-sm font-semibold text-[#1B8366] hover:underline"
        >
          Kembali ke Direktori Mentor
        </Link>
      </div>

      {/* Profil Detail Mentor */}
      <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#E8F4F0] border border-[#B7DCCF] font-heading text-lg font-bold text-[#1B8366]">
              {mentor.initials}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-[#172B25]">
                  {mentor.full_name}
                </h1>
                {mentor.is_demo_data && (
                  <Badge variant="warning">Data Demo MVP</Badge>
                )}
              </div>
              <p className="text-sm font-medium text-[#52645D]">
                {mentor.role_headline}
              </p>
              <p className="text-xs text-[#718078]">
                Pengalaman {mentor.years_of_experience} Tahun • Bahasa:{" "}
                {mentor.consultation_language} • Durasi Sesi:{" "}
                {mentor.session_duration_minutes} Menit
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm leading-[1.65] text-[#172B25] border-t border-[#E1E8E4] pt-4">
          {mentor.experience_summary}
        </p>

        <div className="flex flex-wrap gap-2">
          {mentor.expertise_tags.map((tag) => (
            <Badge key={tag} variant="primary">
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      {/* Pemilih Slot Jadwal & Formulir Booking */}
      <section className="rounded-xl border border-[#E1E8E4] bg-[#FFFFFF] p-6 space-y-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#172B25]">
            Pilih Slot Jadwal Konsultasi 1-on-1
          </h2>
          <p className="mt-1 text-sm text-[#52645D]">
            Slot waktu yang telah dipesan oleh pengguna lain dinonaktifkan secara
            otomatis untuk mencegah bentrok jadwal (double booking).
          </p>
        </div>

        {errorMsg && <AlertBanner variant="error" message={errorMsg} />}

        {/* Grid Slot Jadwal Interaktif */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {availabilities.map((slot) => {
            const isPast = new Date(slot.slot_start) <= new Date();
            const isDisabled = slot.is_booked || isPast;
            const isSelected = selectedSlotId === slot.id;

            const dateStr = new Intl.DateTimeFormat("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "Asia/Jakarta",
            }).format(new Date(slot.slot_start));

            const startStr = new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            }).format(new Date(slot.slot_start));

            const endStr = new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            }).format(new Date(slot.slot_end));

            return (
              <button
                key={slot.id}
                type="button"
                disabled={isDisabled}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`rounded-xl p-4 text-left transition-colors ${
                  isDisabled
                    ? "bg-[#EEF2F0] text-[#98A59E] border border-[#E1E8E4] cursor-not-allowed"
                    : isSelected
                    ? "border-2 border-[#1B8366] bg-[#E8F4F0] text-[#172B25] cursor-pointer"
                    : "border border-[#C8D4CE] bg-[#FFFFFF] text-[#172B25] hover:bg-[#F8FAF9] cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    {dateStr}
                  </span>
                  {isSelected && !isDisabled && (
                    <CheckCircle2 className="h-4 w-4 text-[#1B8366]" />
                  )}
                </div>
                <p className="mt-2 font-heading text-base font-bold">
                  {startStr} – {endStr} WIB
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {slot.is_booked
                    ? "Sudah Dipesan"
                    : isPast
                    ? "Waktu Terlewat"
                    : "Slot Tersedia"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gate Entitlement Paket Rantau Max */}
        {!entitlement.canBookMentor ? (
          <div className="rounded-xl border border-[#B7DCCF] bg-[#E8F4F0] p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B8366] text-[#FFFFFF]">
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-[#172B25]">
                  Pemesanan Sesi Mentor Tersedia untuk Paket Rantau Max
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-[#52645D]">
                  Paket aktif Anda saat ini adalah{" "}
                  <strong className="font-semibold text-[#172B25]">
                    {entitlement.name}
                  </strong>
                  . Beralih ke paket Rantau Max pada menu Langganan untuk
                  memesan jadwal konsultasi 1-on-1 bersama mentor.
                </p>
              </div>
            </div>

            <Link
              href="/settings/subscription"
              className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#FFFFFF] hover:bg-[#166B53] shrink-0 self-start sm:self-center"
            >
              Aktifkan Rantau Max
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleBook}
            className="space-y-4 border-t border-[#E1E8E4] pt-5"
            noValidate
          >
            <div>
              <label
                htmlFor="booking-topic"
                className="block text-sm font-medium text-[#172B25]"
              >
                Topik Utama Konsultasi
              </label>
              <input
                id="booking-topic"
                type="text"
                value={businessTopic}
                onChange={(e) => setBusinessTopic(e.target.value)}
                placeholder="Contoh: Evaluasi HPP dan Strategi Pre-Order Kopi Literan"
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
            </div>

            <div>
              <label
                htmlFor="booking-notes"
                className="block text-sm font-medium text-[#172B25]"
              >
                Konteks Bisnis & Daftar Pertanyaan untuk Mentor
              </label>
              <textarea
                id="booking-notes"
                rows={4}
                value={questionNotes}
                onChange={(e) => setQuestionNotes(e.target.value)}
                placeholder="Jelaskan kondisi usaha Anda saat ini dan 2-3 pertanyaan spesifik yang ingin dibedah bersama mentor selama sesi 45 menit..."
                className="mt-1.5 w-full rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#172B25] placeholder:text-[#718078]"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={booking}
                disabled={!selectedSlotId}
              >
                Konfirmasi Jadwal Konsultasi
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

