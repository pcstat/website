import React from 'react';
import { linkFor, printSectionKeys, sectionTitle, shortUrl, usable, type ContactKind } from './cvFormat';
import styles from './printCv.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any -- cv.json is free-form (see docs/TODO.md) */

function Bullets({ bullets }: { bullets?: any[] }) {
  if (!Array.isArray(bullets) || bullets.length === 0) return null;
  return (
    <ul className={styles.bullets}>
      {bullets.map((bullet, i) =>
        typeof bullet === 'object' && bullet !== null ? (
          <li key={i}>
            {bullet.text}
            {Array.isArray(bullet.children) && bullet.children.length > 0 && (
              <ul className={styles.children}>
                {bullet.children.map((child: string, c: number) => (
                  <li key={c}>{child}</li>
                ))}
              </ul>
            )}
          </li>
        ) : (
          <li key={i}>{bullet}</li>
        ),
      )}
    </ul>
  );
}

const flat = (items: any[]) => items.map((item) => (typeof item === 'object' && item !== null ? item.text : item)).filter(Boolean).join(', ');

/** One entry of a section: "Title ........ dates", "Organisation ........ place", then the points. */
function Entry({ item }: { item: any }) {
  // A skills row has no title: "Languages: Python, R, SQL".
  if (!item.title && item.subtitle && Array.isArray(item.commas)) {
    return (
      <p className={styles.skillRow}>
        <strong>{item.subtitle}:</strong> {flat(item.commas)}
      </p>
    );
  }
  return (
    <div className={styles.entry}>
      <div className={styles.row}>
        <span className={styles.title}>
          {item.title}
          {usable(item.link) && <span className={styles.url}>{shortUrl(item.link)}</span>}
        </span>
        {usable(item.dates) && <span className={styles.dates}>{item.dates}</span>}
      </div>
      {(usable(item.subtitle) || usable(item.location)) && (
        <div className={styles.row}>
          <span className={styles.subtitle}>{usable(item.subtitle) ? item.subtitle : ''}</span>
          {usable(item.location) && <span className={styles.place}>{item.location}</span>}
        </div>
      )}
      <Bullets bullets={item.bullets} />
      {Array.isArray(item.commas) && item.commas.length > 0 && <p className={styles.commas}>{flat(item.commas)}</p>}
    </div>
  );
}

function Education({ items }: { items: any[] }) {
  return (
    <>
      {items.map((edu, i) => {
        const grades = [usable(edu.cgpa) ? `CGPA: ${edu.cgpa}` : '', usable(edu.rank) ? `Rank: ${edu.rank}` : '', usable(edu.honors) ? edu.honors : '']
          .filter(Boolean)
          .join('  ·  ');
        return (
          <div key={i} className={`${styles.entry} ${styles.compact}`}>
            <div className={styles.row}>
              <span className={styles.title}>{edu.degree}</span>
              {usable(edu.year) && <span className={styles.dates}>{edu.year}</span>}
            </div>
            <div className={styles.row}>
              <span className={styles.subtitle}>{edu.institution}</span>
              {usable(edu.location) && <span className={styles.place}>{edu.location}</span>}
            </div>
            {grades && <div className={styles.meta}>{grades}</div>}
            {usable(edu.thesis) && (
              <div className={styles.meta}>
                <strong>Thesis:</strong> {edu.thesis}
              </div>
            )}
            {Array.isArray(edu.coursework) && edu.coursework.length > 0 && (
              <div className={styles.meta}>
                <strong>Relevant coursework:</strong> {edu.coursework.join(', ')}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function Section({ name, items }: { name: string; items: any[] }) {
  let body: React.ReactNode;
  if (name === 'education') {
    body = <Education items={items} />;
  } else if (name === 'languages') {
    body = <p className={styles.plain}>{items.join(', ')}</p>;
  } else if (name === 'certifications') {
    body = (
      <ul className={styles.bullets}>
        {items.map((cert, i) => (
          <li key={i}>{typeof cert === 'string' ? cert : cert.title}</li>
        ))}
      </ul>
    );
  } else {
    body = items.map((item, i) => <Entry key={i} item={item} />);
  }
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{sectionTitle(name)}</h2>
      {body}
    </section>
  );
}

/**
 * The CV as it prints: one column, plain black on white, sections in the order of a conventional CV
 * (summary, education, experience, projects, skills, …) — the layout recruiters and ATS parsers expect.
 * Hidden on screen — the styled page is what visitors see; the browser's print dialog shows this.
 *
 * The page margins are made here, with a table whose header and footer cells repeat on every printed page,
 * because a CSS page margin would bring back the browser's own header and footer (date, title, address).
 */
export function PrintCV({ name, role, cv }: { name: string; role: string; cv: any }) {
  const contact: { text: string; href?: string }[] = [];
  const add = (kind: ContactKind | null, value: unknown, text?: string) => {
    if (!usable(value)) return;
    contact.push({ text: text ?? shortUrl(String(value)), href: kind ? linkFor(kind, String(value)) : undefined });
  };
  add(null, cv.location, cv.location);
  add('phone', cv.phone, cv.phone);
  add('email', cv.email, cv.email);
  add('linkedin', cv.linkedin);
  add('github', cv.github);
  add('website', cv.website);

  return (
    <div className={styles.root} aria-hidden="true">
      <table className={styles.sheet}>
        <thead>
          <tr>
            <td>
              <div className={styles.margin} />
            </td>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td>
              <div className={styles.margin} />
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td className={styles.page}>
              <header className={styles.header}>
                <h1 className={styles.name}>{name}</h1>
                <div className={styles.role}>{[role, usable(cv.role) ? cv.role : ''].filter(Boolean).join('  ·  ')}</div>
                {contact.length > 0 && (
                  <div className={styles.contact}>
                    {contact.map((c, i) => (
                      <React.Fragment key={c.text}>
                        {i > 0 && <span className={styles.sep}> | </span>}
                        {c.href ? <a href={c.href}>{c.text}</a> : <span>{c.text}</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </header>
              {usable(cv.summary) && (
                <section className={styles.section}>
                  <h2 className={styles.heading}>Summary</h2>
                  <p className={styles.plain}>{cv.summary}</p>
                </section>
              )}
              {printSectionKeys(cv).map((key) => (
                <Section key={key} name={key} items={cv[key]} />
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
