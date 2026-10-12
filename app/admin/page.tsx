import AdminApp from '@/components/admin/AdminApp'

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Panel</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Ustawienia sklepu</h1>
      <div className="mt-8">
        <AdminApp />
      </div>
    </div>
  )
}
