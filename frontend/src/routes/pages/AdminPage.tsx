import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { yearLevelsApi, subjectsApi } from "@/lib/api/academic";
import { examTypesApi } from "@/lib/api/exam-types";
import { papersApi } from "@/lib/api/papers";
import { notesApi } from "@/lib/api/notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AdminPage() {
  const queryClient = useQueryClient();
  const { data: yearLevels } = useQuery({ queryKey: ["year-levels"], queryFn: yearLevelsApi.list });
  const { data: examTypes } = useQuery({ queryKey: ["exam-types"], queryFn: examTypesApi.list });

  const subjectQueries = useQueries({
    queries: (yearLevels ?? []).map((y) => ({
      queryKey: ["subjects", y.id],
      queryFn: () => subjectsApi.listByYear(y.id),
    })),
  });
  const allSubjects = useMemo(
    () =>
      subjectQueries
        .flatMap((q) => q.data ?? [])
        .map((s) => ({ id: s.id, label: `${s.code} — ${s.name}` })),
    [subjectQueries],
  );

  // --- Year level ---
  const [yearNumber, setYearNumber] = useState("1");
  const [yearLabel, setYearLabel] = useState("");
  const createYearLevel = useMutation({
    mutationFn: () => yearLevelsApi.create({ yearNumber: Number(yearNumber), label: yearLabel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["year-levels"] });
      setYearLabel("");
    },
  });

  // --- Subject ---
  const [subjectYearLevelId, setSubjectYearLevelId] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const createSubject = useMutation({
    mutationFn: () =>
      subjectsApi.create({ yearLevelId: subjectYearLevelId, code: subjectCode, name: subjectName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setSubjectCode("");
      setSubjectName("");
    },
  });

  // --- Exam type ---
  const [examTypeName, setExamTypeName] = useState("");
  const createExamType = useMutation({
    mutationFn: () => examTypesApi.create({ name: examTypeName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-types"] });
      setExamTypeName("");
    },
  });

  // --- Upload paper ---
  const [paperSubjectId, setPaperSubjectId] = useState("");
  const [paperExamTypeId, setPaperExamTypeId] = useState("");
  const [paperYear, setPaperYear] = useState(String(new Date().getFullYear()));
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const uploadPaper = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("subjectId", paperSubjectId);
      form.append("examTypeId", paperExamTypeId);
      form.append("academicYear", paperYear);
      form.append("file", paperFile!);
      return papersApi.upload(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["papers"] });
      setPaperFile(null);
    },
  });

  // --- Upload note ---
  const [noteSubjectId, setNoteSubjectId] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const uploadNote = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("subjectId", noteSubjectId);
      form.append("title", noteTitle);
      form.append("file", noteFile!);
      return notesApi.upload(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setNoteTitle("");
      setNoteFile(null);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl">Admin</h1>

      <Section title="Add year level">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            createYearLevel.mutate();
          }}
        >
          <Input
            className="w-24"
            type="number"
            min={1}
            max={4}
            value={yearNumber}
            onChange={(e) => setYearNumber(e.target.value)}
          />
          <Input
            placeholder="Label, e.g. First Year"
            value={yearLabel}
            onChange={(e) => setYearLabel(e.target.value)}
            required
          />
          <Button type="submit" disabled={createYearLevel.isPending}>
            Add
          </Button>
        </form>
      </Section>

      <Section title="Add subject">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            createSubject.mutate();
          }}
        >
          <select
            className="h-10 rounded-lg border border-muted px-3 text-sm"
            value={subjectYearLevelId}
            onChange={(e) => setSubjectYearLevelId(e.target.value)}
            required
          >
            <option value="">Year level</option>
            {yearLevels?.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </select>
          <Input
            placeholder="Code, e.g. CS201"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            required
          />
          <Input
            placeholder="Name, e.g. Data Structures"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />
          <Button type="submit" disabled={createSubject.isPending}>
            Add
          </Button>
        </form>
      </Section>

      <Section title="Add exam type">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            createExamType.mutate();
          }}
        >
          <Input
            placeholder="e.g. End Semester"
            value={examTypeName}
            onChange={(e) => setExamTypeName(e.target.value)}
            required
          />
          <Button type="submit" disabled={createExamType.isPending}>
            Add
          </Button>
        </form>
      </Section>

      <Section title="Upload question paper">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            uploadPaper.mutate();
          }}
        >
          <select
            className="h-10 rounded-lg border border-muted px-3 text-sm"
            value={paperSubjectId}
            onChange={(e) => setPaperSubjectId(e.target.value)}
            required
          >
            <option value="">Subject</option>
            {allSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-muted px-3 text-sm"
            value={paperExamTypeId}
            onChange={(e) => setPaperExamTypeId(e.target.value)}
            required
          >
            <option value="">Exam type</option>
            {examTypes?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Input
            className="w-28"
            type="number"
            value={paperYear}
            onChange={(e) => setPaperYear(e.target.value)}
            required
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPaperFile(e.target.files?.[0] ?? null)}
            required
          />
          <Button type="submit" disabled={uploadPaper.isPending || !paperFile}>
            Upload
          </Button>
        </form>
        {uploadPaper.isError && (
          <p className="mt-2 text-sm text-red-600">Upload failed — check the file and try again.</p>
        )}
      </Section>

      <Section title="Upload notes">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            uploadNote.mutate();
          }}
        >
          <select
            className="h-10 rounded-lg border border-muted px-3 text-sm"
            value={noteSubjectId}
            onChange={(e) => setNoteSubjectId(e.target.value)}
            required
          >
            <option value="">Subject</option>
            {allSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <Input
            placeholder="Title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            required
          />
          <input type="file" onChange={(e) => setNoteFile(e.target.files?.[0] ?? null)} required />
          <Button type="submit" disabled={uploadNote.isPending || !noteFile}>
            Upload
          </Button>
        </form>
        {uploadNote.isError && (
          <p className="mt-2 text-sm text-red-600">Upload failed — check the file and try again.</p>
        )}
      </Section>
    </div>
  );
}
