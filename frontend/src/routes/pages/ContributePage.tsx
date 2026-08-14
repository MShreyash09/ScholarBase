import { Link } from "react-router-dom";
import { Award, Camera, Check, FileUp, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTRIBUTORS } from "@/lib/contributors";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * How students send papers in, and the wall of credit for the ones who have.
 *
 * Contributions arrive by email rather than through an upload form. That is a
 * deliberate limit, not an oversight: papers have to be checked for the right
 * subject, year and exam before they go into the archive, and an open upload
 * endpoint would mean anyone could put anything in front of juniors revising
 * from it.
 */

/** Pre-filled so a student doesn't have to work out what to tell us. */
const MAIL_SUBJECT = "ScholarBase paper contribution";
const MAIL_BODY = [
  "Name:",
  "Department:",
  "Year:",
  "Semester:",
  "Subject (name and code):",
  "Exam (Unit Test / End Term / RE-ETE):",
  "Academic year of the paper:",
  "",
  "Files attached: ",
].join("\n");

const mailtoHref =
  `mailto:${CONTACT_EMAIL}` +
  `?subject=${encodeURIComponent(MAIL_SUBJECT)}` +
  `&body=${encodeURIComponent(MAIL_BODY)}`;

export function ContributePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl">Contribute</h1>
      <p className="mb-10 max-w-2xl text-foreground-muted">
        MMCOE went autonomous in 2024-25, and the papers set since then exist almost nowhere —
        mostly on the phones of the students who sat them. Every paper you send is one a junior
        won&apos;t have to revise without. You&apos;ll be credited by name on this page.
      </p>

      <section className="mb-12">
        <h2 className="mb-5 text-2xl">What&apos;s worth sending</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question papers</CardTitle>
              <CardDescription>The main thing the archive is missing.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-foreground-muted">
              Unit Test, End Term or RE-ETE, from any year you&apos;ve sat. Papers from your own
              semester are the most useful — nobody else has them yet.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
              <CardDescription>Your own, or a teacher&apos;s handout.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-foreground-muted">
              Unit-wise notes and solved answers help most. Only send material you wrote or are
              allowed to share.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Corrections</CardTitle>
              <CardDescription>Quiet but valuable.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-foreground-muted">
              A paper filed under the wrong subject, a wrong year, a page missing, a file that
              won&apos;t open — tell us and it gets fixed.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Mail className="h-5 w-5 text-brand" aria-hidden="true" />
          How to send them
        </h2>
        <p className="mb-5 text-sm text-foreground-muted">
          By email, from your college address, so we know a real MMCOE student sent it.
        </p>

        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex gap-3">
              <FileUp className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">
                  Attach the files and tell us what they are
                </p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  Department, year, semester, subject name and code, which exam, and the academic
                  year of the paper. Without those it can&apos;t be filed, and a paper filed in the
                  wrong place is no use to anyone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Camera className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">Photos are fine — PDFs are better</p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  If you&apos;re photographing a paper, get every page, keep the whole page in
                  frame, and check the small print is readable before you send it. Any free scanner
                  app will combine the shots into one PDF.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">Everything is checked before it goes up</p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  Papers are reviewed and uploaded by hand, which is why there is no upload button
                  here. Nothing with someone&apos;s roll number, marks or personal details on it
                  will be published — crop it out, or say so and it will be cropped for you.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <Button asChild>
                <a href={mailtoHref}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Email your papers
                </a>
              </Button>
              <p className="text-sm text-foreground-muted">
                Or write directly to{" "}
                <a
                  className="break-all font-medium text-brand hover:underline"
                  href={`mailto:${CONTACT_EMAIL}`}
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-2xl">
          <Award className="h-5 w-5 text-brand" aria-hidden="true" />
          How you get credited
        </h2>
        <p className="mb-5 max-w-2xl text-sm text-foreground-muted">
          Every contributor is listed below with their name, department and a tag saying what they
          gave — &quot;SEM 3 end-term papers&quot;, &quot;RE-ETE papers&quot;, &quot;DBMS
          notes&quot;. Send more, get more tags. If you&apos;d rather not be named, say so in your
          mail and your contribution goes up without your name attached.
        </p>

        {CONTRIBUTORS.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <Award className="h-6 w-6 text-brand" aria-hidden="true" />
              </div>
              <p className="font-semibold text-foreground">No contributors listed yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-foreground-muted">
                The archive is being built from scratch. Send the papers from your semester and
                yours will be the first name here.
              </p>
              <div className="mt-5">
                <Button asChild variant="outline">
                  <a href={mailtoHref}>Be the first</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CONTRIBUTORS.map((c) => (
              <Card key={`${c.name}-${c.department}`}>
                <CardHeader>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <CardDescription>
                    {c.department}
                    {c.year !== null && ` · Year ${c.year}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {c.tags.map((tag) => (
                    <Badge key={tag} variant="success">
                      <Check className="mr-1 inline h-3 w-3" aria-hidden="true" />
                      {tag}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <p className="font-semibold text-foreground">Not sure what&apos;s already here?</p>
              <p className="text-sm text-foreground-muted">
                Check your semester first — no point scanning a paper we already have.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/">Browse the archive</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/instructions">How the site works</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
