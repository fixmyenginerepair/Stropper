import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ClassicPageList from '@/components/classic/ClassicPageList';
import ArchiveRegister from '@/components/classic/ArchiveRegister';
import ArchiveItemForm from '@/components/classic/ArchiveItemForm';

export default function ClassicStropper() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () =>
    base44.entities.ArchiveItem.list({ sort: 'position', limit: 200 }).then((page) => {
      setItems(page.items || []);
      setLoading(false);
    });

  useEffect(() => {
    load();
    base44.auth
      .me()
      .then((user) => setIsAdmin(user?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  const download = async (item) => {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: item.file_uri,
      expires_in: 300,
    });
    window.open(signed_url, '_blank', 'noopener');
  };

  const pages = items.filter((item) => item.kind === 'page');
  const files = items.filter((item) => item.kind !== 'page');
  const archivedCount = files.filter((item) => item.file_uri).length;
  const formItem = editing && editing !== 'new' ? editing : null;

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="archive-container max-w-4xl py-12 sm:py-16">
          <p className="eyebrow text-white/55">Part of the record</p>
          <h1 className="mt-3 font-heading text-[1.9rem] font-bold leading-tight sm:mt-4 sm:text-[3rem]">
            Classic Stropper
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">
            The site as it was built: hand-written PHP over a MySQL database, 1,906 catalogued
            sharpeners and thirty years of collecting. It stays where it is — and it stays here,
            read-only, unedited, alongside the new archive.
          </p>
          <dl className="mt-9 flex flex-wrap gap-x-12 gap-y-5 border-t border-white/15 pt-7">
            <div>
              <dt className="eyebrow text-white/45">Items in the classic database</dt>
              <dd className="mt-1 font-heading text-2xl font-bold">1,906</dd>
            </div>
            <div>
              <dt className="eyebrow text-white/45">Built with</dt>
              <dd className="mt-1 font-heading text-2xl font-bold">PHP · MySQL</dd>
            </div>
            <div>
              <dt className="eyebrow text-white/45">Preserved</dt>
              <dd className="mt-1 font-heading text-2xl font-bold">Read-only</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="archive-container py-10 sm:py-14">
        <div className="max-w-2xl">
          <p className="eyebrow text-oxblood">The classic pages</p>
          <h2 className="mt-3 font-heading text-2xl font-bold text-ink">
            Still online, and copied for good
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-steel">
            Every page of the original site is linked below as it stands today, with a copy in the
            Internet Archive so it stays readable even after the domain moves.
          </p>
        </div>
        <div className="mt-7">
          {loading ? (
            <p className="rounded-[10px] border border-hair bg-white p-10 text-center text-sm text-steel">
              Opening the archive…
            </p>
          ) : (
            <ClassicPageList pages={pages} />
          )}
        </div>
      </section>

      <section className="border-y border-hair bg-white/60">
        <div className="archive-container py-10 sm:py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-oxblood">The master copies</p>
              <h2 className="mt-3 font-heading text-2xl font-bold text-ink">
                The original code and the database
              </h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-steel">
                The PHP, HTML, CSS, JavaScript and Java that ran the old site, and the SQL dump that
                holds the data as it was entered by hand. Each file is added once, stored exactly as
                recovered, and never edited.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setEditing('new')}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-oxblood px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-oxblood-dark"
              >
                <Plus className="h-4 w-4" /> Add a file
              </button>
            )}
          </div>

          <p className="mt-6 text-[13px] text-steel/80">
            {archivedCount} of {files.length} master copies verified and stored.
          </p>

          <div className="mt-5">
            {loading ? (
              <p className="rounded-[10px] border border-hair bg-white p-10 text-center text-sm text-steel">
                Reading the register…
              </p>
            ) : (
              <ArchiveRegister
                items={files}
                isAdmin={isAdmin}
                onAttach={setEditing}
                onDownload={download}
              />
            )}
          </div>
        </div>
      </section>

      <section className="archive-container py-10 sm:py-14">
        <div className="rounded-[10px] border border-hair bg-white p-7">
          <h2 className="font-heading text-xl font-bold text-ink">When the domain moves</h2>
          <ul className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-steel">
            <li>
              <span className="font-semibold text-ink">This page stays put.</span> Classic Stropper
              lives inside the new archive, so it is unaffected by anything that happens to the old
              address.
            </li>
            <li>
              <span className="font-semibold text-ink">The Internet Archive copies are independent
              of both sites.</span> They are held by archive.org and cannot be altered here.
            </li>
            <li>
              <span className="font-semibold text-ink">The master copies are verifiable.</span> Each
              archived file carries its original path, size and a SHA-256 checksum, so any copy can
              be checked against what was stored.
            </li>
          </ul>
        </div>
      </section>

      {editing && (
        <ArchiveItemForm
          key={formItem?.id || 'new'}
          open
          item={formItem}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}