import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SharpenerCard from '@/components/SharpenerCard';
import { MechanismDiagram, MechanismSteps } from '@/components/HowItWorks';
import { MECHANISMS } from '@/lib/mechanisms';
import { SITE } from '@/lib/site';

// Families with no diagram yet: a short description instead.
const OTHERS = {
  marbles: {
    title: 'Ball or marble edger',
    short: 'The blade is drawn between hard steel balls or glass marbles.',
    text: 'Instead of leather or stone, these little tools run the edge between hard balls or marbles, which smooth the edge back into line rather than grinding it.',
    types: ['Marbles-Bearings'],
  },
  magnetic: {
    title: 'Magnetic sharpener',
    short: 'A magnet in the case, sold as a way to keep blades keen.',
    text: 'Magnetic sharpeners were sold on the claim that a magnet would restore or protect the edge. They are a popular curiosity with collectors.',
    types: ['Magnetic'],
  },
  shake: {
    title: 'Shake sharpener',
    short: 'You put the blade inside and shake the case.',
    text: 'The blade goes inside the case and is shaken back and forth against what is inside, with no crank or strop to work.',
    types: ['Shake Sharp'],
  },
  electric: {
    title: 'Electric sharpener',
    short: 'A motor does the work.',
    text: 'Later sharpeners ran on mains power or batteries, with a small motor driving rollers or a stone.',
    types: ['Electric'],
  },
};

const mech = (key) => MECHANISMS.find((m) => m.key === key);

// Each answer leads to another question or to a result: { m: mechanism key } or { o: other key }.
const QUESTIONS = {
  start: {
    q: 'What does it look like?',
    hint: 'Pick the closest match. You can go back at any time.',
    answers: [
      { label: 'A box or tin with a crank or handle you turn', next: 'crank' },
      { label: 'A box that hangs on a cord or string you pull', go: { m: 'pull-string' } },
      { label: 'A strip of leather with a handle at each end and a small frame in the middle', go: { m: 'pull-handles' } },
      { label: 'A safety razor with a leather strop that threads through its head', go: { m: 'self-stropping' } },
      { label: 'A small holder or handle that clamps a single blade', go: { m: 'blade-holder' } },
      { label: 'A flat stone, a glass plate or a ridged piece of glass', go: { m: 'hone' } },
      { label: 'Something else', next: 'other' },
    ],
  },
  crank: {
    q: 'When you open it, what is inside?',
    hint: 'Or what you can see through the slot where the blade goes.',
    answers: [
      { label: 'One or more round rollers (leather, wood or felt) that turn', go: { m: 'rollers' } },
      { label: 'A round ring of leather, with the blade on an arm that goes round', go: { m: 'circular' } },
      { label: 'A stone on one side and leather on the other, with a carriage that runs end to end', go: { m: 'allegro' } },
      { label: 'I can’t tell', next: 'crankShape' },
    ],
  },
  crankShape: {
    q: 'What shape is the case?',
    answers: [
      { label: 'Round, like a can or a drum', go: { m: 'circular' } },
      { label: 'A long, flat box with the crank on the end', go: { m: 'allegro' } },
      { label: 'A small square or oblong box', go: { m: 'rollers' } },
    ],
  },
  other: {
    q: 'Which of these does it have?',
    answers: [
      { label: 'Little steel balls or glass marbles', go: { o: 'marbles' } },
      { label: 'A magnet', go: { o: 'magnetic' } },
      { label: 'A sealed case you shake', go: { o: 'shake' } },
      { label: 'A plug or batteries', go: { o: 'electric' } },
      { label: 'None of these', go: { o: 'none' } },
    ],
  },
};

