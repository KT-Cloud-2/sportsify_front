/* Sportify v2 — Core: Shell, Atoms, Home, Game Detail, Queue States */
const { useState, useEffect, useRef } = React;

const C = {
  dark:'#171A2C', card:'#1C2030', elevated:'#2A2F45', deeper:'#0E1322',
  teal:'#5DBBA0', tealDeep:'#0E2421', tealSoft:'rgba(93,187,160,0.12)',
  rival:'#E8003D', rivalSoft:'rgba(232,0,61,0.14)',
  red:'#E8003D', green:'#1B6B3A', orange:'#F97316', purple:'#7B2FBE',
  border:'#3D4464', borderSoft:'#2A2F45',
  fg1:'#FFFFFF', fg2:'#C8CCDA', fg3:'#8B93B0', fg4:'#5A6280',
  success:'#3ECF8E', warning:'#F59E0B', error:'#EF4444', info:'#3B82F6',
};

const sportMeta = {
  BASEBALL:   {label:'야구', icon:'⚾', color:C.red,    badge:'baseball'},
  FOOTBALL:   {label:'축구', icon:'⚽', color:C.green,  badge:'soccer'},
  BASKETBALL: {label:'농구', icon:'🏀', color:C.orange, badge:'basketball'},
};

const matches = [
  {id:1, sport:'BASEBALL', home:'KT Wiz', away:'두산 베어스', date:'2025.06.15',time:'18:30',venue:'수원KT위즈파크',price:25000,seats:142,status:'OPEN', grade:'NORMAL'},
  {id:2, sport:'BASEBALL', home:'KT Wiz', away:'LG 트윈스',  date:'2025.06.18',time:'19:00',venue:'수원KT위즈파크',price:30000,seats:8,  status:'OPEN', grade:'RIVAL'},
  {id:3, sport:'FOOTBALL', home:'수원 FC',away:'전북 현대', date:'2025.06.20',time:'20:00',venue:'수원월드컵경기장',price:18000,seats:330,status:'OPEN', grade:'NORMAL'},
  {id:4, sport:'FOOTBALL', home:'수원 삼성',away:'안양 FC', date:'2025.06.22',time:'16:00',venue:'수원월드컵경기장',price:22000,seats:0,  status:'SCHEDULED', grade:'RIVAL'},
  {id:5, sport:'BASKETBALL',home:'KT 소닉붐',away:'현대모비스',date:'2025.06.24',time:'19:00',venue:'수원KT아레나',  price:22000,seats:88, status:'OPEN', grade:'NORMAL'},
  {id:6, sport:'BASKETBALL',home:'KT 소닉붐',away:'서울 삼성',date:'2025.06.27',time:'18:00',venue:'수원KT아레나',  price:25000,seats:210,status:'OPEN', grade:'NORMAL'},
];

