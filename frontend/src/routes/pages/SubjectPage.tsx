import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye, Download } from "lucide-react";
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
              <Card key={paper.id}>
                <CardHeader>
                  <CardTitle className="text-base">{paper.fileName}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <Badge>{paper.academicYear}</Badge>
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
                </CardContent>
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
