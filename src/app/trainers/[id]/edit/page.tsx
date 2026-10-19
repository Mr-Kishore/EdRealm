import { notFound } from "next/navigation";
import { getTrainerById } from "@/actions/trainers";
import { getCatalogHierarchy } from "@/actions/catalog";
import { Navbar } from "@/components/navigation/Navbar";
import { TrainerForm } from "@/components/trainers/TrainerForm";

export const dynamic = "force-dynamic";

interface EditTrainerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTrainerPage({ params }: EditTrainerPageProps) {
  const { id } = await params;
  const [trainer, categories] = await Promise.all([
    getTrainerById(id),
    getCatalogHierarchy(),
  ]);

  if (!trainer) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8">
        <TrainerForm 
          initialData={trainer as any} 
          categories={categories} 
          isEditing 
        />
      </main>
    </div>
  );
}