/* ── ATOMS ── */
function Badge({children, variant='teal', size='md', style={}}) {
  const v = {
    teal:{bg:'rgba(93,187,160,0.14)',color:C.teal,bd:'rgba(93,187,160,0.3)'},
    rival:{bg:'rgba(232,0,61,0.14)',color:'#ff5775',bd:'rgba(232,0,61,0.4)'},
    green:{bg:'rgba(62,207,142,0.12)',color:C.success,bd:'rgba(62,207,142,0.25)'},
    red:{bg:'rgba(239,68,68,0.12)',color:C.error,bd:'rgba(239,68,68,0.25)'},
    yellow:{bg:'rgba(245,158,11,0.12)',color:C.warning,bd:'rgba(245,158,11,0.25)'},
    blue:{bg:'rgba(59,130,246,0.12)',color:C.info,bd:'rgba(59,130,246,0.25)'},
    purple:{bg:'rgba(123,47,190,0.18)',color:'#c69aef',bd:'rgba(123,47,190,0.4)'},
    gray:{bg:C.elevated,color:C.fg3,bd:C.border},
    baseball:{bg:'rgba(232,0,61,0.14)',color:'#ff8fa3',bd:'rgba(232,0,61,0.3)'},
    soccer:{bg:'rgba(27,107,58,0.2)',color:'#4ade80',bd:'rgba(27,107,58,0.4)'},
    basketball:{bg:'rgba(249,115,22,0.14)',color:'#fdba74',bd:'rgba(249,115,22,0.3)'},
  }[variant] || {bg:C.elevated,color:C.fg3,bd:C.border};
  const s = size==='sm' ? {fontSize:10,padding:'2px 7px'} : {fontSize:11,padding:'3px 10px'};
  return <span style={{display:'inline-flex',alignItems:'center',gap:5,borderRadius:9999,fontWeight:600,background:v.bg,color:v.color,border:`1px solid ${v.bd}`,...s,...style}}>{children}</span>;
}
function Btn({children, variant='primary', size='md', style={}, onClick, disabled}) {
  const sz = {sm:{padding:'6px 14px',fontSize:12},md:{padding:'10px 20px',fontSize:13},lg:{padding:'13px 28px',fontSize:15}}[size];
  const v = {
    primary:{bg:C.teal,color:C.tealDeep,bd:'none'},
    rival:{bg:C.rival,color:'#fff',bd:'none'},
    secondary:{bg:'transparent',color:C.teal,bd:`1.5px solid ${C.teal}`},
    ghost:{bg:C.card,color:C.fg2,bd:`1px solid ${C.border}`},
    danger:{bg:'transparent',color:C.error,bd:`1px solid rgba(239,68,68,0.4)`},
  }[variant];
  return <button onClick={onClick} disabled={disabled} style={{fontFamily:'inherit',fontWeight:700,cursor:disabled?'not-allowed':'pointer',borderRadius:9999,opacity:disabled?0.5:1,...sz,background:v.bg,color:v.color,border:v.bd,...style}}>{children}</button>;
}
function Toggle({on, label, sub, onChange, disabled}) {
  return (
    <label style={{display:'flex',alignItems:'center',gap:14,padding:'12px 14px',borderRadius:10,background:disabled?'transparent':C.elevated,border:`1px solid ${disabled?C.borderSoft:C.border}`,cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.45:1,transition:'all 150ms'}}>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:C.fg1,display:'flex',alignItems:'center',gap:8}}>{label}{disabled && <span style={{fontSize:10,color:C.fg4}}>🔒</span>}</div>
        {sub && <div style={{fontSize:11,color:C.fg3,marginTop:2}}>{sub}</div>}
      </div>
      <div onClick={()=>!disabled && onChange && onChange(!on)} style={{width:38,height:22,borderRadius:9999,background:on?C.teal:C.borderSoft,position:'relative',transition:'background 200ms',flexShrink:0}}>
        <div style={{position:'absolute',top:2,left:on?18:2,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left 200ms',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}></div>
      </div>
    </label>
  );
}
function NavBar({active='home', unread=3}) {
  const items = [{id:'home',label:'홈'},{id:'mytickets',label:'내 티켓'},{id:'chat',label:'팀 채팅'},{id:'mypage',label:'마이'}];
  return (
    <nav style={{background:'rgba(23,26,44,0.96)',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',padding:'0 32px',height:60,gap:32,flexShrink:0,backdropFilter:'blur(12px)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginRight:8}}>
        <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.teal},${C.tealDeep})`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff',fontSize:14}}>S</div>
        <span style={{fontWeight:800,fontSize:17,color:C.teal,letterSpacing:'-0.02em'}}>Sportify</span>
      </div>
      {items.map(it=>(
        <span key={it.id} style={{fontSize:13,fontWeight:active===it.id?700:500,color:active===it.id?C.teal:C.fg3,padding:'0 2px',height:'100%',borderBottom:active===it.id?`2px solid ${C.teal}`:'2px solid transparent',display:'flex',alignItems:'center'}}>{it.label}</span>
      ))}
      <div style={{marginLeft:'auto',display:'flex',gap:18,alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',borderRadius:9999,background:C.elevated,border:`1px solid ${C.border}`,minWidth:200}}>
          <span style={{fontSize:13,color:C.fg4}}>🔍</span>
          <span style={{fontSize:11,color:C.fg4}}>경기·팀 검색</span>
          <span style={{marginLeft:'auto',fontSize:10,color:C.fg4,padding:'1px 5px',borderRadius:4,border:`1px solid ${C.border}`}}>⌘K</span>
        </div>
        <div style={{position:'relative'}}>
          <span style={{fontSize:18,color:C.fg2}}>🔔</span>
          {unread > 0 && <div style={{position:'absolute',top:-3,right:-3,minWidth:14,height:14,padding:'0 4px',borderRadius:9999,background:C.error,color:'#fff',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{unread}</div>}
        </div>
        <div style={{width:32,height:32,borderRadius:'50%',background:C.elevated,border:`2px solid ${C.teal}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:C.teal}}>K</div>
      </div>
    </nav>
  );
}

