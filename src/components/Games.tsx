import { LinkIcon } from "lucide-react";
import { cn } from "../utils/cn";

type Game = {
  title: string;
  status: "in-progress" | "completed";
  story: string;
  tech: string[];
  href?: string;
};

const games: Game[] = [
  {
    title: "Lighthouse Keeper's Last Night",
    status: "in-progress",
    story:
      "A lighthouse keeper's final shift before retirement turns into a race against a storm when the generator fails and ships need light to find their way home.",
    tech: ["Godot", "GDScript"],
  },
];

const statusLabel: Record<Game["status"], string> = {
  "in-progress": "In Progress",
  completed: "Completed",
};

function GameCard({ game }: { game: Game }) {
  return (
    <div className="p-0.5 rounded-xl bg-gradient-to-br to-white/0 from-[#404040] to-50% from-0%">
      <div className="flex flex-col h-full bg-eerie-black-1 py-3 px-3 rounded-xl">
        <div className="flex items-start justify-between gap-3">
          <p className="text-white-2 font-bold">{game.title}</p>
          <span
            className={cn(
              "shrink-0 rounded-full border border-jet px-3 py-0.5 text-xs",
              game.status === "in-progress"
                ? "text-orange-yellow-crayola"
                : "text-light-gray"
            )}
          >
            {statusLabel[game.status]}
          </span>
        </div>
        <p className="text-sm text-light-gray mt-2">{game.story}</p>
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {game.tech.map((tech) => (
            <span
              key={tech}
              className="border-jet border rounded-full text-xs px-3 py-0.5"
            >
              {tech}
            </span>
          ))}
        </div>
        {game.href && (
          <div className="flex items-center gap-3 mt-3">
            <div className="border-jet border rounded-full text-sm px-3 py-0.5 flex items-center justify-center">
              <a href={game.href} target="_blank" rel="noopener noreferrer">
                play <LinkIcon size={12} className="inline" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Games() {
  return (
    <div className="py-10 px-8">
      <h1 className="text-3xl font-bold">Games</h1>
      <div className="h-1.5 w-10 rounded-full bg-orange-yellow-crayola my-5"></div>
      <p className="text-sm text-light-gray mb-5">
        Small 2D games I build to learn game development, each built around a
        simple, self-contained story.
      </p>

      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          "lg:grid-cols-3",
          "md:grid-cols-2"
        )}
      >
        {games.map((game) => (
          <GameCard game={game} key={game.title} />
        ))}
      </div>
    </div>
  );
}
