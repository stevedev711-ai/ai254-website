import { StudentLecture } from "@/components/live/StudentLecture";

export const metadata = { title: "Lecture", robots: { index: false } };

export default async function StudentLecturePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <StudentLecture code={code.toUpperCase()} />;
}
