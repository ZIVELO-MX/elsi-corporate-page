import { siteConfig } from "@/lib/site-config";

type AboutContent = {
  contentStatus: "fixture" | "verified";
  updatedAt?: string;
  title: string;
  introduction: string;
  journeyTitle: string;
  journeyIntroduction: string;
  timeline: readonly {
    marker: string;
    title: string;
    description: string;
  }[];
  principlesTitle: string;
  principles: readonly {
    title: string;
    text: string;
  }[];
};

const defineAboutContent = (content: AboutContent): AboutContent => content;

export const aboutContent = defineAboutContent({
  contentStatus: "fixture",
  title: "De Bee Blue a ELSI.",
  introduction:
    "ELSI nace de un movimiento universitario que conectó educación ambiental, comunidad y acción.",
  journeyTitle: "Una iniciativa que amplió su alcance",
  journeyIntroduction:
    "Cuatro momentos describen la transición del proyecto estudiantil hacia la propuesta actual de ELSI.",
  timeline: [
    {
      marker: "2019",
      title: "Bee Blue",
      description:
        "Nace la iniciativa estudiantil enfocada en educación y concientización ambiental.",
    },
    {
      marker: "UG",
      title: "Comunidad universitaria",
      description:
        "El movimiento crea actividades de aprendizaje ambiental en Guanajuato.",
    },
    {
      marker: "Aula",
      title: "Experiencias formativas",
      description:
        "Conferencias, talleres y actividades acercan el aprendizaje a la práctica.",
    },
    {
      marker: "ELSI",
      title: "Evolución del proyecto",
      description:
        "La iniciativa amplía su trabajo hacia capacitación y soluciones ambientales.",
    },
  ],
  principlesTitle: "Principios para orientar cada proyecto",
  principles: [
    {
      title: "Misión",
      text: "Compartir conocimiento desde los valores éticos y pedagógicos que requiere esta labor, siempre apegados a nuestra responsabilidad como seres humanos de cuidar nuestro planeta.",
    },
    {
      title: "Visión",
      text: "Ser la institución líder en consultoría ambiental a nivel internacional, reconocida por transformar la gestión de los recursos naturales mediante la innovación educativa y soluciones sostenibles que garanticen el bienestar del planeta.",
    },
    {
      title: "Valores",
      text: "Compromiso, innovación, cercanía, integridad y pasión por el impacto real.",
    },
  ],
});

export function isAboutContentVerified() {
  return aboutContent.contentStatus === "verified";
}

export function getPublicAboutContent(): AboutContent | undefined {
  return siteConfig.previewMode || isAboutContentVerified()
    ? aboutContent
    : undefined;
}
