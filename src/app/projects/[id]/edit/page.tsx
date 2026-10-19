import { notFound } from "next/navigation";
import { getProjectById } from "@/actions/projects";
import { Navbar } from "@/components/navigation/Navbar";
import { ProjectForm } from "@/components/projects/ProjectForm";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8">
        <ProjectForm initialData={project} isEditing />
      </main>
    </div>
  );
}
