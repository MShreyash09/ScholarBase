import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { subjectsApi } from "@/lib/api/academic";
import { papersApi } from "@/lib/api/papers";
import { notesApi } from "@/lib/api/notes";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { isAuthenticated } = useAuth();

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
      <p className="mb-8 text-neutral-500">{subject?.code}</p>

      <Tabs defaultValue="papers">
        <TabsList>
          <TabsTrigger value="papers">Question Papers</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="papers">
          {papers?.length === 0 && (
            <p className="text-neutral-500">No question papers uploaded for this subject yet.</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {papers?.map((paper) => (
              <Card key={paper.id}>
                <CardHeader>
                  <CardTitle className="text-base">{paper.fileName}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge>{paper.academicYear}</Badge>
                  <Button size="sm" onClick={() => downloadPaper(paper.id)}>
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          {notes?.length === 0 && (
            <p className="text-neutral-500">No notes uploaded for this subject yet.</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {notes?.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle className="text-base">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="muted">{note.unitTopic ?? "General"}</Badge>
                  {isAuthenticated ? (
                    <Button size="sm" onClick={() => downloadNote(note.id)}>
                      Download
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/login">Log in to download</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
