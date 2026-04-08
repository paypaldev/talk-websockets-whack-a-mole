import { WhackAMole } from "./components/whack-a-mole/WhackAMole";

export default function Home() {
  return (
    <main
      className="flex flex-1 items-center justify-center p-4"
      style={{ background: 'linear-gradient(150deg, #001C64 0%, #003087 55%, #0070BA 100%)' }}
    >
      <WhackAMole />
    </main>
  );
}
