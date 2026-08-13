import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye, Download, Lock } from "lucide-react";
import type { FileViewUrlDto } from "@scholarbase/shared-types";
import { subjectsApi } from "@/lib/api/academic";
import { papersApi } from "@/lib/api/papers";
import { notesApi } from "@/lib/api/notes";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentViewer } from "@/components/DocumentViewer";

type ViewerKind = "paper" | "note";

export function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { isAuthenticated } = useAuth();
  // Passed to /login so the student lands back on this subject after signing in.
  const location = useLocation();

  const [viewerDoc, setViewerDoc] = useState<FileViewUrlDto | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [viewerTarget, setViewerTarget] = useState<{ kind: ViewerKind; id: string } | null>(null);

  const openViewer = async (kind: ViewerKind, id: string) => {
    setViewerTarget({ kind, id });
    setViewerDoc(null);
    setViewerError(null);
    setViewerLoading(true);
    try {
      const api = kind === "paper" ? papersApi : notesApi;
      setViewerDoc(await api.getViewUrl(id));
    } catch {
      setViewerError("Could not open this file. Try downloading it instead.");
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    setViewerDoc(null);
    setViewerError(null);
    setViewerLoading(false);
    setViewerTarget(null);
  };

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => subjectsApi.get(subjectId!),
    enabled: Boolean(subjectId),
  });

  const { data: papers } = useQuery({
    queryKey: ["papers", subjectId],
    queryFn: () => papersApi.listBySubject(subjectId!),
    enabled: Boolean(subjectId),
  });

  const { data: notes } = useQuery({
    queryKey: ["notes", subjectId],
    queryFn: () => notesApi.listBySubject(subjectId!),
    enabled: Boolean(subjectId),
  });

  const downloadPaper = async (id: string) => {
    const { url } = await papersApi.getDownloadUrl(id);
    window.location.href = url;
  };

  const downloadNote = async (id: string) => {
    const { url } = await notesApi.getDownloadUrl(id);
    window.location.href = url;
  };

  return (
    <div>
      <h1 className="mb-1 text-3xl">{subject?.name ?? "Subject"}</h1>
      <p className="mb-8 text-foreground-muted">{subject?.code}</p>

      <Tabs defaultValue="papers">
        <TabsList>
          <TabsTrigger value="papers">Question Papers</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="papers">
          {papers?.length === 0 && (
            <p className="text-foreground-muted">No question papers uploaded for this subject yet.</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {papers?.map((paper) => (
              <Card key={paper.id} interactive className="group relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2 text-base">
                    <span className="transition-colors group-hover:text-brand">{paper.fileName}</span>
                    {/* Small persistent marker so a locked paper still reads as
                        locked without hovering — the overlay below is the
                        flourish, not the only signal. */}
                    {paper.locked && (
                      <Lock
                        className="mt-0.5 h-4 w-4 shrink-0 text-foreground-subtle"
                        aria-hidden="true"
                      />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge>{paper.academicYear}</Badge>
                    {/* The one paper a signed-out visitor may open, so the
                        offer is visible rather than something they discover by
                        clicking a locked one. */}
                    {!isAuthenticated && !paper.locked && <Badge variant="success">Free preview</Badge>}
                  </div>
                  {!paper.locked && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => void openViewer("paper", paper.id)}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void downloadPaper(paper.id)}
                        aria-label={`Download ${paper.fileName}`}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardContent>

                {/* Hover reveal for locked papers.
                    Covers the whole card so a tap anywhere works on phones,
                    where there is no hover at all — without that, a touch user
                    would have no way to reach the login prompt. It is a real
                    <Link>, so it is keyboard reachable and the overlay is
                    revealed on focus as well as hover. */}
                {paper.locked && (
                  <Link
                    to="/login"
                    state={{ from: location }}
                    aria-label={`Log in to view ${paper.fileName}`}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface/90 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand group-hover:opacity-100"
                  >
                    <Lock className="h-5 w-5 text-brand" aria-hidden="true" />
                    <span className="text-sm font-semibold text-foreground">
                      Log in to view all papers
                    </span>
                    <span className="text-xs text-foreground-muted">
                      One paper per semester is free
                    </span>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          {notes?.length === 0 && (
            <p className="text-foreground-muted">No notes uploaded for this subject yet.</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {notes?.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle className="text-base">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="muted">{note.unitTopic ?? "General"}</Badge>
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      {/* Viewing a note hands out the same object as downloading
                          it, so both sit behind the same login gate. */}
                      <Button size="sm" onClick={() => void openViewer("note", note.id)}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void downloadNote(note.id)}
                        aria-label={`Download ${note.title}`}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/login">Log in to view</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <DocumentViewer
        doc={viewerDoc}
        isLoading={viewerLoading}
        error={viewerError}
        onClose={closeViewer}
        onDownload={
          viewerTarget
            ? () =>
                void (viewerTarget.kind === "paper"
                  ? downloadPaper(viewerTarget.id)
                  : downloadNote(viewerTarget.id))
            : undefined
        }
      />
    </div>
  );
}
