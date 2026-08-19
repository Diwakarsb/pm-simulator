import lessonContent from "../../content/tryout-lesson.json";
import { LessonPlayer } from "@/components/LessonPlayer";
import type { LessonContent } from "@/lib/types";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-8">
      <LessonPlayer content={lessonContent as LessonContent} />
    </main>
  );
}
