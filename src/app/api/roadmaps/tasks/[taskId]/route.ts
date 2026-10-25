import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UpdateTaskStatusSchema } from "@/lib/validations/roadmap";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    // Langkah 1: Verifikasi autentikasi pengguna
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesi tidak valid. Silakan masuk kembali." },
        { status: 401 }
      );
    }

    const { taskId } = await context.params;

    // Langkah 2: Validasi request body menggunakan Zod
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format JSON tidak valid." },
        { status: 400 }
      );
    }

    const parsed = UpdateTaskStatusSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Status tugas tidak valid.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Langkah 3 & 4: Pencegahan IDOR (.eq('user_id', user.id)) & update status task
    const { data: updatedTask, error: updateError } = await supabase
      .from("roadmap_tasks")
      .update({
        status: parsed.data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select("id, roadmap_id, status")
      .maybeSingle();

    if (updateError || !updatedTask) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan atau Anda tidak memiliki akses." },
        { status: 404 }
      );
    }

    // Hitung ulang persentase progres roadmap secara akurat di server
    const { data: allTasks } = await supabase
      .from("roadmap_tasks")
      .select("status")
      .eq("roadmap_id", updatedTask.roadmap_id)
      .eq("user_id", user.id);

    const totalTasks = allTasks?.length ?? 0;
    const completedTasks =
      allTasks?.filter((t) => t.status === "completed").length ?? 0;
    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await supabase
      .from("roadmaps")
      .update({
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updatedTask.roadmap_id)
      .eq("user_id", user.id);

    // Langkah 5: Kembalikan respons JSON terstruktur
    return NextResponse.json({
      message: "Status tugas berhasil diperbarui.",
      task: updatedTask,
      progressPercentage,
      completedTasks,
      totalTasks,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui status tugas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

