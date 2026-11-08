import { useEffect, useState } from "react";

export function Title({ name }: { name: string }) {
  const [title, setTitle] = useState("");
  useEffect(() => {
    document.title = name;
  }, []);
  return <h1 onClick={() => { setTitle(name); }}>{title}</h1>;
}
