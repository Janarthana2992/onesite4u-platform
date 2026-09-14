import { AdminView } from "@/components/admin-view";
import { DesignScope } from "@/components/design-store";

export default function AdminPage() {
  return (
    <DesignScope>
      <AdminView />
    </DesignScope>
  );
}
