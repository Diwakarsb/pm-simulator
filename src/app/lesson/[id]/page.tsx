import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULES, MODULE_LIST } from "@/lib/modules";
import { LessonPlayer } from "@/components/LessonPlayer";

export function generateStaticParams() {
  return MODULE_LIST.map((m) => ({ id: m.module.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = MODULES[id];
  if (!content) notFound();

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href="/"
        className="mb-4 inline-flex min-h-9 items-center gap-1 text-[13px] font-medium text-muted hover:text-foreground transition-colors"
      >
        ← All simulators
      </Link>
      <LessonPlayer content={content} />
    </main>
  );
}
