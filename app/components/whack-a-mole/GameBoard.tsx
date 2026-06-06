import { Hole } from "./Hole";
import { NUM_HOLES } from "./useGameEngine";
import type { MoleType } from "./useGameEngine";

interface GameBoardProps {
  activeMoles: Map<number, MoleType>;
  onWhack: (index: number) => void;
}

export function GameBoard({ activeMoles, onWhack }: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-3 bg-zinc-900/40 p-5">
      {Array.from({ length: NUM_HOLES }, (_, i) => (
        <Hole
          key={i}
          moleType={activeMoles.get(i) ?? null}
          onWhack={() => onWhack(i)}
        />
      ))}
    </div>
  );
}
