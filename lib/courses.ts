export type Course = {
  id: string;
  slug: string;
  title: string;
  category: string;
  cat: string;
  catLabel: string;
  duration: string;
  modules: number;
  status: string;
  students: number;
  price: number;
  description: string;
  moduleList: string[];
};

import coursesData from "@/data/courses.json";

export function getAllCourses(): Course[] {
  return coursesData as Course[];
}

export function getCourseBySlug(slug: string): Course | undefined {
  return (coursesData as Course[]).find((c) => c.slug === slug);
}

export function money(n: number): string {
  return n === 0 ? "Gratis" : `$${n.toFixed(2)}`;
}