function Similar({ types }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setRows(null);
    base44.entities.Sharpener.filter({ type: { $in: types } }, '-updated_date', 40)
      .then((r) => {
        if (cancelled) return;
        const list = Array.isArray(r) ? r : r?.items || [];
        setRows(list.filter((s) => s.images?.length).slice(0, 8));
      })
      .catch(() => !cancelled && setRows([]));
    return () => {
      cancelled = true;
    };
  }, [types.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  if (rows && rows.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold text-ink">Pieces in the archive that work this way</h2>
        <Link
          to={`/browse?type=${encodeURIComponent(types[0])}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-oxblood hover:underline"
        >
          See them all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-2 text-[14px] text-steel">Compare the photos with yours: the name and maker are often on the case or the lid.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {rows === null
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-[10px] bg-white" />)
          : rows.map((s) => <SharpenerCard key={s.id} sharpener={s} showType />)}
      </div>
    </section>
  );
}

function Result({ result }) {
  const mailto = `mailto:${SITE.webmaster}?subject=${encodeURIComponent('Can you identify my sharpener?')}&body=${encodeURIComponent('Please attach a few photos, including any writing or patent numbers on the case.')}`;
  if (result.m) {
    const m = mech(result.m);
    return (
      <>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <MechanismDiagram mechanism={m} />
          <div className="min-w-0">
            <p className="eyebrow text-oxblood">It looks like a</p>
            <h2 className="mt-2 font-heading text-[1.9rem] font-bold leading-tight text-ink">{m.title}</h2>
            <p className="mt-2 text-[15px] text-steel">{m.short}</p>
            <MechanismSteps mechanism={m} />
          </div>
        </div>
        <Similar types={m.types} />
        <StillUnsure mailto={mailto} />
      </>
    );
  }
  const o = OTHERS[result.o];
  if (!o) {
    return (
      <div className="rounded-[12px] border border-hair bg-white p-6 sm:p-8">
        <h2 className="font-heading text-2xl font-bold text-ink">Let us take a look</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-steel">
          Some sharpeners don’t fit any family. Send a few photos, including any writing or patent numbers on the case,
          and the collector behind this archive will try to identify it.
        </p>
        <a href={mailto} className="mt-5 inline-block rounded-lg bg-oxblood px-6 py-3 text-sm font-semibold text-white hover:bg-oxblood-dark">
          Email photos to the webmaster
        </a>
      </div>
    );
  }
  return (
    <>
      <div className="rounded-[12px] border border-hair bg-white p-6 sm:p-8">
        <p className="eyebrow text-oxblood">It looks like a</p>
        <h2 className="mt-2 font-heading text-[1.9rem] font-bold leading-tight text-ink">{o.title}</h2>
        <p className="mt-2 text-[15px] text-steel">{o.short}</p>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/85">{o.text}</p>
      </div>
      <Similar types={o.types} />
      <StillUnsure mailto={mailto} />
    </>
  );
}

function StillUnsure({ mailto }) {
  return (
    <p className="mt-12 border-t border-hair pt-6 text-[14px] text-steel">
      Still not sure?{' '}
      <a href={mailto} className="font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood">
        Email photos to the webmaster
      </a>{' '}
      and we’ll try to identify it.
    </p>
  );
}

export default function Identify() {
  const [params, setParams] = useSearchParams();
  // The path of answers lives in the URL, so a result can be shared or bookmarked.
  const path = useMemo(() => (params.get('a') || '').split('.').filter(Boolean).map(Number), [params]);

  let node = 'start';
  let result = null;
  const trail = [];
  for (const i of path) {
    const a = QUESTIONS[node]?.answers[i];
    if (!a) break;
    trail.push(a.label);
    if (a.go) {
      result = a.go;
      break;
    }
    node = a.next;
  }

  const choose = (i) => setParams({ a: [...path, i].join('.') });
  const back = () => setParams(path.length > 1 ? { a: path.slice(0, -1).join('.') } : {});
  const restart = () => setParams({});
  const question = QUESTIONS[node];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [params]);

  return (
    <div className="archive-container py-10 lg:py-14">
      <p className="eyebrow text-oxblood">Identify your sharpener</p>
      <h1 className="mt-3 max-w-3xl font-heading text-[2rem] font-bold leading-tight text-ink sm:text-[2.6rem]">
        Found an old blade sharpener and don’t know what it is?
      </h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-steel">
        Answer a couple of quick questions to find out how it works and see similar pieces from a collection of more than
        1,900 razor-blade sharpeners, strops and hones most of them made between the 1900s and the 1960s.
      </p>

      {trail.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2 text-[13px]">
          {trail.map((t, i) => (
            <span key={i} className="max-w-full rounded-full border border-hair bg-white px-3 py-1 text-steel">
              {t}
            </span>
          ))}
          <button type="button" onClick={back} className="inline-flex items-center gap-1 px-2 py-1 font-semibold text-ink hover:text-oxblood">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button type="button" onClick={restart} className="inline-flex items-center gap-1 px-2 py-1 font-semibold text-ink hover:text-oxblood">
            <RotateCcw className="h-4 w-4" /> Start again
          </button>
        </div>
      )}

      <div className="mt-8">
        {result ? (
          <Result result={result} />
        ) : (
          <section className="rounded-[12px] border border-hair bg-white p-5 sm:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-steel">Question {path.length + 1}</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-ink">{question.q}</h2>
            {question.hint && <p className="mt-1 text-[14px] text-steel">{question.hint}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {question.answers.map((a, i) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => choose(i)}
                  className="group flex items-center justify-between gap-3 rounded-[10px] border border-hair bg-frost/40 px-4 py-4 text-left text-[15px] font-medium text-ink transition-colors hover:border-oxblood hover:bg-white"
                >
                  <span className="min-w-0">{a.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-steel transition-colors group-hover:text-oxblood" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
