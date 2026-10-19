import { notFound } from "next/navigation";
import { getProjectById } from "@/actions/projects";
import { Navbar } from "@/components/navigation/Navbar";
import { ProjectDashboardHeader } from "@/components/projects/ProjectDashboardHeader";
import { AssignedTrainersSection } from "@/components/projects/AssignedTrainersSection";

export const dynamic = "force-dynamic";

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8 space-y-8">
        {/* Project Header Banner & Status Controls */}
        <ProjectDashboardHeader project={project} />

        {/* Assigned Trainers List & Assign Modal */}
        <AssignedTrainersSection project={project as any} />
      </main>
    </div>
  );
}