/* Annotation callout — used across all annotated views */
function Note({n, t, d, top, right, lineWidth=70}) {
  return (
    <div style={{position:'absolute',top,right:right-lineWidth-260,width:260,zIndex:10}}>
      <div style={{background:'rgba(93,187,160,0.1)',border:`1px solid ${C.teal}55`,borderRadius:8,padding:'10px 12px',backdropFilter:'blur(4px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
          <div style={{width:20,height:20,borderRadius:'50%',background:C.teal,color:C.tealDeep,fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{n}</div>
          <div style={{fontSize:11,fontWeight:700,color:C.fg1}}>{t}</div>
        </div>
        <div style={{fontSize:10,color:C.fg3,lineHeight:1.55,paddingLeft:28}}>{d}</div>
      </div>
    </div>
  );
}

/* ── HOME — sticky nav + favorite team strip + filter chips + game cards (rival variant) ── */
function HomeV2({skeleton, empty}) {
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <NavBar active="home" />
      <div style={{flex:1,padding:'20px 32px 32px',overflow:'auto'}}>

        {/* Hero banner — featured rival match */}
        <div style={{background:`linear-gradient(120deg,#1a0a14 0%,#3a0c1f 50%,#1a0a14 100%)`,border:`1px solid rgba(232,0,61,0.4)`,borderRadius:14,padding:'24px 32px',marginBottom:20,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 80% 50%, rgba(232,0,61,0.18), transparent 60%)'}}></div>
          <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
                <Badge variant="rival">🔥 RIVALRY MATCH</Badge>
                <span style={{fontSize:11,color:C.fg3}}>This week's headline</span>
              </div>
              <div style={{fontSize:24,fontWeight:800,marginBottom:4,letterSpacing:'-0.02em'}}>KT Wiz <span style={{color:'#ff5775'}}>vs</span> LG 트윈스</div>
              <div style={{fontSize:12,color:C.fg3,marginBottom:14}}>06.18 (수) 19:00 · 수원KT위즈파크 · 잔여 8석</div>
              <div style={{display:'flex',gap:8}}>
                <Btn variant="rival" size="md">대기열 입장 →</Btn>
                <Btn variant="ghost" size="md">상세 보기</Btn>
              </div>
            </div>
            <div style={{fontSize:84,opacity:0.18,fontWeight:900,letterSpacing:'-0.05em',color:'#ff5775'}}>VS</div>
          </div>
        </div>

        {/* Favorite team strip */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:700,color:C.fg4,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>내 관심 팀</div>
          <div style={{display:'flex',gap:8,overflow:'auto'}}>
            {[
              {n:'KT Wiz',c:C.red,s:'⚾'},{n:'수원 FC',c:C.green,s:'⚽'},{n:'KT 소닉붐',c:C.orange,s:'🏀'},
            ].map((t,i)=>(
              <div key={t.n} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:9999,background:C.card,border:`1px solid ${i===0?C.teal:C.border}`,cursor:'pointer',whiteSpace:'nowrap'}}>
                <div style={{width:20,height:20,borderRadius:5,background:`${t.c}33`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>{t.s}</div>
                <span style={{fontSize:12,fontWeight:600,color:i===0?C.teal:C.fg2}}>{t.n}</span>
                <span style={{fontSize:10,color:C.fg4}}>2경기</span>
              </div>
            ))}
            <div style={{padding:'8px 14px',borderRadius:9999,background:'transparent',border:`1px dashed ${C.border}`,fontSize:12,color:C.fg4,cursor:'pointer'}}>+ 팀 추가</div>
          </div>
        </div>

        {/* Filter row */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div style={{display:'flex',gap:6}}>
            {['전체','⚾ 야구','⚽ 축구','🏀 농구'].map((s,i)=>(
              <span key={s} style={{padding:'6px 14px',borderRadius:9999,fontSize:12,fontWeight:600,background:i===0?C.teal:C.card,color:i===0?C.tealDeep:C.fg3,border:`1px solid ${i===0?C.teal:C.border}`,cursor:'pointer'}}>{s}</span>
            ))}
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span style={{padding:'5px 12px',borderRadius:7,background:C.card,border:`1px solid ${C.border}`,fontSize:11,color:C.fg2,cursor:'pointer'}}>📅 06.15 — 06.30</span>
            <span style={{padding:'5px 12px',borderRadius:7,background:C.card,border:`1px solid ${C.border}`,fontSize:11,color:C.fg2,cursor:'pointer'}}>상태 ▾</span>
            <span style={{padding:'5px 12px',borderRadius:7,background:C.card,border:`1px solid ${C.border}`,fontSize:11,color:C.fg2,cursor:'pointer'}}>등급 ▾</span>
          </div>
        </div>

        {empty ? (
          <div style={{padding:'64px 20px',textAlign:'center',background:C.card,border:`1px dashed ${C.border}`,borderRadius:14}}>
            <div style={{fontSize:44,opacity:0.35,marginBottom:14}}>🏟️</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>예매 가능한 경기가 없어요</div>
            <div style={{fontSize:12,color:C.fg3,lineHeight:1.6,marginBottom:18}}>관심 팀을 추가하면 새 경기가 오픈될 때<br/>가장 먼저 알려드립니다.</div>
            <Btn>관심 팀 추가</Btn>
          </div>
        ) : (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {(skeleton ? Array.from({length:6}) : matches).map((m,i)=>(
                m ? <MatchCardV2 key={m.id} match={m} /> : <SkeletonCard key={i} />
              ))}
            </div>
            {!skeleton && (
              <div style={{textAlign:'center',marginTop:24}}>
                <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:9999,background:C.card,border:`1px solid ${C.border}`,fontSize:11,color:C.fg3}}>
                  <span style={{width:8,height:8,borderRadius:'50%',border:`1.5px solid ${C.teal}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}></span>
                  더 많은 경기 불러오는 중... (cursor: 2025-06-27)
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MatchCardV2({match}) {
  const sm = sportMeta[match.sport];
  const isRival = match.grade === 'RIVAL';
  const isOpen = match.status === 'OPEN';
  const isScheduled = match.status === 'SCHEDULED';
  const soldOut = match.seats === 0 && isOpen;
  const cardBg = isRival ? `linear-gradient(160deg,#1a0a14,#1c0e1c 60%,${C.card})` : C.card;
  const borderColor = isRival ? 'rgba(232,0,61,0.45)' : C.border;
  return (
    <div style={{background:cardBg,border:`1px solid ${borderColor}`,borderRadius:12,overflow:'hidden',position:'relative',transition:'all 200ms',cursor:isOpen?'pointer':'default'}}>
      {isRival && (
        <div style={{position:'absolute',top:10,right:10,zIndex:2,padding:'3px 9px',borderRadius:9999,background:'linear-gradient(90deg,#E8003D,#ff4d6d)',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'0.04em',boxShadow:'0 4px 12px rgba(232,0,61,0.4)'}}>
          🔥 RIVAL
        </div>
      )}
      <div style={{background:isRival?'rgba(232,0,61,0.18)':`linear-gradient(135deg,${sm.color}1f,${sm.color}33)`,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${isRival?'rgba(232,0,61,0.3)':sm.color+'33'}`}}>
        <span style={{fontSize:24}}>{sm.icon}</span>
        <Badge variant={sm.badge}>{sm.label}</Badge>
      </div>
      <div style={{padding:'14px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <span style={{fontWeight:800,fontSize:15}}>{match.home}</span>
          <span style={{color:isRival?'#ff5775':C.fg4,fontSize:11,fontWeight:700}}>vs</span>
          <span style={{fontWeight:800,fontSize:15}}>{match.away}</span>
        </div>
        <div style={{fontSize:11,color:C.fg3,marginBottom:3}}>📅 {match.date} · {match.time}</div>
        <div style={{fontSize:11,color:C.fg3,marginBottom:14}}>📍 {match.venue}</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:isRival?'#ff5775':C.teal}}>₩{match.price.toLocaleString()}~</div>
            {isOpen && match.seats>0 && <div style={{fontSize:10,color:C.fg4,marginTop:2}}>잔여 {match.seats}석</div>}
            {isScheduled && <div style={{fontSize:10,color:C.warning,marginTop:2}}>판매 시작 06.10 10:00</div>}
          </div>
          {isScheduled ? <Badge variant="yellow">예정</Badge>
            : soldOut ? <Badge variant="gray">매진</Badge>
            : match.seats<20 ? <Badge variant="red">마감 임박</Badge>
            : <Badge variant="green">예매 가능</Badge>}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  const sk = {background:'linear-gradient(90deg,#262a3e,#2f3450,#262a3e)',backgroundSize:'200% 100%',animation:'shimmer 1.4s linear infinite',borderRadius:6};
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
      <div style={{...sk,height:60,borderRadius:0}}></div>
      <div style={{padding:'14px 16px'}}>
        <div style={{...sk,width:'70%',height:14,marginBottom:10}}></div>
        <div style={{...sk,width:'50%',height:10,marginBottom:6}}></div>
        <div style={{...sk,width:'60%',height:10,marginBottom:14}}></div>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <div style={{...sk,width:80,height:18}}></div>
          <div style={{...sk,width:60,height:18,borderRadius:9999}}></div>
        </div>
      </div>
    </div>
  );
}

/* ── HOME ANNOTATED — data bindings ── */
function HomeV2Annotated() {
  return (
    <div style={{width:'100%',height:'100%',position:'relative',background:'#0a0c14'}}>
      <div style={{position:'absolute',inset:'0 320px 0 0'}}><HomeV2 /></div>
      <div style={{position:'absolute',top:80,right:14,width:300,display:'flex',flexDirection:'column',gap:10,maxHeight:'92%',overflow:'auto'}}>
        {[
          {n:'A',t:'NavBar.unreadCount', d:'GET /api/notifications?read=false → count. SSE로 실시간 증가. 9 초과 시 9+ 표시'},
          {n:'B',t:'Search ⌘K palette', d:'경기·팀 통합 검색. 단축키 ⌘K / Ctrl+K. 미구현 시 placeholder만'},
          {n:'C',t:'Rival hero banner', d:'games[].game_grade === "RIVAL" 중 가장 가까운 OPEN 경기 1건. 라이벌 매치는 crimson gradient + 🔥 + VS 큰 워터마크'},
          {n:'D',t:'Favorite teams strip', d:'GET /api/members/me/favorite-teams (priority asc). 팀별 다음 경기 N건 카운트 표시. 클릭 시 해당 팀 필터 적용'},
          {n:'E',t:'Sport filter chips', d:'sportType 쿼리 파라미터 (BASEBALL|FOOTBALL|BASKETBALL). 단일 선택, 변경 시 cursor 초기화'},
          {n:'F',t:'Rival match card', d:'game_grade === "RIVAL" → 빨간 그라디언트 + 🔥 RIVAL 뱃지. 일반 경기보다 시각적 priority 상승'},
          {n:'G',t:'Status badge', d:'SCHEDULED→예정(yellow) · OPEN+seats=0→매진(gray) · OPEN+seats<20→마감 임박(red) · OPEN→예매 가능(green)'},
          {n:'H',t:'Cursor pagination', d:'GET /api/games?cursor=xxx&size=12. 스크롤 80% 시 prefetch. 응답에 nextCursor 없으면 종료'},
        ].map(a => (
          <div key={a.n} style={{background:'rgba(93,187,160,0.08)',border:`1px solid ${C.teal}55`,borderRadius:8,padding:'9px 11px'}}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
              <div style={{width:20,height:20,borderRadius:'50%',background:C.teal,color:C.tealDeep,fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{a.n}</div>
              <div style={{fontSize:11,fontWeight:700,color:C.fg1}}>{a.t}</div>
            </div>
            <div style={{fontSize:10,color:C.fg3,lineHeight:1.55,paddingLeft:28}}>{a.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── GAME DETAIL v2 — RIVAL variant + data bindings ── */
function GameDetailV2({rival=false, scheduled=false, skeleton=false}) {
  const m = rival ? matches[1] : matches[0];
  const sm = sportMeta[m.sport];
  const grades = [
    {grade:'VIP', name:'VIP 박스석',  price:50000, total:120,  left:8,    color:C.teal,    side:'NEUTRAL'},
    {grade:'R',   name:'1루 응원석',   price:25000, total:1200, left:142,  color:'#ff8fa3', side:'TEAM1'},
    {grade:'S',   name:'3루 응원석',   price:21000, total:1200, left:412,  color:'#fdba74', side:'TEAM2'},
    {grade:'A',   name:'외야 일반석',  price:15000, total:2400, left:1832, color:C.fg3,    side:'NEUTRAL'},
  ];
  const accent = rival ? '#ff5775' : C.teal;
  if (skeleton) {
    const sk = {background:'linear-gradient(90deg,#262a3e,#2f3450,#262a3e)',backgroundSize:'200% 100%',animation:'shimmer 1.4s linear infinite',borderRadius:6};
    return (
      <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
        <NavBar active="home" />
        <div style={{padding:'28px 40px',flex:1}}>
          <div style={{...sk,height:240,borderRadius:14,marginBottom:18}}></div>
          <div style={{...sk,height:220,borderRadius:14,marginBottom:18}}></div>
          <div style={{...sk,height:120,borderRadius:14}}></div>
        </div>
      </div>
    );
  }
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <NavBar active="home" />
      <div style={{flex:1,padding:'24px 40px',overflow:'auto'}}>
        <div style={{fontSize:11,color:C.fg4,marginBottom:14}}>홈 · {sm.label} · <span style={{color:C.fg2}}>{m.home} vs {m.away}</span></div>

        {/* Hero */}
        <div style={{background:rival?'linear-gradient(120deg,#2a0c18,#3d0c20 50%,#1a0a14)':`linear-gradient(135deg,${sm.color}22,${C.tealDeep})`,border:`1px solid ${rival?'rgba(232,0,61,0.45)':C.border}`,borderRadius:16,padding:32,marginBottom:20,position:'relative',overflow:'hidden'}}>
          {rival && <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 70% 50%, rgba(232,0,61,0.2), transparent 60%)'}}></div>}
          <div style={{position:'relative'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:18}}>
              <Badge variant={sm.badge}>{sm.icon} {sm.label}</Badge>
              {rival && <Badge variant="rival">🔥 RIVALRY MATCH</Badge>}
              {scheduled ? <Badge variant="yellow">SCHEDULED · 곧 오픈</Badge> : <Badge variant="green"><span style={{width:5,height:5,borderRadius:'50%',background:C.success,display:'inline-block'}}></span> OPEN · 예매 중</Badge>}
              <span style={{marginLeft:'auto',fontSize:10,color:C.fg4,fontFamily:'monospace'}}>game_id: {m.id}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:36,marginBottom:18}}>
              <div style={{textAlign:'center',flex:1}}>
                <div style={{width:72,height:72,margin:'0 auto 10px',borderRadius:16,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#171A2C',fontSize:18}}>KT</div>
                <div style={{fontSize:20,fontWeight:800}}>{m.home}</div>
                <div style={{fontSize:11,color:C.fg4,marginTop:3}}>홈 · 14승 8패 · 승률 .636</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:42,fontWeight:900,color:rival?'#ff5775':C.fg4,letterSpacing:'-0.05em'}}>VS</div>
                {rival && <div style={{fontSize:9,fontWeight:700,color:'#ff5775',letterSpacing:'0.1em',textTransform:'uppercase',marginTop:-4}}>경부 라이벌</div>}
              </div>
              <div style={{textAlign:'center',flex:1}}>
                <div style={{width:72,height:72,margin:'0 auto 10px',borderRadius:16,background:'#13294B',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff',fontSize:18}}>{m.away.slice(0,2)}</div>
                <div style={{fontSize:20,fontWeight:800}}>{m.away}</div>
                <div style={{fontSize:11,color:C.fg4,marginTop:3}}>원정 · 16승 6패 · 승률 .727</div>
              </div>
            </div>
            <div style={{display:'flex',gap:24,padding:'12px 20px',background:'rgba(0,0,0,0.3)',borderRadius:10,marginBottom:18}}>
              <div><div style={{fontSize:10,color:C.fg4,marginBottom:3,textTransform:'uppercase',letterSpacing:'0.05em'}}>경기일</div><div style={{fontSize:13,fontWeight:600}}>📅 {m.date} {m.time}</div></div>
              <div><div style={{fontSize:10,color:C.fg4,marginBottom:3,textTransform:'uppercase',letterSpacing:'0.05em'}}>경기장</div><div style={{fontSize:13,fontWeight:600}}>📍 {m.venue}</div></div>
              <div><div style={{fontSize:10,color:C.fg4,marginBottom:3,textTransform:'uppercase',letterSpacing:'0.05em'}}>최대 구매</div><div style={{fontSize:13,fontWeight:600}}>🎫 인당 4매</div></div>
              {scheduled && <div><div style={{fontSize:10,color:C.fg4,marginBottom:3,textTransform:'uppercase',letterSpacing:'0.05em'}}>판매 시작</div><div style={{fontSize:13,fontWeight:700,color:C.warning}}>06.10 10:00</div></div>}
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              {scheduled ? (
                <div style={{padding:'12px 24px',background:C.card,border:`1px solid ${C.border}`,borderRadius:9999,fontSize:14,color:C.fg2,display:'flex',alignItems:'center',gap:8}}>
                  ⏱ 판매 시작까지 <strong style={{color:C.warning,fontFamily:'monospace'}}>02:14:38</strong>
                </div>
              ) : <Btn variant={rival?'rival':'primary'} size="lg">대기열 입장 →</Btn>}
              <Btn variant="secondary" size="lg">💬 팬 채팅방 입장</Btn>
              <button style={{padding:12,borderRadius:9999,border:`1px solid ${C.border}`,background:C.card,color:C.fg2,cursor:'pointer'}}>🤍</button>
            </div>
          </div>
        </div>

        {/* Seat grades */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:'hidden',marginBottom:18}}>
          <div style={{padding:'14px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:14,fontWeight:700}}>좌석 등급</div>
            <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:C.fg4}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:C.success,animation:'pulse 1.5s ease infinite'}}></span>
              실시간 잔여석 (SSE)
            </div>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:C.elevated}}>
              {['등급','구역','team_side','가격','총 좌석','잔여','가용률',''].map(h=>(<th key={h} style={{padding:'10px 18px',fontSize:10,fontWeight:700,color:C.fg4,textTransform:'uppercase',letterSpacing:'0.04em',textAlign:'left'}}>{h}</th>))}
            </tr></thead>
            <tbody>{grades.map(g=>{
              const pct = Math.round(g.left/g.total*100);
              return (
                <tr key={g.grade} style={{borderTop:`1px solid ${C.border}`}}>
                  <td style={{padding:'14px 18px'}}><Badge variant="purple">{g.grade}</Badge></td>
                  <td style={{padding:'14px 18px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:10,height:10,borderRadius:3,background:g.color}}></div>
                      <span style={{fontSize:13,fontWeight:600}}>{g.name}</span>
                    </div>
                  </td>
                  <td style={{padding:'14px 18px',fontSize:11,color:C.fg4,fontFamily:'monospace'}}>{g.side}</td>
                  <td style={{padding:'14px 18px',fontSize:14,fontWeight:700,color:accent}}>₩{g.price.toLocaleString()}</td>
                  <td style={{padding:'14px 18px',fontSize:12,color:C.fg3}}>{g.total.toLocaleString()}석</td>
                  <td style={{padding:'14px 18px',fontSize:12,fontWeight:600}}>{g.left.toLocaleString()}석</td>
                  <td style={{padding:'14px 18px',width:200}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{flex:1,height:5,background:C.elevated,borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,background:pct<10?C.error:pct<25?C.warning:C.success,borderRadius:3}}></div>
                      </div>
                      <span style={{fontSize:10,color:C.fg4,width:32}}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{padding:'14px 18px'}}>
                    {g.left===0 ? <Badge variant="gray">매진</Badge> : g.left<20 ? <Badge variant="red">마감 임박</Badge> : <Badge variant="green">예매 가능</Badge>}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>예매 안내</div>
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:8,fontSize:12,color:C.fg3,lineHeight:1.6}}>
              <li>• 1인당 최대 <strong style={{color:C.fg2}}>4매</strong>까지 구매 가능 (max_ticket_per_user=4)</li>
              <li>• 좌석 선점 후 <strong style={{color:C.fg2}}>15분 이내</strong>에 결제하지 않으면 자동 해제</li>
              <li>• 경기 시작 1시간 전까지 100% 환불, 이후 환불 불가</li>
              <li>• 결제 수단: <strong style={{color:C.fg2}}>CARD · KAKAO_PAY · TOSS_PAY</strong></li>
            </ul>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700}}>팬 채팅방</div>
              <Badge variant="green" size="sm">LIVE</Badge>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              {['김','이','박','최','+'].map((n,i)=>(
                <div key={i} style={{width:28,height:28,borderRadius:'50%',background:i===4?C.elevated:`${[C.teal,C.purple,C.red,C.orange][i%4]}33`,border:`2px solid ${C.card}`,marginLeft:i?-8:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===4?C.fg3:'#fff'}}>{n}</div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.fg3,marginBottom:14}}>지금 <strong style={{color:accent}}>247명</strong>이 응원 중 · 분당 38메시지</div>
            <Btn variant="ghost" style={{width:'100%',justifyContent:'center'}}>채팅방 입장 →</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── QUEUE STATES ── */
function QueueWidget({position=247, total=1843, state='live'}) {
  const pct = Math.max(0, Math.min(100, (1 - position/total)*100));
  const eta = Math.ceil(position/15);
  const accent = state==='reconnecting' ? C.warning : state==='kicked' ? C.error : state==='imminent' ? '#fbbf24' : state==='entering' ? C.success : C.teal;
  return (
    <div style={{background:C.card,border:`1px solid ${state==='kicked'?C.error+'66':C.border}`,borderRadius:18,padding:36,width:480,textAlign:'center',position:'relative',overflow:'hidden'}}>
      {state==='imminent' && <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 50% 30%, rgba(251,191,36,0.18), transparent 60%)',animation:'pulse 2s ease infinite'}}></div>}
      <div style={{position:'relative'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:8}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:state==='reconnecting'?C.warning:state==='kicked'?C.error:C.success,animation:state==='reconnecting'?'pulse 0.8s ease infinite':'none'}}></span>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',color:C.fg4,textTransform:'uppercase'}}>
            {state==='reconnecting' ? 'SSE 재연결 중...' : state==='kicked' ? '연결 끊김' : state==='imminent' ? '곧 입장합니다' : state==='entering' ? '입장 중' : '실시간 대기열 · SSE'}
          </span>
        </div>
        <div style={{fontSize:13,color:C.fg3,marginBottom:24}}>⚾ KT Wiz vs LG 트윈스 · 06.18 19:00</div>

        {state==='entering' ? (
          <div>
            <div style={{width:140,height:140,margin:'0 auto 18px',borderRadius:'50%',background:`radial-gradient(circle, ${C.success}33, transparent 70%)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:64}}>✓</div>
            <div style={{fontSize:22,fontWeight:800,color:C.success,marginBottom:6}}>입장 완료!</div>
            <div style={{fontSize:13,color:C.fg3,marginBottom:18}}>좌석 선택 화면으로 이동 중...</div>
            <div style={{height:4,background:C.elevated,borderRadius:9999,overflow:'hidden'}}><div style={{height:'100%',width:'100%',background:C.success,borderRadius:9999,animation:'fillBar 1.5s ease forwards'}}></div></div>
          </div>
        ) : state==='kicked' ? (
          <div>
            <div style={{width:120,height:120,margin:'0 auto 18px',borderRadius:'50%',background:`${C.error}18`,border:`2px solid ${C.error}66`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>⏱</div>
            <div style={{fontSize:18,fontWeight:800,color:C.error,marginBottom:8}}>대기열에서 이탈했습니다</div>
            <div style={{fontSize:12,color:C.fg3,lineHeight:1.6,marginBottom:20}}>30초간 SSE 재연결에 실패해<br/>대기열에서 제거되었습니다.<br/>다시 줄을 서야 합니다.</div>
            <div style={{display:'flex',gap:8,justifyContent:'center'}}>
              <Btn>대기열 재진입</Btn>
              <Btn variant="ghost">홈으로</Btn>
            </div>
          </div>
        ) : (
          <>
            <div style={{position:'relative',width:160,height:160,margin:'0 auto 22px'}}>
              <svg width="160" height="160" style={{transform:'rotate(-90deg)'}}>
                <circle cx="80" cy="80" r="70" fill="none" stroke={C.elevated} strokeWidth="6"/>
                <circle cx="80" cy="80" r="70" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${440*pct/100} 440`} style={{transition:'stroke-dasharray 1s ease'}}/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:48,fontWeight:900,color:accent,letterSpacing:'-0.05em',lineHeight:1,fontFamily:'monospace'}}>{state==='imminent'?Math.min(position,3):position}</div>
                <div style={{fontSize:11,color:C.fg3,marginTop:4}}>대기 순번</div>
              </div>
            </div>
            {state==='imminent' && <div style={{fontSize:13,fontWeight:700,color:'#fbbf24',marginBottom:12,animation:'pulse 1.2s ease infinite'}}>🎟 곧 입장합니다. 페이지를 닫지 마세요!</div>}
            <div style={{background:C.elevated,borderRadius:9999,height:6,marginBottom:8,overflow:'hidden'}}><div style={{height:'100%',background:accent,borderRadius:9999,width:`${pct}%`,transition:'width 1s ease'}}></div></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.fg4,marginBottom:18}}>
              <span>전체 {total.toLocaleString()}명 대기</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div style={{background:C.elevated,borderRadius:10,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <span style={{fontSize:13,color:C.fg3}}>예상 대기 시간</span>
              <span style={{fontSize:15,fontWeight:800,color:C.warning}}>약 {eta}분</span>
            </div>
            {state==='reconnecting' && (
              <div style={{padding:'10px 14px',background:'rgba(245,158,11,0.1)',border:`1px solid ${C.warning}55`,borderRadius:9,fontSize:11,color:C.warning,marginBottom:14,textAlign:'left',lineHeight:1.6}}>
                ⚠️ 네트워크 연결이 불안정합니다. <strong>30초 grace period</strong> 안에 재연결되면 순번이 유지돼요.
                <div style={{marginTop:6,height:3,background:'rgba(245,158,11,0.2)',borderRadius:9999,overflow:'hidden'}}><div style={{height:'100%',width:'45%',background:C.warning}}></div></div>
              </div>
            )}
            <Btn variant="ghost" size="sm" style={{width:'100%'}}>대기열 나가기</Btn>
            <div style={{marginTop:14,fontSize:10,color:C.fg4,lineHeight:1.6,textAlign:'left',padding:'10px 14px',background:C.elevated,borderRadius:8}}>
              💡 창을 닫아도 30초 내 재접속하면 순번이 유지됩니다. 이탈 후에는 다시 줄을 서야 합니다.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QueueScreen({state='live'}) {
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <NavBar active="home" />
      <div style={{flex:1,padding:'40px 28px',display:'flex',justifyContent:'center',alignItems:'flex-start',overflow:'auto'}}>
        <QueueWidget position={state==='imminent'?2:247} total={1843} state={state} />
      </div>
    </div>
  );
}

function QueueAnnotated() {
  return (
    <div style={{width:'100%',height:'100%',position:'relative',background:'#0a0c14',display:'flex'}}>
      <div style={{flex:1,background:C.dark,position:'relative'}}>
        <NavBar active="home" />
        <div style={{padding:'40px 28px',display:'flex',justifyContent:'center'}}><QueueWidget /></div>
      </div>
      <div style={{width:380,padding:'24px 20px',background:'#0a0c14',color:C.fg1,display:'flex',flexDirection:'column',gap:12,overflow:'auto'}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:C.teal,textTransform:'uppercase',marginBottom:6}}>Realtime · SSE</div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>대기열 데이터 흐름</div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,fontSize:11,fontFamily:'monospace',color:C.fg3,lineHeight:1.7}}>
            <div><span style={{color:C.teal}}>POST</span> /api/tickets/queue/enter</div>
            <div style={{color:C.fg4}}>→ ZADD reservation:queue:{`{gameId}`} score=now() member=uuid</div>
            <div style={{marginTop:6}}><span style={{color:C.warning}}>SSE</span> /api/tickets/queue/sse?token=jwt</div>
            <div style={{color:C.fg4}}>← {`{position:247, total:1843, eta:16}`}</div>
            <div style={{color:C.fg4}}>← {`{position:246, total:1845}`}</div>
            <div style={{color:C.success}}>← {`{ready:true, sessionId:"r-7f3a..."}`}</div>
            <div style={{marginTop:6,color:C.error}}><span>DELETE</span> /api/tickets/queue/leave</div>
          </div>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Interaction notes</div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {[
              ['A. Live update','순번이 줄어들 때 SVG circle stroke-dasharray + progress width: transition 1s ease로 부드럽게'],
              ['B. Imminent (top 3)','position ≤ 3일 때 노란 pulse glow + "곧 입장" 메시지 + 페이지 이탈 경고'],
              ['C. Reconnecting','SSE onError → 자동 재연결 시도. UI는 노란 banner + grace period progress (30s)'],
              ['D. Kicked (grace expired)','30초 동안 재연결 실패 시 ZREM → 빨간 error state로 전환. 재진입 CTA 노출'],
              ['E. Entering','ready=true 도착 시 success animation → 1.5초 뒤 자동 redirect /seats. 15-min reservation TTL 시작'],
              ['F. 이탈 보호','beforeunload에서 heartbeat beacon 전송. 30초 내 재접속 → 동일 UUID로 ZADD 복원'],
              ['G. Leave button','"대기열 나가기" 클릭 시 confirm modal → DELETE /queue/leave → 홈 redirect'],
            ].map(([t,d])=>(
              <div key={t} style={{padding:'8px 11px',borderRadius:7,background:'rgba(93,187,160,0.07)',border:`1px solid ${C.teal}33`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.teal,marginBottom:2}}>{t}</div>
                <div style={{fontSize:10,color:C.fg3,lineHeight:1.5}}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.SportifyV2Core = {
  C, sportMeta, matches, Badge, Btn, Toggle, NavBar, Note,
  HomeV2, HomeV2Annotated, MatchCardV2, SkeletonCard,
  GameDetailV2,
  QueueWidget, QueueScreen, QueueAnnotated,
};
