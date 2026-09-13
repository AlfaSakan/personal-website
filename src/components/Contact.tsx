import { useState } from "react";
import { cn } from "../utils/cn";

function Input({
  type,
  value,
  name,
  placeholder,
  className,
  onChangeText,
}: {
  type: "text" | "email";
  value?: string;
  placeholder?: string;
  className?: string;
  name: string;
  onChangeText?: (val: string) => void;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChangeText && onChangeText(e.currentTarget.value)}
      placeholder={placeholder}
      name={name}
      id={name}
      className={cn(
        "border rounded-lg px-4 h-[52px] w-full border-jet text-lg",
        className
      )}
    />
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
  });

  const disabled = Object.values(form).some((item) => !item);

  const handleChangeForm = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="py-10 px-8">
      <h1 className="text-3xl font-bold">Contact</h1>
      <div className="h-1.5 w-10 rounded-full bg-orange-yellow-crayola my-5"></div>

      <div>
        <h3 className="font-bold text-2xl mb-6">Contact Form</h3>
        <Input
          type="text"
          name="name"
          placeholder="Fullname"
          value={form.name}
          onChangeText={handleChangeForm("name")}
        />
        <Input
          type="text"
          name="subject"
          placeholder="Subject"
          className="my-6"
          value={form.subject}
          onChangeText={handleChangeForm("subject")}
        />
        <textarea
          name="message"
          id="message"
          placeholder="Your message"
          className="border rounded-lg px-4 w-full border-jet text-lg py-4 min-h-28"
          value={form.body}
          onChange={(e) => handleChangeForm("body")(e.currentTarget.value)}
        ></textarea>
        <div className="p-0.5 rounded-md bg-gradient-to-br to-white/0 from-[#404040] to-50% from-0% mt-4">
          {disabled ? (
            <button
              type="button"
              className="bg-eerie-black-1 rounded-md aspect-square w-full h-[52px] text-orange-yellow-crayola cursor-no-drop"
            >
              Send Message
            </button>
          ) : (
            <a
              href={`mailto:alfasakan11@gmail.com?subject=${encodeURIComponent(
                `${form.name} | ${form.subject}`
              )}&body=${encodeURIComponent(form.body)}`}
              className="bg-eerie-black-1 flex items-center justify-center rounded-md aspect-square w-full h-[52px] text-orange-yellow-crayola cursor-pointer"
            >
              Send Message
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
