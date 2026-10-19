import { getCatalogHierarchy } from "@/actions/catalog";
import { Navbar } from "@/components/navigation/Navbar";
import { TrainerForm } from "@/components/trainers/TrainerForm";

export const dynamic = "force-dynamic";

export default async function NewTrainerPage() {
  const categories = await getCatalogHierarchy();

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8">
        <TrainerForm categories={categories} />
      </main>
    </div>
  );
}
