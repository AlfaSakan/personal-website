import { cn } from "../utils/cn";

function SkillCard({
  label,
  value,
  src,
}: {
  label: string;
  value: string;
  src?: string;
}) {
  return (
    <div className="p-0.5 rounded-xl bg-gradient-to-br to-white/0 from-[#404040] to-50% from-0%">
      <div className="flex items-start h-full gap-3 bg-eerie-black-1 py-7 px-6 rounded-xl ">
        <div className="rounded-md aspect-square size-10">
          <img src={src} alt={label} />
        </div>
        <div className="text-sm">
          <p className="text-white-2 font-bold text-lg">{label}</p>
          <p className="text-base text-light-gray">{value}</p>
        </div>
      </div>
    </div>
  );
}

const skills: { name: string; icon: string | null; href: string }[] = [
  {
    name: "ReactJs",
    icon: `${import.meta.env.BASE_URL}react.png`,
    href: "https://react.dev/",
  },
  {
    name: "NextJs",
    icon: `${import.meta.env.BASE_URL}nextjs.png`,
    href: "https://nextjs.org/",
  },
  {
    name: "Sveltekit",
    icon: `${import.meta.env.BASE_URL}svelte.png`,
    href: "https://svelte.dev/",
  },
  {
    name: "NodeJs",
    icon: `${import.meta.env.BASE_URL}nodejs.svg`,
    href: "https://nodejs.org/",
  },
  {
    name: "Golang",
    icon: `${import.meta.env.BASE_URL}golang.png`,
    href: "https://go.dev/",
  },
  {
    name: "Docker",
    icon: `${import.meta.env.BASE_URL}docker.webp`,
    href: "https://docker.com/",
  },
  {
    name: "Tailwind",
    icon: `${import.meta.env.BASE_URL}tailwind.svg`,
    href: "https://tailwindcss.com/",
  },
  {
    name: "Java",
    icon:  `${import.meta.env.BASE_URL}java.png`,
    href: "https://www.java.com/",
  },
  {
    name: "ExpressJs",
    icon: `${import.meta.env.BASE_URL}express.png`,
    href: "https://expressjs.com/",
  },
  {
    name: "NestJs",
    icon: `${import.meta.env.BASE_URL}nestjs.png`,
    href: "https://nestjs.com/",
  },
  {
    name: "PostgreSQL",
    icon: `${import.meta.env.BASE_URL}PostgresSQL.png`,
    href: "https://www.postgresql.org/",
  },
  {
    name: "Redis",
    icon: `${import.meta.env.BASE_URL}redis.png`,
    href: "https://redis.io/",
  },
  {
    name: "SQLite",
    icon: `${import.meta.env.BASE_URL}sqlite.jpeg`,
    href: "https://sqlite.org/",
  },
];

export default function About() {
  return (
    <div className="py-10 px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">About Me</h1>
        <div className="h-1.5 w-10 rounded-full bg-orange-yellow-crayola my-5"></div>
        <p>
          Software Engineer with 5+ years of experience in building and
          maintaining large-scale web applications using ReactJS, TypeScript,
          NodeJs, and Java. Strong foundation in software engineering
          principles, including database design, data storage architecture,
          and infrastructure efficiency. Experienced in handling large-scale
          data systems (tens of millions of rows) and contributing to data
          structure optimization to support long-term scalability. Focused on
          delivering efficient, maintainable solutions with direct impact on
          business needs.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-2xl mb-4">What i'm doing</h3>
        <div className={cn("grid grid-cols-2 gap-6", "max-md:grid-cols-1")}>
          <SkillCard
            label="Backend Development"
            value="High-performance backend services designed for scalability and seamless user experience."
            src={`${import.meta.env.BASE_URL}backend.svg`}
          />
          <SkillCard
            label="Database & Data Architecture"
            value="Designing scalable data storage and partitioning strategies for large-scale systems."
            src={`${import.meta.env.BASE_URL}backend.svg`}
          />
          <SkillCard
            label="API Development"
            value="Building and integrating RESTful APIs for reliable, maintainable services."
            src={`${import.meta.env.BASE_URL}plugin.svg`}
          />
          <SkillCard
            label="Web development"
            value="High-quality development of sites at the professional level."
            src={`${import.meta.env.BASE_URL}web.svg`}
          />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-bold text-2xl mb-4">Skills</h3>
        <div className="flex items-center gap-4 overflow-x-auto">
          {skills.map((skill) => (
            <a
              href={skill.href || "#"}
              key={skill.name}
              className="size-40 border border-jet rounded-xl shrink-0 bg-white overflow-hidden flex items-center justify-center"
            >
              {skill.icon ? (
                <img
                  src={skill.icon}
                  alt={skill.name}
                  className="size-full"
                />
              ) : (
                <span className="text-3xl font-bold text-eerie-black-1">
                  {skill.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
