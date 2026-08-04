export interface DepartmentDef {
  code: string;
  label: string;
}

// Fixed set of departments shown on the landing page. `code` is what gets
// stored in Subject.department and used in routes/query params.
export const DEPARTMENTS: DepartmentDef[] = [
  { code: "IT", label: "IT" },
  { code: "CS", label: "CS" },
  { code: "AIDS", label: "AI & DS" },
  { code: "ENTC", label: "ENTC" },
  { code: "MECH", label: "MECH" },
  { code: "ELEC", label: "ELEC" },
];
