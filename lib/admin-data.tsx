"use client";

import { useCallback, useEffect, useState } from "react";

export type CourseModality = "online" | "presencial";

export type AdminCourse = {
  id: string;
  title: string;
  category: string;
  slug: string;
  price: number;
  status: "active" | "inactive";
  contentStatus: "fixture" | "verified";
  externalUrl: string;
  students: number;
  createdAt: string;
  synopsis: string;
  duration: string;
  targetAudience: string;
  curriculum: string;
  modality: CourseModality;
  presencialLocation: string;
  presencialDate: string;
  presencialTime: string;
  presencialInfo: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: "user" | "admin";
  enrolledCourses: number;
  createdAt: string;
};

export type EnrollmentSource = "interna" | "externa";
export type EnrollmentStatus = "en-curso" | "realizado";
export type CertificateStatus = "pendiente" | "disponible";

export type Enrollment = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
  courseId: string;
  courseName: string;
  courseModality?: CourseModality;
  enrolledAt: string;
  source: EnrollmentSource;
  status: EnrollmentStatus;
  certificateStatus?: CertificateStatus;
  certificateId?: string;
};

export type Sale = {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  amount: number;
  currency: string;
  soldAt: string;
  paymentMethod?: string;
  paymentReference?: string;
  reviewedAt?: string;
};

export type PendingPayment = Sale & { status: "pending" };

export type PageSection = {
  id: string;
  label: string;
  key: string;
  content: string;
  active: boolean;
};

export type LeadStatus = "nuevo" | "atendido";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  courseSlug?: string;
  assignedTo?: string;
  resolvedAt?: string;
  adminNotes?: string;
  createdAt: string;
  status: LeadStatus;
};

export type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string;
  quote: string;
  avatarUrl?: string;
  courseId?: string;
  consentReference?: string;
  active: boolean;
};

export type AdminPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type CollectionState<T> = {
  items: T[];
  pagination: AdminPagination;
  loading: boolean;
  error: string | null;
  requestKey: string;
};

const EMPTY_PAGINATION: AdminPagination = { page: 1, pageSize: 25, total: 0, totalPages: 0 };

export async function extractAdminError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({})) as { error?: unknown };
  return typeof body.error === "string" ? body.error : fallback;
}

/** Fetches only the collection required by the active screen. */
export function useAdminCollection<T>(url: string, legacyKey: string) {
  const [state, setState] = useState<CollectionState<T>>({
    items: [],
    pagination: EMPTY_PAGINATION,
    loading: true,
    error: null,
    requestKey: "",
  });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const requestKey = `${url}:${revision}`;

    fetch(url, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(await extractAdminError(response, "No fue posible cargar los datos."));
        return response.json() as Promise<Record<string, unknown>>;
      })
      .then((payload) => {
        const items = Array.isArray(payload.items)
          ? payload.items as T[]
          : Array.isArray(payload[legacyKey])
            ? payload[legacyKey] as T[]
            : [];
        const pagination = payload.pagination && typeof payload.pagination === "object"
          ? payload.pagination as AdminPagination
          : { ...EMPTY_PAGINATION, total: items.length, totalPages: items.length ? 1 : 0 };
        setState({ items, pagination, loading: false, error: null, requestKey });
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setState((current) => ({
          ...current,
          loading: false,
          error: cause instanceof Error ? cause.message : "No fue posible cargar los datos.",
          requestKey,
        }));
      });

    return () => controller.abort();
  }, [legacyKey, revision, url]);

  const reload = useCallback(() => setRevision((current) => current + 1), []);
  const setItems = useCallback((update: T[] | ((current: T[]) => T[])) => {
    setState((current) => ({
      ...current,
      items: typeof update === "function" ? update(current.items) : update,
    }));
  }, []);

  const requestKey = `${url}:${revision}`;
  return { ...state, loading: state.requestKey !== requestKey || state.loading, error: state.requestKey === requestKey ? state.error : null, reload, setItems };
}

export function useAdminResource<T>(url: string) {
  const [state, setState] = useState<{ data: T | null; error: string | null; requestKey: string }>({ data: null, error: null, requestKey: "" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const requestKey = `${url}:${revision}`;
    fetch(url, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(await extractAdminError(response, "No fue posible cargar los datos."));
        return response.json() as Promise<T>;
      })
      .then((payload) => setState({ data: payload, error: null, requestKey }))
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setState({ data: null, error: cause instanceof Error ? cause.message : "No fue posible cargar los datos.", requestKey });
      });
    return () => controller.abort();
  }, [revision, url]);

  const requestKey = `${url}:${revision}`;
  return { data: state.requestKey === requestKey ? state.data : null, loading: state.requestKey !== requestKey, error: state.requestKey === requestKey ? state.error : null, reload: () => setRevision((current) => current + 1) };
}
