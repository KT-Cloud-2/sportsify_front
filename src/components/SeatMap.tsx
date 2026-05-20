// src/components/SeatMap.tsx
import { GameSeatListResponseDto } from '../types/api'
import { C } from '../styles/tokens'

interface SeatMapProps {
    seats: GameSeatListResponseDto[]
    selectedSeatIds: number[]
    maxSelectable: number
    onSeatToggle: (seat: GameSeatListResponseDto) => void
}

export function SeatMap({ seats, selectedSeatIds, maxSelectable, onSeatToggle }: SeatMapProps) {
    const sections = [...new Set(seats.map((s) => s.section))]

    return (
        <div>
            {/* 범례 */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.fg3 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: C.teal, border: `1px solid ${C.teal}` }} />
                    선택됨
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.fg3 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: C.elevated, border: `1px solid ${C.border}` }} />
                    선택 가능
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.fg3 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: C.border }} />
                    예약불가
                </div>
            </div>

            {/* 스테이지 표시 */}
            <div style={{
                textAlign: 'center', margin: '0 auto 24px', padding: '8px 0',
                background: C.elevated, borderRadius: 8, fontSize: 11, color: C.fg3,
                maxWidth: 300, fontWeight: 600, letterSpacing: 2,
            }}>
                STAGE
            </div>

            {/* 좌석 배치 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {sections.map((section) => {
                    const sectionSeats = seats.filter((s) => s.section === section)
                    const rows = [...new Set(sectionSeats.map((s) => s.rowNumber))].sort()

                    return (
                        <div key={section}>
                            <div style={{
                                fontSize: 13, fontWeight: 700, color: C.fg2, marginBottom: 12,
                                paddingBottom: 8, borderBottom: `1px solid ${C.border}`,
                            }}>
                                {section}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {rows.map((row) => {
                                    const rowSeats = sectionSeats
                                        .filter((s) => s.rowNumber === row)
                                        .sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber))

                                    return (
                                        <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {/* 열 라벨 */}
                                            <div style={{
                                                width: 24, fontSize: 10, fontWeight: 700, color: C.fg4,
                                                textAlign: 'center', flexShrink: 0,
                                            }}>
                                                {row}
                                            </div>
                                            {/* 좌석들 */}
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {rowSeats.map((seat) => {
                                                    const isSelected = selectedSeatIds.includes(seat.seatId)
                                                    const isAvailable = seat.status === 'AVAILABLE'
                                                    const isFull = selectedSeatIds.length >= maxSelectable && !isSelected

                                                    return (
                                                        <button
                                                            key={seat.seatId}
                                                            disabled={!isAvailable || isFull}
                                                            onClick={() => onSeatToggle(seat)}
                                                            title={
                                                                !isAvailable
                                                                    ? `${seat.status === 'SOLD' ? '판매완료' : '예약됨'}`
                                                                    : isFull
                                                                        ? `최대 ${maxSelectable}석까지 선택 가능`
                                                                        : `${seat.grade} · ${row}열 ${seat.seatNumber}번 · ${(seat.price ?? 0).toLocaleString()}원`
                                                            }
                                                            style={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 6,
                                                                fontSize: 10,
                                                                fontWeight: 600,
                                                                background: isSelected
                                                                    ? C.teal
                                                                    : isAvailable
                                                                        ? C.elevated
                                                                        : C.border,
                                                                color: isSelected
                                                                    ? C.deep
                                                                    : isAvailable
                                                                        ? C.fg2
                                                                        : C.fg4,
                                                                border: `1px solid ${isSelected ? C.teal : C.border}`,
                                                                cursor: !isAvailable || isFull ? 'not-allowed' : 'pointer',
                                                                opacity: isFull && isAvailable ? 0.5 : 1,
                                                                transition: 'all 0.15s ease',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            {seat.seatNumber}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}