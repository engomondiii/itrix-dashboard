import { PageHeader } from "@/components/layout/PageHeader";
import { PersonaTable } from "@/components/personas/PersonaTable";

export default function PersonasPage() {
  return (
    <>
      <PageHeader
        title="Persona registry"
        description="The 60 target-account personas, seeded from the workbook. Internal only — a persona is a hypothesis about a role, never something a visitor is told."
      />
      <PersonaTable />
    </>
  );
}
