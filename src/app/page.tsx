import lessonContent from "../../content/tryout-lesson.json";
import { LessonPlayer } from "@/components/LessonPlayer";
import type { LessonContent } from "@/lib/types";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-4 sm:px-6 py-6 sm:py-8">
      <LessonPlayer content={lessonContent as LessonContent} />
    </main>
  );
}
