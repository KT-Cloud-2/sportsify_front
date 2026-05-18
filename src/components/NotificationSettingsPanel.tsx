import { useState } from 'react'
import { C } from '../styles/tokens'
import { NotificationChannelType, NotificationSettingResponse } from '../types/api'
import {
  useNotificationSetting,
  useUpdateNotificationSetting,
  useNotificationChannels,
  useRegisterNotificationChannel,
  useDeleteNotificationChannel,
  useToggleNotificationChannel,
} from '../hooks/useNotifications'
import { Btn } from './Btn'

const CHANNEL_LABEL: Record<NotificationChannelType, string> = {
  EMAIL: '이메일',
  MQTT: 'MQTT',
  SLACK: 'Slack',
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none',
        background: on ? C.teal : C.elevated,
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

export function NotificationSettingsPanel() {
  const { data: setting, isLoading: settingLoading } = useNotificationSetting()
  const { mutate: updateSetting, isPending: updatingSetting } = useUpdateNotificationSetting()
  const { data: channels, isLoading: channelsLoading } = useNotificationChannels()
  const { mutate: registerChannel, isPending: registering } = useRegisterNotificationChannel()
  const { mutate: deleteChannel } = useDeleteNotificationChannel()
  const { mutate: toggleChannel } = useToggleNotificationChannel()

  const [newChannelType, setNewChannelType] = useState<NotificationChannelType>('EMAIL')
  const [newChannelTarget, setNewChannelTarget] = useState('')

  const handleSettingToggle = (key: keyof NotificationSettingResponse, value: boolean) => {
    if (!setting) return
    updateSetting({ ...setting, [key]: value })
  }

  const handleRegisterChannel = () => {
    const target = newChannelTarget.trim()
    if (!target) return
    registerChannel(
      { channelType: newChannelType, channelTarget: target },
      { onSuccess: () => setNewChannelTarget('') },
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 알림 종류 설정 */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.fg3, marginBottom: 16 }}>알림 종류</div>
        {settingLoading || !setting ? (
          <div style={{ color: C.fg4, fontSize: 13 }}>불러오는 중...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {([
              { key: 'ticketOpenAlert', label: '티켓 오픈 알림' },
              { key: 'gameStartAlert', label: '경기 시작 알림' },
              { key: 'paymentAlert', label: '결제 완료 알림' },
              { key: 'chatMentionAlert', label: '채팅 멘션 알림' },
            ] as const).map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: C.fg2 }}>{label}</span>
                <Toggle
                  on={setting[key]}
                  onChange={(v) => handleSettingToggle(key, v)}
                />
              </div>
            ))}
            {updatingSetting && (
              <div style={{ fontSize: 11, color: C.fg4, textAlign: 'right' }}>저장 중...</div>
            )}
          </div>
        )}
      </div>

      {/* 알림 채널 */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.fg3, marginBottom: 16 }}>알림 채널</div>

        {channelsLoading ? (
          <div style={{ color: C.fg4, fontSize: 13, marginBottom: 16 }}>불러오는 중...</div>
        ) : channels?.length === 0 ? (
          <div style={{ color: C.fg4, fontSize: 13, marginBottom: 16 }}>등록된 채널이 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {channels?.map((ch) => (
              <div key={ch.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: C.elevated, borderRadius: 10,
                border: `1px solid ${C.border}`,
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: ch.enabled ? C.teal : C.fg4,
                    background: ch.enabled ? 'rgba(93,187,160,0.12)' : C.card,
                    padding: '2px 8px', borderRadius: 9999,
                  }}>
                    {CHANNEL_LABEL[ch.channelType]}
                  </span>
                  <span style={{ fontSize: 13, color: C.fg2 }}>{ch.channelTarget}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Toggle on={ch.enabled} onChange={() => toggleChannel(ch.id)} />
                  <button
                    onClick={() => deleteChannel(ch.id)}
                    style={{
                      background: 'none', border: 'none', color: C.fg4,
                      cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 2,
                    }}
                  >×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 채널 추가 */}
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          <div style={{ fontSize: 12, color: C.fg4, fontWeight: 600 }}>채널 추가</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={newChannelType}
              onChange={(e) => setNewChannelType(e.target.value as NotificationChannelType)}
              style={{
                background: C.elevated, color: C.fg2, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              {(['EMAIL', 'SLACK', 'MQTT'] as NotificationChannelType[]).map((t) => (
                <option key={t} value={t}>{CHANNEL_LABEL[t]}</option>
              ))}
            </select>
            <input
              value={newChannelTarget}
              onChange={(e) => setNewChannelTarget(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRegisterChannel() }}
              placeholder={newChannelType === 'EMAIL' ? 'email@example.com' : '채널 주소'}
              style={{
                flex: 1, background: C.elevated, color: C.fg1,
                border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '8px 12px', fontSize: 13, fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <Btn
              variant="primary" size="sm"
              onClick={handleRegisterChannel}
              disabled={registering || !newChannelTarget.trim()}
            >
              추가
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
