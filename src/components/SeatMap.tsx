import { useState } from 'react'
import { GameSeatListResponseDto } from '../types/api'
import { Btn } from './Btn'
import { C } from '../styles/tokens'

interface SeatMapProps {
  seats: GameSeatListResponseDto[]
  onConfirm: (seat: GameSeatListResponseDto) => void
}

export function SeatMap({ seats, onConfirm }: SeatMapProps) {
  const [selected, setSelected] = useState<GameSeatListResponseDto | null>(null)

  const grades = [...new Set(seats.map((s) => s.grade))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {grades.map((grade) => (
        <div key={grade}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.fg3, marginBottom: 8 }}>{grade}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {seats.filter((s) => s.grade === grade).map((seat) => {
              const available = seat.status === 'AVAILABLE'
              const isSelected = selected?.seatId === seat.seatId
              return (
                <button
                  key={seat.seatId}
                  disabled={!available}
                  onClick={() => setSelected(seat)}
                  style={{
                    width: 36, height: 36, borderRadius: 6, fontSize: 10, fontWeight: 600,
                    background: isSelected ? C.teal : available ? C.elevated : C.border,
                    color: isSelected ? C.deep : available ? C.fg2 : C.fg4,
                    border: `1px solid ${isSelected ? C.teal : C.border}`,
                    cursor: available ? 'pointer' : 'not-allowed',
                  }}
                >
                  {seat.seatNumber}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selected && (
        <div style={{ background: C.card, border: `1px solid ${C.teal}`, borderRadius: 12, padding: 16 }}>
          <div style={{ color: C.fg1, marginBottom: 12 }}>
            {selected.grade} · {selected.section} · {selected.rowNumber}열 {selected.seatNumber}번
            <span style={{ float: 'right', color: C.teal, fontWeight: 700 }}>
              {selected.price.toLocaleString()}원
            </span>
          </div>
          <Btn onClick={() => onConfirm(selected)}>예매 확정</Btn>
        </div>
      )}
    </div>
  )
}
