import { useEffect, useState } from "react";

export function NameForm({ initial }: { initial: string }) {
  const [name, setName] = useState(initial);

  useEffect(() => {
    document.title = name;
  }, [name]);

  return (
    <form>
      <label htmlFor="name">Imię</label>
      <input
        id="name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
      />
      <ul>
        {[name].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </form>
  );
}
