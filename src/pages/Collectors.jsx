import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import JoinDirectoryForm from '@/components/collectors/JoinDirectoryForm';
import CollectorDirectory from '@/components/collectors/CollectorDirectory';
import PendingApprovals from '@/components/collectors/PendingApprovals';

export default function Collectors() {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = () =>
    base44.entities.Collector.list('name', 500).then((rows) => {
      setCollectors(rows || []);
      setLoading(false);
    });

  useEffect(() => {
    load();
    base44.auth
      .me()
      .then((user) => setIsAdmin(user?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  const approved = collectors.filter((row) => row.approved);
  const pending = collectors.filter((row) => !row.approved);

  const approve = async (id) => {
    await base44.entities.Collector.update(id, { approved: true });
    await load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    await base44.entities.Collector.delete(id);
    await load();
  };

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">The people</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.6rem]">
          Collectors
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-steel">
          If you would like to be added to the list of collectors below, please fill out this form.
        </p>
      </header>

      <JoinDirectoryForm />

      <CollectorDirectory collectors={approved} loading={loading} />

      {isAdmin && <PendingApprovals pending={pending} onApprove={approve} onDelete={remove} />}
    </div>
  );
}