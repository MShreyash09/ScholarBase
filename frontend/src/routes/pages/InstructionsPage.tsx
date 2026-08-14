import { Link } from "react-router-dom";
import {
  BookOpen,
  Download,
  Eye,
  FileText,
  Lock,
  Mail,
  MonitorUp,
  PenLine,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, SIGNUP_EMAIL_DOMAIN } from "@/lib/site";

/**
 * What the site does and what each kind of visitor can reach.
 *
 * Every rule stated here is enforced by the backend, not just drawn by the UI —
 * the free-paper limit, the domain allowlist and the verification gate all live
 * in the API. Keep this page in step with those rules: a page that promises
 * access the server refuses is worse than no page at all.
 */

/** One row of the access table. `has` drives the tick/lock, so it can't drift from the label. */
function AccessRow({ has, children }: { has: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 py-1.5 text-sm">
      <span
        className={
          has
            ? "mt-0.5 shrink-0 font-bold text-success"
            : "mt-0.5 shrink-0 font-bold text-foreground-subtle"
        }
        aria-hidden="true"
      >
        {has ? "✓" : "✕"}
      </span>
      <span className={has ? "text-foreground" : "text-foreground-muted"}>{children}</span>
    </li>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-brand">
        {n}
      </span>
      <div className="pb-5">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-foreground-muted">{children}</p>
      </div>
    </li>
  );
}

