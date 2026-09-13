import { LinkIcon } from "lucide-react";
import { cn } from "../utils/cn";
import { useState } from "react";

type Project = {
  title: string;
  href: { url: string; category: Project["category"][number] }[];
  category: ("mobile" | "web" | "all")[];
  description: string;
  image: string;
};

const projects: Project[] = [
  {
    category: ["web", "mobile"],
    description:
      "Tumbuh helps parents track their child's emotions, developmental milestones, and physical growth from ages 0-5, as a companion to the KIA health record book.",
    href: [
      { category: "web", url: "https://tumbuh.satupa.com" },
      {
        category: "mobile",
        url: "https://play.google.com/apps/testing/com.satupa.tumbuh",
      },
    ],
    title: "Tumbuh",
    image: `${import.meta.env.BASE_URL}tumbuh.png`,
  },
  {
    category: ["web", "mobile"],
    description:
      "Ujiaku is an exam-prep app for Indonesian high school students (Math, Physics, Biology, Chemistry, English) with short daily practice sessions and topic-level statistics to review.",
    href: [
      { category: "web", url: "https://ujiaku.satupa.com" },
      {
        category: "mobile",
        url: "https://play.google.com/store/apps/details?id=com.satupa.ujiaku",
      },
    ],
    title: "Ujiaku",
    image: `${import.meta.env.BASE_URL}ujiaku.png`,
  },
  {
    category: ["mobile"],
    description: "Permata Mobile X is mobile banking by PT. Bank Permata, Tbk",
    href: [
      {
        url: "https://play.google.com/store/apps/details?id=net.myinfosys.PermataMobileX&hl=id",
        category: "mobile",
      },
    ],
    title: "PermataMobileX",
    image: `${import.meta.env.BASE_URL}permata.png`,
  },
  {
    category: ["web", "mobile"],
    description:
      "Victoria Mobile is web and mobile banking by PT. Bank Victoria Internasional, Tbk",
    href: [
      {
        url: "https://play.google.com/store/search?q=victoria+mobile+banking&c=apps&hl=id",
        category: "mobile",
      },
      { category: "web", url: "https://www.victoriabank.co.id/" },
    ],
    title: "Victoria Mobile",
    image: `${import.meta.env.BASE_URL}victoria.webp`,
  },
  {
    category: ["web", "mobile"],
    description:
      "BTN Properti is 1st integrated property platform in Indonesia by PT Bank Tabungan Negara(Persero), Tbk",
    href: [
      { category: "web", url: "https://www.btnproperti.co.id/" },
      {
        category: "mobile",
        url: "https://play.google.com/store/apps/details?id=btn.properti.android&hl=id",
      },
    ],
    title: "BTN Properti",
    image: `${import.meta.env.BASE_URL}btn_properti.svg`,
  },
  {
    category: ["mobile"],
    description: "Otoransi is insurance application by Ramayana Insurance",
    href: [
      {
        category: "mobile",
        url: "https://play.google.com/store/apps/details?id=rmy.otoransi.id&hl=id",
      },
    ],
    title: "Otoransi",
    image: `${import.meta.env.BASE_URL}otoransi.png`,
  },
  {
    category: ["mobile"],
    description: "Zirang Mobile is mobile application for credit simulation",
    href: [
      {
        category: "mobile",
        url: "https://play.google.com/store/apps/details?id=com.outsystemsenterprise.prod.zirangmobile&hl=id",
      },
    ],
    title: "Zirang Mobile",
    image: `${import.meta.env.BASE_URL}zirang.webp`,
  },
  {
    category: ["mobile"],
    description:
      "Accbid is an innovative auction marketplace where anyone can experience live bidding anytime from anywhere.",
    href: [
      {
        category: "mobile",
        url: "https://play.google.com/store/apps/details?id=com.outsystemsenterprise.prod8.ACCBid&hl=en",
      },
    ],
    title: "accbid",
    image: `${import.meta.env.BASE_URL}accbid.webp`,
  },
];

const categories: { label: string; value: Project["category"][number] }[] = [
  { label: "All", value: "all" },
  { label: "Web Development", value: "web" },
  { label: "Mobile Development", value: "mobile" },
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="p-0.5 rounded-xl bg-gradient-to-br to-white/0 from-[#404040] to-50% from-0%">
      <div className="flex flex-col h-full bg-eerie-black-1 py-3 px-3 rounded-xl">
        <div className="flex items-start h-full gap-3">
          <div className="bg-white rounded-md aspect-square size-10">
            <img
              src={project.image || ""}
              alt={project.title}
              className="size-full object-contain rounded-md"
            />
          </div>
          <div className="text-sm">
            <p className="text-white-2 font-bold">{project.title}</p>
            <p className="text-sm text-light-gray">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {project.href.map((item) => (
            <div
              key={item.url}
              className="border-jet border rounded-full text-sm px-3 py-0.5 flex items-center justify-center"
            >
              <a href={item.url}>
                {item.category} <LinkIcon size={12} className="inline" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [selectedCategory, setSelectedCategory] =
    useState<Project["category"][number]>("all");

  return (
    <div className="py-10 px-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      <div className="h-1.5 w-10 rounded-full bg-orange-yellow-crayola my-5"></div>

      <div className="flex items-center gap-4 mb-5 overflow-x-auto">
        {categories.map((item) => (
          <button
            key={item.label}
            className={cn(
              "cursor-pointer transition-colors shrink-0",
              item.value !== selectedCategory
                ? "hover:text-light-gray-70"
                : "text-orange-yellow-crayola"
            )}
            onClick={() => setSelectedCategory(item.value)}
          >
            <p>{item.label}</p>
          </button>
        ))}
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          "lg:grid-cols-3",
          "md:grid-cols-2"
        )}
      >
        {projects
          .filter((project) =>
            selectedCategory === "all"
              ? true
              : project.category.includes(selectedCategory)
          )
          .map((project) => (
            <ProjectCard project={project} key={project.title} />
          ))}
      </div>
    </div>
  );
}
