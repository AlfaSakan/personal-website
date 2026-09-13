import { format } from "date-fns";
import IconWrapper from "./IconWrapper";
import { cn } from "../utils/cn";
import { experienceDuration } from "../utils/date";
import { BookOpenIcon } from "lucide-react";

type Experience = {
  title: string;
  items: {
    title: string;
    company: string;
    location: string;
    startedDate: Date;
    endedDate: Date | null;
    descriptions: string[];
  }[];
};

const experiences: Experience[] = [
  {
    title: "Experience",
    items: [
      {
        company: "Oy! Indonesia",
        location: "Remote",
        endedDate: null,
        startedDate: new Date(2025, 11),
        title: "Software Engineer",
        descriptions: [
          "Designed and implemented a partition table to handle data at the scale of tens of millions of rows, improving scalability and data management efficiency",
          "Redesigned the storage flow of a core table, successfully reducing active data rows from millions to hundreds, resulting in significant infrastructure storage cost reduction",
          "Developed and maintained web applications using ReactJS, TypeScript, NodeJs (frontend) and Java (backend) in a production environment",
        ],
      },
      {
        company: "Berijalan (Freelance)",
        location: "Remote",
        endedDate: null,
        startedDate: new Date(2023, 0),
        title: "Fullstack Engineer",
        descriptions: [
          "Successfully developed microservices for a bidding application that serves over 10,000 users",
          "Through meticulous performance tuning and optimization techniques, successfully improved the performance of a Next.js application by as much as 70%",
          "Collaborated with cross-functional teams, including back-end developers and designers, to deliver efficient, high-quality, and scalable solutions.",
        ],
      },
      {
        company: "Friendsuretech",
        location: "Jakarta",
        endedDate: new Date(2025, 11),
        startedDate: new Date(2025, 5),
        title: "Fullstack Engineer",
        descriptions: [
          "Implemented RESTful APIs and integrated front-end components to improve application responsiveness and user interaction consistency across multiple devices",
          "Optimized database queries and schema designs to enhance data retrieval speed, resulting in faster load times and smoother user experiences",
        ],
      },
      {
        company: "Nomura Research Institute Indonesia",
        location: "Remote",
        endedDate: new Date(2024, 11),
        startedDate: new Date(2022, 6),
        title: "Frontend Engineer",
        descriptions: [
          "Implemented unit test and integration test with approximately 80% code coverage reduced the discovery of bugs",
          "Successfully implemented clean code, monorepo, and CI/CD, significantly optimizing development and build efficiency",
          "I was responsible for developing internal applications for a prominent Japanese retail enterprise, serving a network of over 21,000 outlets",
          "Collaborated with cross-functional teams, including back-end developers and designers, to deliver efficient, high-quality, and scalable solutions.",
        ],
      },
      {
        company: "PT Infosys Solusi Terpadu",
        location: "Yogyakarta",
        endedDate: new Date(2022, 5),
        startedDate: new Date(2021, 6),
        title: "Frontend Engineer",
        descriptions: [
          "I was engaged in a complex banking project, all accomplished within my first year of employment",
          "Contributed to the development and maintenance of a property web application that engages over 100,000 active users on a monthly basis",
          "Collaborated with cross-functional teams, including back-end developers and designers, to deliver efficient, high-quality, and scalable solutions.",
        ],
      },
    ],
  },
];

export default function Resume() {
  return (
    <div className="py-10 px-8">
      <h1 className="text-3xl font-bold">Resume</h1>
      <div className="h-1.5 w-10 rounded-full bg-orange-yellow-crayola my-5"></div>

      <div>
        {experiences.map((exp) => (
          <div key={exp.title} className="mb-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <IconWrapper>
                  <BookOpenIcon size={20} />
                </IconWrapper>
                <div className="h-4 w-[1px] bg-white"></div>
              </div>
              <div className="flex items-center h-10">
                <h3 className="text-2xl font-bold">{exp.title}</h3>
              </div>
            </div>
            <div>
              {exp.items.map((item, itemIndex) => (
                <div key={item.company}>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center min-w-[44px]">
                      <div className="h-1.5 w-[1px] bg-white"></div>
                      <div className="p-1 rounded-full bg-jet">
                        <div className="bg-orange-yellow-crayola rounded-full size-2.5"></div>
                      </div>
                      <div
                        className={cn(
                          "h-full w-[1px] bg-white",
                          itemIndex === exp.items.length - 1 && "hidden"
                        )}
                      ></div>
                    </div>
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p>
                        {item.company} · {item.location}
                      </p>
                      <p className="text-orange-yellow-crayola">
                        {format(item.startedDate, "MMM yyyy")} -{" "}
                        {!item.endedDate
                          ? "Present"
                          : format(item.endedDate, "MMM yyyy")}{" "}
                        <span>
                          (
                          {experienceDuration(
                            item.endedDate || new Date(),
                            item.startedDate
                          )}
                          )
                        </span>
                      </p>
                      <ul className="list-disc list pl-4 mb-4 marker:text-orange-yellow-crayola text-sm">
                        {item.descriptions.map((desc) => (
                          <li key={desc}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