export function InstructionsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl">How ScholarBase works</h1>
      <p className="mb-10 max-w-2xl text-foreground-muted">
        An archive of MMCOE question papers, notes, and study rooms — built after the college went
        autonomous, so juniors aren&apos;t left without a single past paper to practise from. This
        page explains what you can reach at each stage and how to use it.
      </p>

      <section className="mb-12">
        <h2 className="mb-1 text-2xl">What you can access</h2>
        <p className="mb-5 text-sm text-foreground-muted">
          These limits are enforced by the server, not just hidden in the interface.
        </p>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Badge variant="muted">Stage 1</Badge>
              <CardTitle className="text-lg">Not signed in</CardTitle>
              <CardDescription>Browse freely, read one paper.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                <AccessRow has>Browse every department, year, semester and subject</AccessRow>
                <AccessRow has>See exactly which papers exist, and for which year</AccessRow>
                <AccessRow has>
                  Open and download <strong>one question paper per semester</strong> — the most
                  recent year&apos;s paper is the free one
                </AccessRow>
                <AccessRow has={false}>Every other question paper</AccessRow>
                <AccessRow has={false}>Notes</AccessRow>
                <AccessRow has={false}>Study rooms</AccessRow>
              </ul>
              <p className="mt-3 text-xs text-foreground-muted">
                Locked papers still appear in the lists on purpose — you can see how much is in the
                archive before deciding to sign up. Hover one and it offers you the login.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="muted">Stage 2</Badge>
              <CardTitle className="text-lg">Signed up, not confirmed</CardTitle>
              <CardDescription>The account exists but can&apos;t be used yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                <AccessRow has>Everything a signed-out visitor gets</AccessRow>
                <AccessRow has={false}>
                  Logging in — it is refused, with a message, until you open the confirmation link
                </AccessRow>
              </ul>
              <p className="mt-3 text-xs text-foreground-muted">
                Signing up sends a confirmation link to your college inbox and logs you in to
                nothing. The link is single-use and expires in 24 hours; if it lapses or never
                arrives, use the resend option on the login page.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="success">Stage 3</Badge>
              <CardTitle className="text-lg">Confirmed and logged in</CardTitle>
              <CardDescription>The whole archive, and study rooms.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                <AccessRow has>
                  Every question paper — Unit Test, End Term and RE-ETE — with no per-semester limit
                </AccessRow>
                <AccessRow has>Read papers in the browser, or download the file</AccessRow>
                <AccessRow has>Notes for every subject</AccessRow>
                <AccessRow has>
                  Study rooms: create, join, chat, camera, mic, screen share and the whiteboard
                </AccessRow>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Mail className="h-5 w-5 text-brand" aria-hidden="true" />
          Creating your account
        </h2>
        <p className="mb-5 text-sm text-foreground-muted">
          Only current MMCOE students can register.
        </p>
        <Card>
          <CardContent className="pt-6">
            <ol>
              <Step n={1} title={`Use your college email — ${SIGNUP_EMAIL_DOMAIN} only`}>
                Signup rejects every other domain, Gmail included. If you have more than one college
                address, any of them works as long as it ends in {SIGNUP_EMAIL_DOMAIN}.
              </Step>
              <Step n={2} title="Pick a password you don't use elsewhere">
                Passwords are stored hashed, never in plain text — but reusing a password across
                sites is still the way most accounts get taken over.
              </Step>
              <Step n={3} title="Open the confirmation link in your inbox">
                It proves the address is really yours. Until you open it, logging in is refused. The
                link works once and expires after 24 hours.
              </Step>
              <Step n={4} title="Nothing arrived? Check spam, then resend">
                College mail filters are aggressive. The login page has a resend option, and
                forgotten passwords have their own reset link on the same page.
              </Step>
            </ol>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild>
                <Link to="/signup">Create an account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <FileText className="h-5 w-5 text-brand" aria-hidden="true" />
          Finding and reading a paper
        </h2>
        <p className="mb-5 text-sm text-foreground-muted">
          Once you&apos;re logged in, nothing is locked.
        </p>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Getting there</CardTitle>
            </CardHeader>
            <CardContent>
              <ol>
                <Step n={1} title="Pick your department from the top menu">
                  IT, CS, AI &amp; DS, ENTC, MECH or ELEC.
                </Step>
                <Step n={2} title="Choose your year, then the semester">
                  Each semester page lists every subject in it.
                </Step>
                <Step n={3} title="Papers are grouped by exam">
                  <strong>Unit Test</strong>, <strong>End Term</strong>, and{" "}
                  <strong>RE-ETE</strong> — the re-examination paper for a subject you have to sit
                  again. Each subject row shows a pill per academic year available.
                </Step>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opening the file</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Download className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">Straight from the semester page</p>
                  <p className="text-sm text-foreground-muted">
                    Click the year pill next to a subject and the PDF downloads immediately.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Eye className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">Or read it in the browser</p>
                  <p className="text-sm text-foreground-muted">
                    Click the <strong>subject name</strong> to open its page, then{" "}
                    <strong>View</strong> to read the PDF without leaving the site, or{" "}
                    <strong>Download</strong> to keep a copy. That page also has a{" "}
                    <strong>Notes</strong> tab.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-foreground-subtle" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">Seeing a padlock?</p>
                  <p className="text-sm text-foreground-muted">
                    You&apos;re signed out, or your session expired. Log in and it unlocks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Users className="h-5 w-5 text-brand" aria-hidden="true" />
          Study rooms
        </h2>
        <p className="mb-5 max-w-2xl text-sm text-foreground-muted">
          Built to replace the usual routine of a Meet link in one tab and a shared drive in
          another. Everything runs in the browser — nothing to install, and no meeting to schedule.
          Study rooms need a confirmed account.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-4 w-4 text-brand" aria-hidden="true" />
                Starting or joining a room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground-muted">
              <p>
                <strong className="text-foreground">Public rooms</strong> appear in the list for
                every student — anyone can walk in.
              </p>
              <p>
                <strong className="text-foreground">Private rooms</strong> are reachable only
                through their invite link. Copy it from inside the room and share it; paste a link
                (or just the code) into the join box to get in. The link is the key, so only send it
                to people you want in the room.
              </p>
              <p>
                The room owner can close a room, which removes everyone still in it. An admin may
                also join for moderation, and everyone is shown when one is present.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MonitorUp className="h-4 w-4 text-brand" aria-hidden="true" />
                Talking and sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground-muted">
              <p>
                Camera and microphone are off until you switch them on, and text chat works whether
                or not you do.
              </p>
              <p>
                <strong className="text-foreground">One person shares their screen at a time</strong>
                , so the room can&apos;t end up with two people fighting over the view.
              </p>
              <p>
                While someone is sharing, move your cursor over the shared picture and everyone sees
                a red pointer with your name on it — the fastest way to say &quot;this line
                here&quot; without describing where you mean.
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PenLine className="h-4 w-4 text-brand" aria-hidden="true" />
                The whiteboard
              </CardTitle>
              <CardDescription>
                Separate from screen sharing — you can run both at once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground-muted">
              <p>
                Whoever opens the board holds the pen. Everyone else watches live and can ask for
                the pen; the holder grants it per person, and can hand it over completely or clear
                the board.
              </p>
              <p>
                Nothing drawn is stored. Once everyone has left the room the board is wiped — with a
                short grace period first, so reloading your tab or dropping off Wi-Fi for a moment
                doesn&apos;t cost you the working.
              </p>
              <p className="text-xs">
                A room joined on a locked-down college or hostel network may fail to connect video
                even when chat works fine. That is the network blocking peer-to-peer traffic, not
                your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-brand" aria-hidden="true" />
              Something missing?
            </CardTitle>
            <CardDescription>
              The archive is only as complete as what students send in.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to="/contribute">Contribute papers</Link>
            </Button>
            <p className="text-sm text-foreground-muted">
              Found a broken file or a paper filed under the wrong subject? Mail{" "}
              <a className="break-all font-medium text-brand hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
