import type { PropsWithChildren } from "react";

export default function IconWrapper({ children }: PropsWithChildren) {
  return (
    <div className="p-0.5 rounded-md bg-gradient-to-br to-white/0 from-[#404040] to-50% from-0%">
      <div className="bg-eerie-black-1 rounded-md aspect-square size-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
