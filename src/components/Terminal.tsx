'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/** Everything the club shell prints. Comes from the database, so the terminal is never out of date. */
export interface TerminalData {
  members: number;
  /** What `members` counts: "MEMBERS" when the admin typed a member count, "EXECUTIVES" when the executives are counted. */
  membersLabel: 'MEMBERS' | 'EXECUTIVES';
  projects: number;
  publications: number;
  years: number;
  topProjects: { title: string; status: string }[];
  /** The executives pinned on the home page. */
  team: { name: string; role: string }[];
  /** The counters of the achievements page ("12 Gold" …). */
  tally: { value: string; label: string }[];
  /** Labels of the committees before the current one. */
  pastCommittees: string[];
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

const COMMANDS = ['about', 'stats', 'team', 'projects', 'achievements', 'events', 'alumni', 'verify', 'join'] as const;
type Command = (typeof COMMANDS)[number];

/** What plays by itself when the page opens; the other commands are one click away. */
const INTRO: Command[] = ['about', 'stats', 'projects', 'events', 'join'];

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

/** The last line of a command's output: a link to the page that has the full story. */
function go(label: string, href: string): OutLine {
  return [{ t: 'fn', v: '→ ' }, { t: 'lnk', v: label, href }];
}

function output(cmd: Command, data: TerminalData): OutLine[] {
  switch (cmd) {
    case 'about':
      return [
        [{ t: 'fn', v: 'Statistics Programming Club' }],
        [{ t: 'tc', v: 'Dept. of Statistics · University of Chittagong' }],
        [{ t: 'cm', v: '# est. 2022 — programmers, problem-solvers & builders' }],
        [{ t: 'label', v: 'focus' }, { t: 'str', v: 'python · r · ai/ml · deep learning · statistics' }],
        go('about the club & contact', '/about'),
      ];
    case 'stats':
      return [
        stat(data.membersLabel.toLowerCase(), data.members),
        stat('projects', data.projects),
        stat('publications', data.publications),
        stat('years', data.years),
        go('meet the executives', '/exec'),
      ];
    case 'team': {
      if (data.team.length === 0) return [[{ t: 'cm', v: '# the leadership team will be listed here soon' }], go('all executives', '/exec')];
      const rows: OutLine[] = [[{ t: 'cm', v: '# club leadership' }]];
      for (const m of data.team) {
        rows.push([{ t: 'fn', v: '● ' }, { t: 'tc', v: m.name }, ...(m.role ? [{ t: 'dim', v: `  [${m.role}]` }] : [])]);
      }
      rows.push(go('all executives', '/exec'));
      return rows;
    }
    case 'projects': {
      if (data.topProjects.length === 0) return [[{ t: 'cm', v: '# nothing published yet — check back soon' }], go('all projects', '/projects')];
      const rows: OutLine[] = [[{ t: 'cm', v: '# top projects' }]];
      for (const p of data.topProjects) {
        rows.push([{ t: STATUS_STYLE[p.status] ?? 'tc', v: '● ' }, { t: 'tc', v: p.title }, { t: 'dim', v: `  [${p.status}]` }]);
      }
      rows.push(go('all projects & publications', '/projects'));
      return rows;
    }
    case 'achievements': {
      if (data.tally.length === 0) return [[{ t: 'cm', v: '# results are added after every contest' }], go('achievements', '/achievements')];
      const rows: OutLine[] = [[{ t: 'cm', v: '# our results so far' }]];
      for (const t of data.tally) rows.push([{ t: 'label', v: t.label.toLowerCase() }, { t: 'num', v: t.value }]);
      rows.push(go('all achievements', '/achievements'));
      return rows;
    }
    case 'events': {
      const ev = nextEvent(data.events);
      if (!ev) {
        return [
          [{ t: 'cm', v: '# no upcoming events right now' }],
          [{ t: 'tc', v: 'new workshops & contests are posted as soon as they are scheduled' }],
          go('events', '/events'),
        ];
      }
      const when = [prettyDate(ev.date), ev.time, ev.location].filter(Boolean).join(' · ');
      return [[{ t: 'kw', v: '▸ ' }, { t: 'tc', v: ev.title }], [{ t: 'dim', v: `  ${when}` }], go('all events', '/events')];
    }
    case 'alumni': {
      if (data.pastCommittees.length === 0) return [[{ t: 'cm', v: '# our first committee is still serving' }], go('executives', '/exec')];
      const rows: OutLine[] = [[{ t: 'cm', v: '# past committees' }]];
      for (const label of data.pastCommittees) rows.push([{ t: 'kw', v: '▸ ' }, { t: 'tc', v: label }]);
      rows.push(go('past executives', '/alumni'));
      return rows;
    }
    case 'verify':
      return [
        [{ t: 'tc', v: 'every certificate we issue carries an ID.' }],
        [{ t: 'dim', v: 'type it in on the verification page to confirm it is genuine.' }],
        go('verify a certificate', '/certificate'),
      ];
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
    void run(INTRO, false);
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
        {` ${data.members} ${data.membersLabel.toLowerCase()}, ${data.projects} projects and ${data.publications} publications.`}
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
