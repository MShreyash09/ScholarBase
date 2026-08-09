import { useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { yearLevelsApi, subjectsApi } from "@/lib/api/academic";
import { examTypesApi } from "@/lib/api/exam-types";
import { papersApi } from "@/lib/api/papers";
import { notesApi } from "@/lib/api/notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminStudyRooms } from "@/components/study-room/AdminStudyRooms";
import {
  SubjectCombobox,
  type SubjectComboboxHandle,
} from "@/components/admin/SubjectCombobox";

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
    () => subjectQueries.flatMap((q) => q.data ?? []),
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
  const [subjectSemester, setSubjectSemester] = useState("");
  const [subjectDepartment, setSubjectDepartment] = useState("");
  const createSubject = useMutation({
    mutationFn: () =>
      subjectsApi.create({ 
        yearLevelId: subjectYearLevelId, 
        code: subjectCode, 
        name: subjectName,
        semester: subjectSemester ? Number(subjectSemester) : undefined,
        department: subjectDepartment.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setSubjectCode("");
      setSubjectName("");
      setSubjectSemester("");
      setSubjectDepartment("");
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
  const paperSubjectRef = useRef<SubjectComboboxHandle>(null);
  const [paperExamTypeId, setPaperExamTypeId] = useState("");
  const [paperYear, setPaperYear] = useState(String(new Date().getFullYear()));
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const uploadPaper = useMutation({
    mutationFn: (subjectId: string) => {
      const form = new FormData();
      form.append("subjectId", subjectId);
      form.append("examTypeId", paperExamTypeId);
      form.append("academicYear", paperYear);
      form.append("file", paperFile!);
      return papersApi.upload(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["papers"] });
      setPaperFile(null);
      paperSubjectRef.current?.reset();
    },
  });

  const handleUploadPaper = async (e: FormEvent) => {
    e.preventDefault();
    // Resolve the typed subject to an id (creating it if new) before uploading,
    // so a subject-entry problem surfaces on the field instead of as a failed
    // upload.
    let subjectId: string;
    try {
      subjectId = await paperSubjectRef.current!.resolve();
    } catch {
      return;
    }
    uploadPaper.mutate(subjectId);
  };

  // --- Upload note ---
  const noteSubjectRef = useRef<SubjectComboboxHandle>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const uploadNote = useMutation({
    mutationFn: (subjectId: string) => {
      const form = new FormData();
      form.append("subjectId", subjectId);
      form.append("title", noteTitle);
      form.append("file", noteFile!);
      return notesApi.upload(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setNoteTitle("");
      setNoteFile(null);
      noteSubjectRef.current?.reset();
    },
  });

  const handleUploadNote = async (e: FormEvent) => {
    e.preventDefault();
    let subjectId: string;
    try {
      subjectId = await noteSubjectRef.current!.resolve();
    } catch {
      return;
    }
    uploadNote.mutate(subjectId);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl">Admin</h1>

      <Section title="Study rooms">
        <p className="mb-2 text-sm text-foreground-muted">
          Every open room, including private ones. Closing a room ends the session and removes
          everyone from it.
        </p>
        <AdminStudyRooms />
      </Section>

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
            className="h-10 rounded-lg border border-control bg-surface px-3 text-sm text-foreground"
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
            className="w-24"
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
          <Input
            className="w-24"
            type="number"
            placeholder="Sem"
            value={subjectSemester}
            onChange={(e) => setSubjectSemester(e.target.value)}
          />
          <Input
            className="w-32"
            placeholder="Department"
            value={subjectDepartment}
            onChange={(e) => setSubjectDepartment(e.target.value)}
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
        <form className="flex flex-wrap items-start gap-3" onSubmit={handleUploadPaper}>
          <div className="min-w-[16rem]">
            <SubjectCombobox ref={paperSubjectRef} subjects={allSubjects} yearLevels={yearLevels ?? []} />
          </div>
          <select
            className="h-10 rounded-lg border border-control bg-surface px-3 text-sm text-foreground"
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
          <p className="mt-2 text-sm text-danger">Upload failed — check the file and try again.</p>
        )}
      </Section>

      <Section title="Upload notes">
        <form className="flex flex-wrap items-start gap-3" onSubmit={handleUploadNote}>
          <div className="min-w-[16rem]">
            <SubjectCombobox ref={noteSubjectRef} subjects={allSubjects} yearLevels={yearLevels ?? []} />
          </div>
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
          <p className="mt-2 text-sm text-danger">Upload failed — check the file and try again.</p>
        )}
      </Section>
    </div>
  );
}
