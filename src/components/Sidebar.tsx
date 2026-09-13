import {
  LinkedinIcon,
  LinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import DataItem from "./DataItem";
import { cn } from "../utils/cn";

export default function Sidebar() {
  return (
    <aside
      className={cn(
        "bg-eerie-black-2 border-jet border rounded-xl h-fit py-16 px-6",
        "lg:sticky lg:top-[5rem]"
      )}
    >
      <div className={cn("flex", "lg:flex-col")}>
        <div
          className={cn(
            "aspect-square rounded-lg bg-gradient-to-br from-[#404040] to-[#303030] to-[97%] size-20 mr-4",
            "lg:size-32 lg:mx-auto"
          )}
        >
          <img
            src={`${import.meta.env.BASE_URL}my-avatar.png`}
            alt="A Alfa Sakan"
          />
        </div>
        <div className={cn("flex flex-col", "lg:block lg:mt-5")}>
          <p className="text-center text-white font-bold text-3xl mb-3">
            A Alfa Sakan
          </p>
          <div
            className={cn(
              "rounded-md bg-onyx text-white-1 w-fit text-sm px-4 py-1",
              "lg:mx-auto"
            )}
          >
            <span>Software Engineer</span>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-jet mx-4 my-6"></div>
      <div className="flex flex-col gap-4">
        <DataItem
          label="Email"
          value="alfasakan11@gmail.com"
          href="mailto:alfasakan11@gmail.com"
        >
          <MailIcon size={18} stroke="hsl(45, 100%, 72%)" />
        </DataItem>
        <DataItem
          label="Phone"
          value="+62 813-5791-1952"
          href="tel:+6281357911952"
        >
          <PhoneIcon size={18} stroke="hsl(45, 100%, 72%)" />
        </DataItem>
        <DataItem label="Location" value="Pekalongan, Indonesia">
          <MapPinIcon size={18} stroke="hsl(45, 100%, 72%)" />
        </DataItem>
        <DataItem
          label="LinkedIn"
          value="in/alfasakan"
          href="https://www.linkedin.com/in/alfasakan/"
          external
        >
          <LinkedinIcon size={18} stroke="hsl(45, 100%, 72%)" />
        </DataItem>
        <DataItem
          label="Fiverr"
          value="alfasakan"
          href="https://www.fiverr.com/s/bk9K39X"
          external
        >
          <LinkIcon size={18} stroke="hsl(45, 100%, 72%)" />
        </DataItem>
        <DataItem
          label="Upwork"
          value="alfasakan"
          href="https://www.upwork.com/freelancers/alfasakan"
          external
        >
          <LinkIcon size={18} stroke="hsl(45, 100%, 72%)" />
        </DataItem>
        <DataItem
          label="Fastwork"
          value="alfasakan"
          href="https://fastwork.id/byob/TdfsBaxBLg"
          external
        >
          <LinkIcon size={18} stroke="hsl(45, 100%, 72%)" />
        </DataItem>
      </div>
    </aside>
  );
}
