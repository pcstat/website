'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/** Everything the club shell prints. Comes from the database, so the terminal is never out of date. */
export interface TerminalData {
  members: number;
  projects: number;
  publications: number;
  years: number;
  recentProjects: { title: string; status: string }[];
  events: { title: string; date: string; time?: string; location?: string }[];
}

interface Token {
  /** Style: fn (green), kw (purple), num (orange), key (blue), dim (muted), tc (plain) … */
  t: string;
  v: string;
  href?: string;
}
type OutLine = Token[];
interface ScreenLine {
  prompt?: boolean;
  tokens: Token[];
}

const COMMANDS = ['about', 'stats', 'projects', 'events', 'join'] as const;
type Command = (typeof COMMANDS)[number];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function prettyDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const STATUS_STYLE: Record<string, string> = { active: 'fn', completed: 'key', research: 'kw', publication: 'kw' };

function nextEvent(events: TerminalData['events']) {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return [...events].filter((e) => e.date >= iso).sort((a, b) => a.date.localeCompare(b.date))[0];
}

function stat(label: string, value: number): OutLine {
  return [{ t: 'label', v: label }, { t: 'num', v: String(value) }];
}

function output(cmd: Command, data: TerminalData): OutLine[] {
  switch (cmd) {
    case 'about':
      return [
        [{ t: 'fn', v: 'Statistics Programming Club' }],
        [{ t: 'tc', v: 'Dept. of Statistics · University of Chittagong' }],
        [{ t: 'cm', v: '# est. 2022 — programmers, problem-solvers & builders' }],
        [{ t: 'label', v: 'focus' }, { t: 'str', v: 'python · r · ai/ml · deep learning · statistics' }],
      ];
    case 'stats':
      return [
        stat('members', data.members),
        stat('projects', data.projects),
        stat('publications', data.publications),
        stat('years', data.years),
      ];
    case 'projects': {
      if (data.recentProjects.length === 0) return [[{ t: 'cm', v: '# nothing published yet — check back soon' }]];
      const rows: OutLine[] = [[{ t: 'cm', v: '# latest from the lab' }]];
      for (const p of data.recentProjects) {
        rows.push([{ t: STATUS_STYLE[p.status] ?? 'tc', v: '● ' }, { t: 'tc', v: p.title }, { t: 'dim', v: `  [${p.status}]` }]);
      }
      return rows;
    }
    case 'events': {
      const ev = nextEvent(data.events);
      if (!ev) {
        return [
          [{ t: 'cm', v: '# no upcoming events right now' }],
          [{ t: 'tc', v: 'new workshops & contests are posted as soon as they are scheduled' }],
        ];
      }
      const when = [prettyDate(ev.date), ev.time, ev.location].filter(Boolean).join(' · ');
      return [[{ t: 'kw', v: '▸ ' }, { t: 'tc', v: ev.title }], [{ t: 'dim', v: `  ${when}` }]];
    }
    case 'join':
      return [
        [{ t: 'tc', v: 'open to every Stat major & minor — no experience needed.' }],
        [{ t: 'fn', v: '→ ' }, { t: 'lnk', v: 'see how to join', href: '/about' }],
      ];
  }
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Terminal({ data }: { data: TerminalData }) {
  const [lines, setLines] = useState<ScreenLine[]>([]);
  const [busy, setBusy] = useState(true);
  const [last, setLast] = useState<Command | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const run = useCallback(async (cmds: Command[], clearFirst: boolean) => {
    const id = ++runId.current;
    const live = () => runId.current === id;
    const fast = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pause = (ms: number) => (fast ? Promise.resolve() : wait(ms));

    setBusy(true);
    if (clearFirst) setLines([]);

    for (const cmd of cmds) {
      if (!live()) return;
      const typed = `pcstat ${cmd}`;
      setLines((prev) => [...prev, { prompt: true, tokens: [] }]);
      for (let i = 1; i <= typed.length; i++) {
        if (!live()) return;
        const text = typed.slice(0, i);
        const sub = text.length > 7 ? text.slice(7) : '';
        const tokens: Token[] = [{ t: 'fn', v: text.slice(0, 6) }];
        if (text.length > 6) tokens.push({ t: 'tc', v: ' ' });
        if (sub) tokens.push({ t: 'tc', v: sub });
        setLines((prev) => [...prev.slice(0, -1), { prompt: true, tokens }]);
        await pause(fast ? 0 : 42);
      }
      await pause(260);
      for (const out of output(cmd, dataRef.current)) {
        if (!live()) return;
        setLines((prev) => [...prev, { tokens: out }]);
        await pause(110);
      }
      setLast(cmd);
      await pause(650);
    }
    if (live()) setBusy(false);
  }, []);

  // Autoplay once on arrival.
  useEffect(() => {
    void run([...COMMANDS], false);
    return () => {
      runId.current++;
    };
  }, [run]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, busy]);

  return (
    <div className="term">
      <div className="tbar">
        <div className="dot dr"></div>
        <div className="dot dy"></div>
        <div className="dot dg"></div>
        <span className="tttl">pcstat — ~/statistics-programming-club</span>
      </div>

      <p className="sr-only">
        Statistics Programming Club, Department of Statistics, University of Chittagong, established 2022.
        {` ${data.members} members, ${data.projects} projects and ${data.publications} publications.`}
      </p>

      <div className="tbody" id="term-body" ref={bodyRef} aria-hidden="true">
        {lines.map((line, i) => (
          <div key={i} className={`tl ${line.prompt ? 'tl-cmd' : 'tl-out'}`}>
            {line.prompt && <span className="tp">❯</span>}
            {line.tokens.map((tok, j) =>
              tok.href ? (
                <Link key={j} href={tok.href} className={`t-${tok.t}`}>
                  {tok.v}
                </Link>
              ) : (
                <span key={j} className={`t-${tok.t}`}>
                  {tok.v}
                </span>
              ),
            )}
          </div>
        ))}
        {!busy && (
          <div className="tl tl-cmd">
            <span className="tp">❯</span>
            <span className="tcur"></span>
          </div>
        )}
      </div>

      <div className="tfoot">
        <span className="tfoot-lbl">try</span>
        {COMMANDS.map((c) => (
          <button
            key={c}
            type="button"
            className={`tchip ${last === c && !busy ? 'is-last' : ''}`}
            onClick={() => void run([c], true)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
