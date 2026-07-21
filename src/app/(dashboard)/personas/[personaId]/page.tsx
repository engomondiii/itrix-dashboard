import { PageHeader } from "@/components/layout/PageHeader";
import { PersonaDetail } from "@/components/personas/PersonaDetail";

export default async function PersonaDetailPage({
  params,
}: {
  params: Promise<{ personaId: string }>;
}) {
  const { personaId } = await params;

  return (
    <>
      <PageHeader
        title="Persona"
        description="Blueprint, decision lens and pitch-room resolution for one target-account persona."
      />
      <PersonaDetail personaId={personaId} />
    </>
  );
}
