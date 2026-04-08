import { Hole } from './Hole'
import type { MoleType } from './useGameEngine'

interface GameBoardProps {
  activeMoles: Map<number, MoleType>
  onWhack: (index: number) => void
}

export function GameBoard({ activeMoles, onWhack }: GameBoardProps) {
  return (
    <div
      className="grid grid-cols-3 gap-3 p-5"
      style={{
        background: 'linear-gradient(160deg, #003087 0%, #001C64 100%)',
        borderTop: '2px solid #0070BA',
      }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <Hole key={i} moleType={activeMoles.get(i) ?? null} onWhack={() => onWhack(i)} />
      ))}
    </div>
  )
}
