/**
 * Students who have sent in papers, and what they sent.
 *
 * Deliberately a plain list in code rather than a database table: crediting
 * someone is a one-line edit and a deploy, which is faster than building admin
 * CRUD for it, and the list is small enough that nobody needs to search it. If
 * it grows past a page or two, that is the moment to move it into Prisma.
 *
 * To add someone, append an entry — newest last is fine, the page sorts by
 * nothing and renders them in order:
 *
 *   { name: "Full Name", department: "IT", year: 2, tags: ["SEM 3 papers"] }
 */
export interface Contributor {
  name: string;
  /** Department code as it appears in the navigation: IT, CS, AI & DS, ... */
  department: string;
  /** Year of study when they contributed, or null if they'd rather not say. */
  year: number | null;
  /**
   * Short labels for what they gave — one per distinct contribution, e.g.
   * "SEM 3 end-term papers", "RE-ETE papers", "DBMS notes". These render as
   * badges, so keep them to a few words.
   */
  tags: string[];
}

export const CONTRIBUTORS: Contributor[] = [];
