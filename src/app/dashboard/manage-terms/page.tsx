import { ManagementPage } from "@/components/dashboard/management-layout";
import { TermTable } from "./term-table";

export default function ManageTermsPage() {
  return (
    <ManagementPage
      title="Manage Terms"
      description="Manage terms and their submission deadlines."
    >
      <TermTable />
    </ManagementPage>
  );
}
