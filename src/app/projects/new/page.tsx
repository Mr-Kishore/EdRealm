import { Navbar } from "@/components/navigation/Navbar";
import { ProjectForm } from "@/components/projects/ProjectForm";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8">
        <ProjectForm />
      </main>
    </div>
  );
}
