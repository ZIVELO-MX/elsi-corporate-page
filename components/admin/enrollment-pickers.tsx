"use client";

import { useId, useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { useAdminCollection, type AdminUser } from "@/lib/admin-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AdminCourseOption = {
  id: string;
  title: string;
  modality: "online" | "in_person";
  is_active: boolean;
  content_status: "fixture" | "verified";
  students: number;
};

type PickerProps<T> = {
  label: string;
  value: T | null;
  onChange: (value: T | null) => void;
};

const pickerStyle: React.CSSProperties = { border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.75rem", background: "var(--paper)" };
const resultStyle: React.CSSProperties = { width: "100%", display: "flex", alignItems: "center", gap: "0.625rem", minHeight: "2.75rem", padding: "0.5rem 0.625rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--card)", color: "var(--text)", textAlign: "left", cursor: "pointer" };

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}

function SearchField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div style={{ position: "relative" }}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <Search aria-hidden="true" size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
      <input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} className="admin-input" style={{ width: "100%", paddingLeft: "2rem" }} />
    </div>
  );
}

export function UserPicker({ label, value, onChange }: PickerProps<AdminUser>) {
  const id = useId();
  const [search, setSearch] = useState("");
  const url = useMemo(() => {
    const params = new URLSearchParams({ page: "1", pageSize: "8", sort: "full_name", direction: "asc", role: "student" });
    if (search.trim()) params.set("q", search.trim());
    return `/api/admin/users?${params}`;
  }, [search]);
  const collection = useAdminCollection<AdminUser>(url, "users");

  return (
    <fieldset style={pickerStyle}>
      <legend style={{ padding: "0 0.25rem", fontSize: "0.8125rem", fontWeight: 700 }}>{label}</legend>
      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
          <Avatar size="sm"><AvatarImage src={value.avatarUrl} alt="" /><AvatarFallback>{initials(value.name)}</AvatarFallback></Avatar>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 700 }}>{value.name}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", overflowWrap: "anywhere" }}>{value.email}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>Cambiar</Button>
        </div>
      ) : null}
      <SearchField id={`${id}-search`} label="Buscar alumno por nombre o correo" value={search} onChange={setSearch} />
      <p id={`${id}-status`} aria-live="polite" className="admin-cell-muted" style={{ margin: "0.5rem 0", fontSize: "0.75rem" }}>
        {collection.loading ? "Buscando alumnos…" : `${collection.pagination.total} alumno${collection.pagination.total === 1 ? "" : "s"}`}
      </p>
      {!collection.loading && collection.items.length === 0 ? <p className="admin-cell-muted" style={{ fontSize: "0.75rem" }}>Sin alumnos coincidentes.</p> : null}
      <ul aria-describedby={`${id}-status`} style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.375rem", maxHeight: "12rem", overflowY: "auto" }}>
        {collection.items.map((user) => (
          <li key={user.id}>
            <button type="button" aria-pressed={value?.id === user.id} onClick={() => onChange(user)} style={{ ...resultStyle, borderColor: value?.id === user.id ? "var(--primary)" : "var(--border)" }}>
              <Avatar size="sm"><AvatarImage src={user.avatarUrl} alt="" /><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700 }}>{user.name}</span>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", overflowWrap: "anywhere" }}>{user.email}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

export function CoursePicker({ label, value, valueId, onChange, activeOnly = false }: PickerProps<AdminCourseOption> & { activeOnly?: boolean; valueId?: string }) {
  const id = useId();
  const [search, setSearch] = useState("");
  const url = useMemo(() => {
    const params = new URLSearchParams({ page: "1", pageSize: "8", sort: "title", direction: "asc" });
    if (search.trim()) params.set("q", search.trim());
    else if (value?.id ?? valueId) params.set("id", value?.id ?? valueId ?? "");
    if (activeOnly) params.set("visibility", "active");
    return `/api/admin/courses?${params}`;
  }, [activeOnly, search, value, valueId]);
  const collection = useAdminCollection<AdminCourseOption>(url, "courses");
  const selected = value ?? collection.items.find((course) => course.id === valueId) ?? null;

  return (
    <fieldset style={pickerStyle}>
      <legend style={{ padding: "0 0.25rem", fontSize: "0.8125rem", fontWeight: 700 }}>{label}</legend>
      {selected ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
          <BookOpen aria-hidden="true" size={18} color="var(--primary)" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 700 }}>{selected.title}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>{selected.modality === "in_person" ? "Presencial" : "En línea"} · {selected.students} alumno{selected.students === 1 ? "" : "s"}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>Cambiar</Button>
        </div>
      ) : null}
      <SearchField id={`${id}-search`} label="Buscar curso por título" value={search} onChange={setSearch} />
      <p id={`${id}-status`} aria-live="polite" className="admin-cell-muted" style={{ margin: "0.5rem 0", fontSize: "0.75rem" }}>
        {collection.loading ? "Buscando cursos…" : `${collection.pagination.total} curso${collection.pagination.total === 1 ? "" : "s"}`}
      </p>
      {!collection.loading && collection.items.length === 0 ? <p className="admin-cell-muted" style={{ fontSize: "0.75rem" }}>Sin cursos coincidentes.</p> : null}
      <ul aria-describedby={`${id}-status`} style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.375rem", maxHeight: "12rem", overflowY: "auto" }}>
        {collection.items.map((course) => (
          <li key={course.id}>
            <button type="button" aria-pressed={selected?.id === course.id} onClick={() => onChange(course)} style={{ ...resultStyle, borderColor: selected?.id === course.id ? "var(--primary)" : "var(--border)" }}>
              <BookOpen aria-hidden="true" size={17} color="var(--primary)" />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700 }}>{course.title}</span>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>{course.modality === "in_person" ? "Presencial" : "En línea"} · {course.students} alumno{course.students === 1 ? "" : "s"}</span>
              </span>
              <Badge variant={course.is_active ? "secondary" : "outline"}>{course.is_active ? "Activo" : "Inactivo"}</Badge>
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
