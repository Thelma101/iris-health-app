import Card from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Patients" footer={<span className="text-sm text-foreground/60">Today</span>}>
          <div className="text-3xl font-semibold">42</div>
        </Card>
        <Card title="Appointments" footer={<span className="text-sm text-foreground/60">Scheduled</span>}>
          <div className="text-3xl font-semibold">8</div>
        </Card>
        <Card title="Medications" footer={<span className="text-sm text-foreground/60">Active</span>}>
          <div className="text-3xl font-semibold">27</div>
        </Card>
        <Card title="Alerts" footer={<span className="text-sm text-foreground/60">New</span>}>
          <div className="text-3xl font-semibold">3</div>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Today’s Medications">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span>Amoxicillin 500mg</span>
              <span className="text-foreground/60">08:00</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Ibuprofen 200mg</span>
              <span className="text-foreground/60">12:00</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Metformin 1000mg</span>
              <span className="text-foreground/60">18:00</span>
            </li>
          </ul>
        </Card>
        <Card title="Upcoming">
          <div className="text-sm text-foreground/70">No upcoming schedule</div>
        </Card>
        <Card title="Patients">
          <ul className="space-y-2 text-sm">
            <li>Jane Doe</li>
            <li>John Smith</li>
            <li>Aisha Bello</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
