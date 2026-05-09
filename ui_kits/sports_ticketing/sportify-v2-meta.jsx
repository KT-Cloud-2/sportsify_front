/* Sportify v2 — Meta: Notification Settings (TWO-LAYER), Inbox, MyPage, Admin */
const V2C = window.SportifyV2Core;
const { C: CC, Badge: B2, Btn: Bt2, Toggle: Tg2, NavBar: Nv2 } = V2C;

/* ── NOTIFICATION SETTINGS — TWO LAYERS with dependency ── */
function NotifSettingsV2({masterOff=false}) {
  // Layer 1 — global notification_settings table
  const layer1 = [
    {key:'ticket_open_alert', label:'티켓 오픈 알림',     sub:'경기 티켓 판매가 시작될 때 알림',          on:true,  icon:'🎟'},
    {key:'game_start_alert',  label:'경기 시작 알림',     sub:'경기 시작 1시간 전 알림',                  on:true,  icon:'⏰'},
    {key:'payment_alert',     label:'결제 완료 알림',     sub:'결제 확인 및 환불 처리 알림',              on:true,  icon:'💳'},
    {key:'chat_mention_alert',label:'채팅 @멘션 알림',    sub:'채팅에서 나를 언급했을 때 알림',           on:!masterOff, icon:'💬', master:true},
  ];
  // Layer 2 — per chat room: chat_participants.notification_enabled
  const rooms = [
    {id:'g-1',name:'KT Wiz vs LG · 06.18',type:'GAME',members:847, on:true},
    {id:'g-2',name:'KT Wiz vs 두산 · 06.15',type:'GAME',members:412,on:true},
    {id:'t-1',name:'KT Wiz 팬방',type:'TEAM',members:5238,on:false},
    {id:'t-2',name:'수원 FC 팬방',type:'TEAM',members:1284,on:true},
    {id:'pr-1',name:'야구 직관 친구들',type:'GROUP',members:6,on:true},
    {id:'pr-2',name:'@김개발',type:'PRIVATE',members:2,on:false},
  ];
  // Layer 3 — channels
  const channels = [
    {type:'EMAIL',target:'kim.dev@sportify.com',on:true,verified:true},
    {type:'MQTT',target:'sportify/notify/u-7f3a8c',on:true,verified:true},
    {type:'SLACK',target:'hooks.slack.com/services/T0…',on:false,verified:false},
  ];

  return (
    <div style={{width:'100%',height:'100%',background:CC.dark,color:CC.fg1,display:'flex',flexDirection:'column'}}>
      <Nv2 active="mypage" />
      <div style={{flex:1,padding:'24px 40px 60px',overflow:'auto'}}>
        <div style={{fontSize:11,color:CC.fg4,marginBottom:8}}>마이페이지 · <span style={{color:CC.fg2}}>알림 설정</span></div>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:24}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.02em',marginBottom:6}}>알림 설정</h1>
            <p style={{fontSize:12,color:CC.fg3}}>전역 설정과 채팅방별 설정이 분리되어 있어요. 두 가지를 모두 켜야 알림을 받습니다.</p>
          </div>
          <button style={{padding:'7px 14px',borderRadius:8,background:CC.card,border:`1px solid ${CC.border}`,fontSize:11,color:CC.fg3,cursor:'pointer',fontFamily:'inherit'}}>모든 알림 일시 정지 (1시간)</button>
        </div>

        <div style={{maxWidth:880}}>

          {/* Section A — Layer 1 */}
          <Section
            tag="A"
            title="전체 알림 설정"
            sub="개인 알림의 마스터 스위치입니다. 여기를 끄면 해당 종류의 알림이 모든 채널에서 차단됩니다."
            binding="notification_settings (per user)"
          >
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {layer1.map(item=>(
                <div key={item.key} style={{position:'relative'}}>
                  {item.master && (
                    <div style={{position:'absolute',top:-8,left:14,padding:'2px 9px',borderRadius:9999,background:CC.warning,color:'#1a1300',fontSize:9,fontWeight:800,letterSpacing:'0.06em',zIndex:1}}>MASTER FOR SECTION B</div>
                  )}
                  <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:11,background:CC.card,border:`1px solid ${item.master?CC.warning+'77':CC.border}`,boxShadow:item.master?`0 0 0 3px ${CC.warning}11`:'none'}}>
                    <div style={{width:40,height:40,borderRadius:10,background:CC.elevated,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{item.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:14,fontWeight:700}}>{item.label}</span>
                        <span style={{fontSize:10,fontFamily:'monospace',color:CC.fg4,padding:'1px 6px',borderRadius:4,background:CC.elevated}}>{item.key}</span>
                      </div>
                      <div style={{fontSize:11,color:CC.fg3,marginTop:3}}>{item.sub}</div>
                    </div>
                    <div style={{width:42,height:24,borderRadius:9999,background:item.on?CC.teal:CC.borderSoft,position:'relative',cursor:'pointer',transition:'background 200ms'}}>
                      <div style={{position:'absolute',top:2,left:item.on?20:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 200ms',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Dependency arrow */}
          <div style={{margin:'14px 0 14px 40px',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:2,height:24,background:masterOff?CC.error+'77':CC.warning,borderRadius:2}}></div>
            <div style={{fontSize:11,color:masterOff?CC.error:CC.warning,fontStyle:'italic'}}>
              {masterOff ? '⚠ chat_mention_alert가 OFF — 아래 채팅방별 설정은 적용되지 않습니다' : '↳ chat_mention_alert가 ON일 때만 아래 채팅방별 설정이 적용됩니다'}
            </div>
          </div>

          {/* Section B — Layer 2 */}
          <Section
            tag="B"
            title="채팅방별 알림 설정"
            sub="참여한 채팅방마다 알림 수신 여부를 따로 설정할 수 있어요."
            binding="chat_participants.notification_enabled (per user × per room)"
            disabled={masterOff}
            disabledReason="채팅 @멘션 알림이 꺼져 있어 채팅방별 설정이 적용되지 않습니다."
          >
            <div style={{display:'flex',flexDirection:'column',gap:6,position:'relative'}}>
              {rooms.map(r=>(
                <div key={r.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:9,background:CC.card,border:`1px solid ${CC.border}`,opacity:masterOff?0.45:1,transition:'opacity 200ms'}}>
                  <div style={{width:34,height:34,borderRadius:8,background:CC.elevated,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{r.type==='GAME'?'⚾':r.type==='TEAM'?'🏟️':r.type==='GROUP'?'👥':'👤'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:13,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.name}</span>
                      <B2 variant={r.type==='GAME'?'red':r.type==='TEAM'?'blue':'purple'} size="sm">{r.type}</B2>
                    </div>
                    <div style={{fontSize:11,color:CC.fg4,marginTop:2}}>{r.members.toLocaleString()}명 · 알림 {r.on?'켜짐':'꺼짐'}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {masterOff && <span style={{fontSize:11,color:CC.fg4}}>🔒</span>}
                    <span style={{fontSize:18,opacity:masterOff?0.3:1}}>{r.on?'🔔':'🔕'}</span>
                    <div style={{width:38,height:22,borderRadius:9999,background:r.on?CC.teal:CC.borderSoft,position:'relative',cursor:masterOff?'not-allowed':'pointer'}}>
                      <div style={{position:'absolute',top:2,left:r.on?18:2,width:18,height:18,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Section C — Channels */}
          <div style={{marginTop:32}}>
            <Section
              tag="C"
              title="알림 수신 채널"
              sub="알림이 발송되는 외부 채널입니다. 각 채널을 개별적으로 켜고 끌 수 있어요."
              binding="notification_channels (channel_type, channel_target, is_enabled)"
            >
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {channels.map(ch=>{
                  const meta = {EMAIL:{icon:'✉️',color:CC.info},MQTT:{icon:'📡',color:CC.purple},SLACK:{icon:'💬',color:CC.warning}}[ch.type];
                  return (
                    <div key={ch.type} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:11,background:CC.card,border:`1px solid ${CC.border}`}}>
                      <div style={{width:40,height:40,borderRadius:10,background:`${meta.color}22`,border:`1px solid ${meta.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{meta.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                          <span style={{fontSize:13,fontWeight:700}}>{ch.type}</span>
                          {ch.verified ? <B2 variant="green" size="sm">✓ 인증됨</B2> : <B2 variant="yellow" size="sm">미인증</B2>}
                        </div>
                        <div style={{fontSize:11,color:CC.fg3,fontFamily:'monospace',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:380}}>{ch.target}</div>
                      </div>
                      <button style={{padding:'5px 11px',borderRadius:7,background:'transparent',border:`1px solid ${CC.border}`,color:CC.fg3,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>편집</button>
                      <div style={{width:38,height:22,borderRadius:9999,background:ch.on?CC.teal:CC.borderSoft,position:'relative',cursor:'pointer'}}>
                        <div style={{position:'absolute',top:2,left:ch.on?18:2,width:18,height:18,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}></div>
                      </div>
                    </div>
                  );
                })}
                <button style={{padding:'14px 16px',borderRadius:11,background:'transparent',border:`1.5px dashed ${CC.border}`,color:CC.fg3,fontSize:13,cursor:'pointer',fontFamily:'inherit',marginTop:4}}>+ 채널 추가 (Email · MQTT · Slack)</button>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({tag, title, sub, binding, disabled, disabledReason, children}) {
  return (
    <section style={{marginBottom:8}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:14}}>
        <div style={{width:30,height:30,borderRadius:9,background:disabled?CC.borderSoft:CC.teal,color:disabled?CC.fg4:CC.tealDeep,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,flexShrink:0,marginTop:2}}>{tag}</div>
        <div style={{flex:1}}>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:4,letterSpacing:'-0.01em'}}>{title}</h2>
          <p style={{fontSize:12,color:CC.fg3,lineHeight:1.5,marginBottom:6}}>{sub}</p>
          <div style={{fontSize:10,fontFamily:'monospace',color:CC.fg4,padding:'3px 8px',borderRadius:5,background:CC.card,border:`1px solid ${CC.borderSoft}`,display:'inline-block'}}>📦 {binding}</div>
        </div>
      </div>
      {disabled && (
        <div style={{padding:'12px 16px',background:'rgba(239,68,68,0.08)',border:`1px solid ${CC.error}55`,borderRadius:9,fontSize:12,color:CC.fg2,marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:14}}>🔒</span>
          <span><strong style={{color:CC.error}}>섹션이 비활성화되어 있어요.</strong> {disabledReason}</span>
          <button style={{marginLeft:'auto',background:CC.error,border:'none',color:'#fff',padding:'5px 12px',borderRadius:7,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>마스터 켜기</button>
        </div>
      )}
      {children}
    </section>
  );
}

/* ── NOTIFICATION INBOX (full page) ── */
function NotifInbox({empty=false}) {
  const items = [
    {type:'ticket_open',title:'KT Wiz vs LG 트윈스 티켓 판매 시작',time:'방금 전',unread:true,icon:'🎟',color:CC.teal},
    {type:'mention',title:'@이디자인님이 #KT-Wiz-팬방에서 나를 언급했어요','sub':'"@김개발 점수 어떻게 됐어요?"',time:'2분 전',unread:true,icon:'💬',color:CC.warning},
    {type:'payment',title:'결제가 완료되었어요',sub:'KT Wiz vs LG · 1루-B4, 1루-C5 · ₩52,000',time:'18시간 전',unread:false,icon:'💳',color:CC.success},
    {type:'game_start',title:'KT Wiz vs 두산 경기가 1시간 후 시작돼요',time:'어제',unread:false,icon:'⏰',color:CC.info},
    {type:'ticket_open',title:'관심 팀 KT 소닉붐 6월 경기 티켓 판매 시작',time:'2일 전',unread:false,icon:'🎟',color:CC.teal},
    {type:'mention',title:'@박운영님이 #야구-직관-친구들에서 메시지를 보냈어요',time:'3일 전',unread:false,icon:'💬',color:CC.warning},
    {type:'payment',title:'환불이 처리되었어요',sub:'KT Wiz vs SSG · ₩30,000',time:'1주일 전',unread:false,icon:'💳',color:CC.success},
  ];
  return (
    <div style={{width:'100%',height:'100%',background:CC.dark,color:CC.fg1,display:'flex',flexDirection:'column'}}>
      <Nv2 active="home" unread={2} />
      <div style={{flex:1,padding:'24px 40px',overflow:'auto'}}>
        <div style={{fontSize:11,color:CC.fg4,marginBottom:8}}>홈 · <span style={{color:CC.fg2}}>알림</span></div>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:20}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.02em',marginBottom:4}}>알림</h1>
            <div style={{fontSize:12,color:CC.fg3}}>읽지 않은 알림 <strong style={{color:CC.teal}}>2개</strong></div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Bt2 variant="ghost" size="sm">⚙ 알림 설정</Bt2>
            <Bt2 size="sm">모두 읽음 처리</Bt2>
          </div>
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:6,marginBottom:18,paddingBottom:14,borderBottom:`1px solid ${CC.border}`}}>
          {[
            {l:'전체',c:7,a:true},{l:'🎟 티켓 오픈',c:2},{l:'⏰ 경기 시작',c:1},{l:'💳 결제',c:2},{l:'💬 멘션',c:2},
          ].map(f=>(
            <span key={f.l} style={{padding:'6px 12px',borderRadius:9999,background:f.a?CC.teal:CC.card,color:f.a?CC.tealDeep:CC.fg3,border:`1px solid ${f.a?CC.teal:CC.border}`,fontSize:11,fontWeight:600,cursor:'pointer',display:'inline-flex',gap:6,alignItems:'center'}}>{f.l}<span style={{fontSize:10,opacity:0.7}}>{f.c}</span></span>
          ))}
        </div>

        {empty ? (
          <div style={{padding:'80px 20px',textAlign:'center',background:CC.card,border:`1px dashed ${CC.border}`,borderRadius:14,maxWidth:560,margin:'40px auto'}}>
            <div style={{fontSize:48,opacity:0.4,marginBottom:14}}>🔔</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>도착한 알림이 없어요</div>
            <div style={{fontSize:12,color:CC.fg3,lineHeight:1.6,marginBottom:18}}>관심 팀의 티켓이 오픈되거나<br/>채팅에서 멘션되면 여기에 표시됩니다.</div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:6,maxWidth:760}}>
            {items.map((it,i)=>(
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:14,padding:'14px 18px',background:it.unread?'rgba(93,187,160,0.05)':CC.card,border:`1px solid ${it.unread?CC.teal+'33':CC.border}`,borderRadius:11,position:'relative'}}>
                <div style={{width:38,height:38,borderRadius:9,background:`${it.color}22`,border:`1px solid ${it.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{it.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:it.unread?700:500,color:CC.fg1}}>{it.title}</span>
                    {it.unread && <span style={{width:7,height:7,borderRadius:'50%',background:CC.teal}}></span>}
                  </div>
                  {it.sub && <div style={{fontSize:11,color:CC.fg3,marginBottom:4,lineHeight:1.5}}>{it.sub}</div>}
                  <div style={{fontSize:10,color:CC.fg4}}>{it.time} · <span style={{fontFamily:'monospace'}}>{it.type}</span></div>
                </div>
                <button style={{background:'none',border:'none',color:CC.fg4,fontSize:14,cursor:'pointer'}}>⋯</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MY PAGE v2 — Profile + Tickets (with QR) + Favorite teams (drag-reorder) + Payment history + Danger zone ── */
function MyPageV2({tab='tickets'}) {
  return (
    <div style={{width:'100%',height:'100%',background:CC.dark,color:CC.fg1,display:'flex',flexDirection:'column'}}>
      <Nv2 active="mypage" />
      <div style={{flex:1,padding:'24px 40px 60px',overflow:'auto'}}>
        {/* Profile header */}
        <div style={{background:CC.card,border:`1px solid ${CC.border}`,borderRadius:14,padding:24,marginBottom:24,display:'flex',alignItems:'center',gap:20}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:`linear-gradient(135deg,${CC.teal},${CC.tealDeep})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:800,color:'#fff'}}>김</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <span style={{fontSize:20,fontWeight:800}}>김개발</span>
              <span style={{fontSize:12,color:CC.fg4,cursor:'pointer'}}>✎</span>
              <B2 variant="yellow" size="sm">🟡 KAKAO</B2>
            </div>
            <div style={{fontSize:12,color:CC.fg3,marginBottom:8}}>kim.dev@sportify.com · 가입 2024.03.18</div>
            <div style={{display:'flex',gap:14,fontSize:11,color:CC.fg4}}>
              <span>티켓 <strong style={{color:CC.fg2}}>12장</strong></span>
              <span>관심 팀 <strong style={{color:CC.fg2}}>3개</strong></span>
              <span>채팅방 <strong style={{color:CC.fg2}}>6개</strong></span>
            </div>
          </div>
          <Bt2 variant="ghost" size="sm">설정</Bt2>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:18,borderBottom:`1px solid ${CC.border}`,marginBottom:20}}>
          {[
            {id:'tickets',l:'내 티켓',c:12},{id:'teams',l:'관심 팀',c:3},{id:'payments',l:'결제 내역',c:24},{id:'activity',l:'로그인 기록'},{id:'danger',l:'계정 관리'},
          ].map(t=>(
            <span key={t.id} style={{padding:'10px 0',fontSize:13,fontWeight:tab===t.id?700:500,color:tab===t.id?CC.teal:CC.fg3,borderBottom:tab===t.id?`2px solid ${CC.teal}`:'2px solid transparent',cursor:'pointer'}}>
              {t.l}{t.c!==undefined && <span style={{marginLeft:6,fontSize:10,color:CC.fg4}}>{t.c}</span>}
            </span>
          ))}
        </div>

        {tab==='tickets' && <TicketsTab />}
        {tab==='teams' && <TeamsTab />}
        {tab==='payments' && <PaymentsTab />}
        {tab==='danger' && <DangerTab />}
      </div>
    </div>
  );
}

function TicketsTab() {
  const tickets = [
    {n:'KTS-2025-0618-7F3A', game:'KT Wiz vs LG 트윈스', when:'06.18 19:00', venue:'수원KT위즈파크', seats:'1루-B4, 1루-C5', status:'CONFIRMED'},
    {n:'KTS-2025-0624-A2C1', game:'KT 소닉붐 vs 현대모비스', when:'06.24 19:00', venue:'수원KT아레나', seats:'중앙-A12', status:'CONFIRMED'},
    {n:'KTS-2025-0530-9D4F', game:'KT Wiz vs SSG', when:'05.30 18:30', venue:'수원KT위즈파크', seats:'외야-K8, K9', status:'USED'},
    {n:'KTS-2025-0512-3B7E', game:'KT Wiz vs NC', when:'05.12 18:30', venue:'수원KT위즈파크', seats:'1루-D2', status:'CANCELLED'},
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:20}}>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {tickets.map((t,i)=>(
          <div key={i} style={{display:'flex',background:CC.card,border:`1px solid ${i===0?CC.teal+'66':CC.border}`,borderRadius:12,overflow:'hidden',cursor:'pointer'}}>
            <div style={{width:8,background:t.status==='CONFIRMED'?CC.teal:t.status==='USED'?CC.fg4:CC.error}}></div>
            <div style={{flex:1,padding:'16px 20px'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontSize:14,fontWeight:700}}>{t.game}</span>
                <B2 variant={t.status==='CONFIRMED'?'green':t.status==='USED'?'gray':'red'} size="sm">{t.status}</B2>
                {i===0 && <B2 variant="teal" size="sm">다음 경기</B2>}
              </div>
              <div style={{display:'flex',gap:18,fontSize:11,color:CC.fg3,marginBottom:6}}>
                <span>📅 {t.when}</span>
                <span>📍 {t.venue}</span>
                <span>💺 {t.seats}</span>
              </div>
              <div style={{fontSize:10,color:CC.fg4,fontFamily:'monospace'}}>ticket_number: {t.n}</div>
            </div>
            <div style={{padding:'14px 18px',display:'flex',flexDirection:'column',gap:6,alignItems:'center',borderLeft:`1px solid ${CC.border}`,background:CC.elevated}}>
              <div style={{width:50,height:50,background:'#fff',borderRadius:6,display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:0,padding:3}}>
                {Array.from({length:64}).map((_,k)=>(<div key={k} style={{background:Math.random()>0.5?'#000':'transparent'}}></div>))}
              </div>
              <span style={{fontSize:9,color:CC.fg4}}>QR</span>
            </div>
          </div>
        ))}
      </div>
      {/* QR detail panel for selected (top) */}
      <div style={{background:CC.card,border:`1px solid ${CC.border}`,borderRadius:14,padding:22,height:'fit-content',position:'sticky',top:0}}>
        <div style={{fontSize:11,color:CC.fg4,marginBottom:6,letterSpacing:'0.05em',textTransform:'uppercase'}}>입장권</div>
        <div style={{fontSize:16,fontWeight:800,marginBottom:3}}>KT Wiz vs LG 트윈스</div>
        <div style={{fontSize:11,color:CC.fg3,marginBottom:18}}>📅 06.18 19:00 · 📍 수원KT위즈파크</div>
        <div style={{padding:18,background:'#fff',borderRadius:11,marginBottom:14}}>
          <div style={{width:'100%',aspectRatio:'1',background:'#fff',display:'grid',gridTemplateColumns:'repeat(20,1fr)',gap:0}}>
            {Array.from({length:400}).map((_,k)=>(<div key={k} style={{background:Math.random()>0.55?'#000':'transparent'}}></div>))}
          </div>
        </div>
        <div style={{textAlign:'center',fontSize:11,fontFamily:'monospace',color:CC.fg2,marginBottom:14,padding:'8px 12px',background:CC.elevated,borderRadius:7}}>KTS-2025-0618-7F3A</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14,fontSize:11}}>
          <div><div style={{color:CC.fg4,marginBottom:3}}>좌석</div><div style={{fontWeight:700}}>1루-B4, 1루-C5</div></div>
          <div><div style={{color:CC.fg4,marginBottom:3}}>등급</div><div style={{fontWeight:700}}>R · TEAM1</div></div>
        </div>
        <Bt2 variant="ghost" size="sm" style={{width:'100%'}}>티켓 취소 · 환불 신청</Bt2>
      </div>
    </div>
  );
}

function TeamsTab() {
  const teams = [{n:'KT Wiz',sport:'⚾',color:CC.red,priority:1},{n:'수원 FC',sport:'⚽',color:CC.green,priority:2},{n:'KT 소닉붐',sport:'🏀',color:CC.orange,priority:3}];
  return (
    <div style={{maxWidth:680}}>
      <div style={{fontSize:11,color:CC.fg3,marginBottom:14}}>드래그하여 순서를 바꿀 수 있어요. 우선순위가 높을수록 홈에서 먼저 보입니다.</div>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
        {teams.map((t,i)=>(
          <div key={t.n} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:CC.card,border:`1px solid ${CC.border}`,borderRadius:11}}>
            <span style={{color:CC.fg4,cursor:'grab',fontSize:14}}>⋮⋮</span>
            <div style={{width:30,height:30,borderRadius:8,background:`${t.color}22`,border:`1px solid ${t.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{t.sport}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700}}>{t.n}</div>
              <div style={{fontSize:11,color:CC.fg4,marginTop:2}}>priority: {t.priority} · 다음 경기 06.{18+i*3}</div>
            </div>
            <button style={{padding:'5px 11px',borderRadius:7,border:`1px solid ${CC.border}`,background:'transparent',color:CC.fg3,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>알림 설정</button>
            <button style={{padding:'5px 11px',borderRadius:7,border:`1px solid ${CC.error}55`,background:'transparent',color:CC.error,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>제거</button>
          </div>
        ))}
        <button style={{padding:'14px 16px',borderRadius:11,background:'transparent',border:`1.5px dashed ${CC.border}`,color:CC.fg3,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>+ 관심 팀 추가</button>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const pays = [
    {when:'2025.06.10 14:23', game:'KT Wiz vs LG', amt:52000, method:'CARD', status:'COMPLETED'},
    {when:'2025.06.05 11:08', game:'KT 소닉붐 vs 현대모비스', amt:25000, method:'KAKAO_PAY', status:'COMPLETED'},
    {when:'2025.05.20 18:42', game:'KT Wiz vs SSG', amt:30000, method:'CARD', status:'REFUNDED'},
    {when:'2025.05.12 09:03', game:'KT Wiz vs NC', amt:25000, method:'TOSS_PAY', status:'CANCELLED'},
  ];
  return (
    <div style={{background:CC.card,border:`1px solid ${CC.border}`,borderRadius:14,overflow:'hidden',maxWidth:880}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:CC.elevated}}>
          {['결제일시','경기','금액','수단','상태',''].map(h=>(<th key={h} style={{padding:'12px 16px',fontSize:10,fontWeight:700,color:CC.fg4,textTransform:'uppercase',letterSpacing:'0.04em',textAlign:'left'}}>{h}</th>))}
        </tr></thead>
        <tbody>{pays.map((p,i)=>(
          <tr key={i} style={{borderTop:`1px solid ${CC.border}`}}>
            <td style={{padding:'12px 16px',fontSize:11,color:CC.fg3,fontFamily:'monospace'}}>{p.when}</td>
            <td style={{padding:'12px 16px',fontSize:13,fontWeight:600}}>{p.game}</td>
            <td style={{padding:'12px 16px',fontSize:13,fontWeight:700,color:p.status==='REFUNDED'?CC.error:CC.fg1}}>{p.status==='REFUNDED'?'-':''}₩{p.amt.toLocaleString()}</td>
            <td style={{padding:'12px 16px',fontSize:11,fontFamily:'monospace',color:CC.fg3}}>{p.method}</td>
            <td style={{padding:'12px 16px'}}><B2 variant={p.status==='COMPLETED'?'green':p.status==='REFUNDED'?'yellow':'gray'} size="sm">{p.status}</B2></td>
            <td style={{padding:'12px 16px'}}><button style={{background:'none',border:'none',color:CC.fg3,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>영수증</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function DangerTab() {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14,maxWidth:680}}>
      <div style={{background:CC.card,border:`1px solid ${CC.border}`,borderRadius:11,padding:20}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>닉네임 변경</div>
        <div style={{fontSize:11,color:CC.fg3,marginBottom:14}}>닉네임은 채팅과 응원 메시지에 표시됩니다.</div>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:1,padding:'10px 14px',background:CC.elevated,border:`1px solid ${CC.border}`,borderRadius:8,fontSize:13}}>김개발</div>
          <Bt2 variant="ghost" size="sm">변경</Bt2>
        </div>
      </div>
      <div style={{background:CC.card,border:`1px solid ${CC.border}`,borderRadius:11,padding:20}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>로그인 기록</div>
        <div style={{fontSize:11,color:CC.fg3,marginBottom:14}}>최근 5회의 로그인 시각과 IP를 확인할 수 있어요.</div>
        <div style={{fontSize:11,fontFamily:'monospace',color:CC.fg3,lineHeight:1.7}}>
          2025-06-12 14:23 · 211.34.x.x · 서울 · KAKAO ✓<br/>
          2025-06-10 09:08 · 211.34.x.x · 서울 · KAKAO ✓<br/>
          2025-06-08 19:42 · 39.118.x.x · 수원 · KAKAO ✓
        </div>
      </div>
      <div style={{background:'rgba(239,68,68,0.06)',border:`1.5px solid ${CC.error}66`,borderRadius:11,padding:20}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <span style={{fontSize:14}}>⚠️</span>
          <div style={{fontSize:14,fontWeight:700,color:CC.error}}>위험 영역 (Danger Zone)</div>
        </div>
        <div style={{fontSize:12,color:CC.fg2,lineHeight:1.6,marginBottom:16}}>계정을 탈퇴하면 보유한 모든 티켓이 환불 불가 상태로 만료되고, 채팅 기록과 결제 내역이 30일 후 영구 삭제됩니다. 이 작업은 되돌릴 수 없어요.</div>
        <div style={{display:'flex',gap:8}}>
          <Bt2 variant="danger" size="sm">계정 탈퇴</Bt2>
          <Bt2 variant="ghost" size="sm">데이터 다운로드</Bt2>
        </div>
      </div>
    </div>
  );
}

/* ── ADMIN — Game management + DLQ ── */
function AdminGameMgmt() {
  const games = [
    {id:1042, sport:'⚾', game:'KT Wiz vs LG 트윈스',     date:'06.18 19:00', stadium:'수원KT위즈파크', status:'OPEN',        seats:'142/2400', grade:'RIVAL'},
    {id:1043, sport:'⚾', game:'KT Wiz vs 두산',           date:'06.15 18:30', stadium:'수원KT위즈파크', status:'OPEN',        seats:'8/2400',   grade:'NORMAL'},
    {id:1044, sport:'⚽', game:'수원 FC vs 전북 현대',    date:'06.20 20:00', stadium:'수원월드컵경기장', status:'OPEN',        seats:'330/4200', grade:'NORMAL'},
    {id:1045, sport:'⚽', game:'수원 삼성 vs 안양 FC',    date:'06.22 16:00', stadium:'수원월드컵경기장', status:'SCHEDULED',   seats:'-',        grade:'RIVAL'},
    {id:1041, sport:'⚾', game:'KT Wiz vs SSG',             date:'05.30 18:30', stadium:'수원KT위즈파크', status:'FINISHED',    seats:'2400/2400',grade:'NORMAL'},
    {id:1040, sport:'🏀', game:'KT 소닉붐 vs 서울 SK',     date:'05.12 19:00', stadium:'수원KT아레나',   status:'CANCELLED',   seats:'180/1200', grade:'NORMAL'},
  ];
  return (
    <div style={{width:'100%',height:'100%',background:CC.dark,color:CC.fg1,display:'flex',flexDirection:'column'}}>
      {/* Admin nav */}
      <nav style={{background:'rgba(13,16,28,0.96)',borderBottom:`1px solid ${CC.border}`,display:'flex',alignItems:'center',padding:'0 24px',height:54,gap:24,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:26,height:26,borderRadius:7,background:CC.warning,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#1a1300',fontSize:12}}>S</div>
          <span style={{fontWeight:800,fontSize:14,color:CC.fg1}}>Sportify</span>
          <B2 variant="yellow" size="sm">ADMIN</B2>
        </div>
        {['경기 관리','팀/구장','좌석 관리','채팅방','DLQ 모니터','사용자'].map((it,i)=>(
          <span key={it} style={{fontSize:12,fontWeight:i===0?700:500,color:i===0?CC.warning:CC.fg3,padding:'0 2px',height:'100%',borderBottom:i===0?`2px solid ${CC.warning}`:'2px solid transparent',display:'flex',alignItems:'center'}}>{it}</span>
        ))}
        <div style={{marginLeft:'auto',display:'flex',gap:14,alignItems:'center',fontSize:11,color:CC.fg3}}>
          <span>운영자 · admin@sportify.com</span>
          <div style={{width:28,height:28,borderRadius:'50%',background:CC.warning+'22',border:`1.5px solid ${CC.warning}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:CC.warning}}>운</div>
        </div>
      </nav>

      <div style={{flex:1,padding:'24px 32px',overflow:'auto'}}>
        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[
            {l:'전체 경기',v:'124',sub:'+12 이번 달',c:CC.fg2},
            {l:'OPEN',v:'18',sub:'판매 중',c:CC.success},
            {l:'SCHEDULED',v:'34',sub:'판매 예정',c:CC.warning},
            {l:'FINISHED',v:'68',sub:'완료',c:CC.fg3},
            {l:'CANCELLED',v:'4',sub:'취소',c:CC.error},
          ].map(s=>(
            <div key={s.l} style={{background:CC.card,border:`1px solid ${CC.border}`,borderRadius:11,padding:16}}>
              <div style={{fontSize:10,color:CC.fg4,letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:6}}>{s.l}</div>
              <div style={{fontSize:24,fontWeight:800,color:s.c,letterSpacing:'-0.02em',fontFamily:'monospace'}}>{s.v}</div>
              <div style={{fontSize:10,color:CC.fg4,marginTop:3}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div>
            <h1 style={{fontSize:18,fontWeight:800,marginBottom:4}}>경기 관리</h1>
            <div style={{fontSize:11,color:CC.fg3}}>POST/PUT/DELETE /api/admin/games · PATCH /api/admin/games/{`{id}`}/status</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Bt2 variant="ghost" size="sm">상태 일괄 변경</Bt2>
            <Bt2 size="sm" style={{background:CC.warning,color:'#1a1300'}}>+ 새 경기 등록</Bt2>
          </div>
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:8,marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${CC.border}`}}>
          {['전체','SCHEDULED','OPEN','IN_PROGRESS','FINISHED','CANCELLED'].map((s,i)=>(
            <span key={s} style={{padding:'5px 11px',borderRadius:9999,background:i===0?CC.elevated:'transparent',color:i===0?CC.fg1:CC.fg3,border:`1px solid ${i===0?CC.border:'transparent'}`,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'monospace'}}>{s}</span>
          ))}
          <span style={{marginLeft:'auto',padding:'5px 11px',borderRadius:7,background:CC.card,border:`1px solid ${CC.border}`,fontSize:11,color:CC.fg3,cursor:'pointer'}}>📅 06.10 — 06.30</span>
          <div style={{padding:'5px 11px',background:CC.card,border:`1px solid ${CC.border}`,borderRadius:7,fontSize:11,color:CC.fg4}}>🔍 game_id, 팀명...</div>
        </div>

        {/* Table */}
        <div style={{background:CC.card,border:`1px solid ${CC.border}`,borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr style={{background:CC.elevated}}>
              {['ID','종목','경기','일시','경기장','status','등급','잔여/총','상태 전이',''].map(h=>(<th key={h} style={{padding:'10px 14px',fontSize:10,fontWeight:700,color:CC.fg4,textTransform:'uppercase',letterSpacing:'0.04em',textAlign:'left'}}>{h}</th>))}
            </tr></thead>
            <tbody>{games.map(g=>(
              <tr key={g.id} style={{borderTop:`1px solid ${CC.border}`}}>
                <td style={{padding:'12px 14px',fontFamily:'monospace',color:CC.fg4}}>#{g.id}</td>
                <td style={{padding:'12px 14px',fontSize:14}}>{g.sport}</td>
                <td style={{padding:'12px 14px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:12,fontWeight:600}}>{g.game}</span>
                    {g.grade==='RIVAL' && <B2 variant="rival" size="sm">RIVAL</B2>}
                  </div>
                </td>
                <td style={{padding:'12px 14px',fontFamily:'monospace',color:CC.fg3}}>{g.date}</td>
                <td style={{padding:'12px 14px',color:CC.fg3}}>{g.stadium}</td>
                <td style={{padding:'12px 14px'}}>
                  <B2 variant={g.status==='OPEN'?'green':g.status==='SCHEDULED'?'yellow':g.status==='FINISHED'?'gray':g.status==='CANCELLED'?'red':'blue'} size="sm">{g.status}</B2>
                </td>
                <td style={{padding:'12px 14px'}}>{g.grade==='RIVAL' ? <B2 variant="rival" size="sm">RIVAL</B2> : <span style={{color:CC.fg4,fontSize:11}}>NORMAL</span>}</td>
                <td style={{padding:'12px 14px',fontFamily:'monospace',color:CC.fg3}}>{g.seats}</td>
                <td style={{padding:'12px 14px'}}>
                  {g.status==='SCHEDULED' && <button style={{padding:'4px 9px',borderRadius:6,background:CC.success+'22',border:`1px solid ${CC.success}66`,color:CC.success,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>→ OPEN</button>}
                  {g.status==='OPEN' && <button style={{padding:'4px 9px',borderRadius:6,background:CC.info+'22',border:`1px solid ${CC.info}66`,color:CC.info,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>→ IN_PROGRESS</button>}
                  {g.status==='IN_PROGRESS' && <button style={{padding:'4px 9px',borderRadius:6,background:CC.fg4+'22',border:`1px solid ${CC.fg4}66`,color:CC.fg2,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>→ FINISHED</button>}
                  {(g.status==='FINISHED'||g.status==='CANCELLED') && <span style={{fontSize:10,color:CC.fg4}}>—</span>}
                </td>
                <td style={{padding:'12px 14px'}}>
                  <button style={{background:'none',border:'none',color:CC.fg3,fontSize:14,cursor:'pointer'}}>⋯</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        {/* Bulk seat creation card */}
        <div style={{marginTop:24,background:CC.card,border:`1px solid ${CC.border}`,borderRadius:12,padding:20}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>좌석 일괄 생성</div>
              <div style={{fontSize:11,color:CC.fg3,fontFamily:'monospace'}}>POST /api/admin/games/{`{gameId}`}/seats/bulk</div>
            </div>
            <Bt2 variant="ghost" size="sm">템플릿 불러오기</Bt2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
            {[
              {grade:'VIP',side:'NEUTRAL',count:120,price:50000,c:CC.teal},
              {grade:'R',side:'TEAM1',count:1200,price:25000,c:'#ff8fa3'},
              {grade:'S',side:'TEAM2',count:1200,price:21000,c:'#fdba74'},
              {grade:'A',side:'NEUTRAL',count:2400,price:15000,c:CC.fg3},
              {grade:'OUTFIELD',side:'NEUTRAL',count:1800,price:12000,c:CC.fg4},
            ].map(z=>(
              <div key={z.grade} style={{background:CC.elevated,border:`1px solid ${CC.border}`,borderRadius:9,padding:14}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                  <div style={{width:10,height:10,borderRadius:3,background:z.c}}></div>
                  <span style={{fontSize:12,fontWeight:700}}>{z.grade}</span>
                </div>
                <div style={{fontSize:10,color:CC.fg4,fontFamily:'monospace',marginBottom:6}}>{z.side}</div>
                <div style={{fontSize:18,fontWeight:800,color:CC.fg1,fontFamily:'monospace'}}>{z.count.toLocaleString()}<span style={{fontSize:10,color:CC.fg4,fontWeight:500}}> 석</span></div>
                <div style={{fontSize:11,color:CC.teal,fontWeight:700,marginTop:2}}>₩{z.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,display:'flex',gap:10,alignItems:'center'}}>
            <div style={{fontSize:11,color:CC.fg3}}>총 <strong style={{color:CC.fg1}}>6,720석</strong> 생성 예정</div>
            <button style={{marginLeft:'auto',padding:'8px 18px',borderRadius:8,background:CC.warning,border:'none',color:'#1a1300',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>일괄 생성 실행</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDLQ() {
  const events = [
    {id:'evt-9c4f', type:'TICKET_OPEN_FANOUT', target:'5238 users', err:'MQTT broker timeout', retry:3, status:'PENDING', when:'13:42:18', payload:'{"gameId":1042,"userIds":[...]}'},
    {id:'evt-7a2b', type:'GAME_START_REMINDER', target:'847 users', err:'EMAIL: SMTP 421 try again', retry:1, status:'PENDING', when:'13:38:02', payload:'{"gameId":1043,"templateId":"start-1h"}'},
    {id:'evt-3d8e', type:'PAYMENT_CONFIRM', target:'u-7f3a8c', err:'SLACK webhook 404', retry:5, status:'FAILED', when:'13:24:55', payload:'{"paymentId":"pay-9c8f-2b1e"}'},
    {id:'evt-1b5c', type:'CHAT_MENTION', target:'u-2d4a91', err:'MQTT QoS=1 ack timeout', retry:2, status:'PENDING', when:'12:58:33', payload:'{"messageId":"msg-91","mentioned":"u-2d4a91"}'},
    {id:'evt-0f9a', type:'REFUND_NOTIFY', target:'u-4b7e22', err:'EMAIL: bounced (550)', retry:5, status:'FAILED', when:'09:14:12', payload:'{"paymentId":"pay-3c2a-8f1d"}'},
  ];
  return (
    <div style={{width:'100%',height:'100%',background:CC.dark,color:CC.fg1,display:'flex',flexDirection:'column'}}>
      <nav style={{background:'rgba(13,16,28,0.96)',borderBottom:`1px solid ${CC.border}`,display:'flex',alignItems:'center',padding:'0 24px',height:54,gap:24,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:26,height:26,borderRadius:7,background:CC.warning,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#1a1300',fontSize:12}}>S</div>
          <span style={{fontWeight:800,fontSize:14,color:CC.fg1}}>Sportify</span>
          <B2 variant="yellow" size="sm">ADMIN</B2>
        </div>
        {['경기 관리','팀/구장','좌석 관리','채팅방','DLQ 모니터','사용자'].map((it,i)=>(
          <span key={it} style={{fontSize:12,fontWeight:i===4?700:500,color:i===4?CC.warning:CC.fg3,padding:'0 2px',height:'100%',borderBottom:i===4?`2px solid ${CC.warning}`:'2px solid transparent',display:'flex',alignItems:'center'}}>{it}</span>
        ))}
      </nav>

      <div style={{flex:1,padding:'24px 32px',overflow:'auto'}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {l:'PENDING',v:'14',sub:'재시도 대기',c:CC.warning,bar:0.3},
            {l:'FAILED',v:'7',sub:'재시도 한도 초과',c:CC.error,bar:0.15},
            {l:'성공률 (24h)',v:'98.7%',sub:'+0.3% vs 어제',c:CC.success,bar:0.987},
            {l:'평균 처리 시간',v:'1.4s',sub:'p95: 4.8s',c:CC.info,bar:0.6},
          ].map(s=>(
            <div key={s.l} style={{background:CC.card,border:`1px solid ${CC.border}`,borderRadius:11,padding:16}}>
              <div style={{fontSize:10,color:CC.fg4,letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:6}}>{s.l}</div>
              <div style={{fontSize:24,fontWeight:800,color:s.c,fontFamily:'monospace',letterSpacing:'-0.02em'}}>{s.v}</div>
              <div style={{fontSize:10,color:CC.fg4,marginTop:3,marginBottom:6}}>{s.sub}</div>
              <div style={{height:3,background:CC.elevated,borderRadius:9999,overflow:'hidden'}}><div style={{height:'100%',width:`${s.bar*100}%`,background:s.c}}></div></div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div>
            <h1 style={{fontSize:18,fontWeight:800,marginBottom:4}}>알림 DLQ 모니터</h1>
            <div style={{fontSize:11,color:CC.fg3}}>발송에 실패한 알림 이벤트 · POST /api/admin/notifications/dlq/retry</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Bt2 variant="ghost" size="sm">선택 항목 재시도 (3)</Bt2>
            <Bt2 size="sm" style={{background:CC.warning,color:'#1a1300'}}>전체 PENDING 재시도</Bt2>
          </div>
        </div>

        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {['전체','PENDING','FAILED'].map((s,i)=>(<span key={s} style={{padding:'5px 11px',borderRadius:9999,background:i===0?CC.elevated:'transparent',color:i===0?CC.fg1:CC.fg3,border:`1px solid ${i===0?CC.border:'transparent'}`,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'monospace'}}>{s}</span>))}
          <span style={{marginLeft:'auto',fontSize:11,color:CC.fg4}}>실시간 스트림 · 마지막 업데이트 13:43:02</span>
        </div>

        <div style={{background:CC.card,border:`1px solid ${CC.border}`,borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:CC.elevated}}>
              {['','이벤트 ID','타입','대상','에러','retry','status','시각',''].map((h,i)=>(<th key={i} style={{padding:'10px 14px',fontSize:10,fontWeight:700,color:CC.fg4,textTransform:'uppercase',letterSpacing:'0.04em',textAlign:'left'}}>{h}</th>))}
            </tr></thead>
            <tbody>{events.map(e=>(
              <tr key={e.id} style={{borderTop:`1px solid ${CC.border}`}}>
                <td style={{padding:'12px 14px'}}><input type="checkbox" /></td>
                <td style={{padding:'12px 14px',fontSize:11,fontFamily:'monospace',color:CC.teal}}>{e.id}</td>
                <td style={{padding:'12px 14px',fontSize:11,fontFamily:'monospace'}}>{e.type}</td>
                <td style={{padding:'12px 14px',fontSize:11,color:CC.fg3,fontFamily:'monospace'}}>{e.target}</td>
                <td style={{padding:'12px 14px',fontSize:11,color:CC.error,fontFamily:'monospace',maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.err}</td>
                <td style={{padding:'12px 14px',fontSize:11,fontFamily:'monospace'}}>
                  <span style={{color:e.retry>=4?CC.error:e.retry>=2?CC.warning:CC.fg2}}>{e.retry}/5</span>
                </td>
                <td style={{padding:'12px 14px'}}>
                  <B2 variant={e.status==='PENDING'?'yellow':'red'} size="sm">{e.status}</B2>
                </td>
                <td style={{padding:'12px 14px',fontSize:11,fontFamily:'monospace',color:CC.fg3}}>{e.when}</td>
                <td style={{padding:'12px 14px'}}>
                  <button style={{padding:'4px 10px',borderRadius:6,background:CC.warning,border:'none',color:'#1a1300',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>재시도</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div style={{marginTop:14,padding:'12px 16px',background:CC.card,border:`1px solid ${CC.border}`,borderRadius:9,fontSize:11,color:CC.fg3,fontFamily:'monospace',lineHeight:1.7}}>
          <div style={{color:CC.fg4,marginBottom:6}}>// 재시도 정책</div>
          <div>retry_count &lt; 5 → exponential backoff (1s, 2s, 4s, 8s, 16s)</div>
          <div>retry_count == 5 → DLQ 영구 보관 (수동 재시도만 가능)</div>
          <div>worker pool: 8 concurrent · queue: redis-stream:notifications:dlq</div>
        </div>
      </div>
    </div>
  );
}

window.SportifyV2Meta = { NotifSettingsV2, NotifInbox, MyPageV2, AdminGameMgmt, AdminDLQ };
