/* Sportify Full Design — all screens */
const { useState, useEffect } = React;

const C = {
  dark:'#171A2C', card:'#1C2030', elevated:'#2A2F45',
  teal:'#5DBBA0', tealLight:'#DBF9E8', deep:'#0E2421',
  red:'#E8003D', green:'#1B6B3A', orange:'#F97316', purple:'#7B2FBE',
  border:'#3D4464', fg1:'#FFFFFF', fg2:'#C8CCDA', fg3:'#8B93B0', fg4:'#5A6280',
  success:'#3ECF8E', warning:'#F59E0B', error:'#EF4444', info:'#3B82F6',
};
const Light = {
  dark:'#FAFAF7', card:'#FFFFFF', elevated:'#F1F1EE',
  teal:'#2D8E73', tealLight:'#E8F5EE', deep:'#0E2421',
  border:'#E5E5DF', fg1:'#171A2C', fg2:'#3D4464', fg3:'#6A7080', fg4:'#9098A8',
};

const sportMeta = {
  BASEBALL:   {label:'야구', icon:'⚾', color:C.red,    badge:'baseball', kt:'KT Wiz'},
  SOCCER:     {label:'축구', icon:'⚽', color:C.green,  badge:'soccer'},
  BASKETBALL: {label:'농구', icon:'🏀', color:C.orange, badge:'basketball'},
};
const matches = [
  {id:1,sport:'BASEBALL',  home:'KT Wiz',    away:'두산 베어스',date:'2025.06.15',time:'18:30',venue:'수원KT위즈파크',price:25000,seats:142,status:'OPEN'},
  {id:2,sport:'BASEBALL',  home:'KT Wiz',    away:'LG 트윈스',  date:'2025.06.18',time:'19:00',venue:'수원KT위즈파크',price:30000,seats:8,  status:'OPEN'},
  {id:3,sport:'SOCCER',    home:'수원 FC',   away:'전북 현대',  date:'2025.06.20',time:'20:00',venue:'수원월드컵경기장',price:18000,seats:330,status:'OPEN'},
  {id:4,sport:'BASKETBALL',home:'KT 소닉붐', away:'현대모비스', date:'2025.06.24',time:'19:00',venue:'수원KT아레나',price:22000,seats:88, status:'OPEN'},
];

/* ── ATOMS ── */
function Badge({children, variant='teal', style={}}) {
  const v = {
    teal:{bg:'rgba(93,187,160,0.15)',color:C.teal,bd:'rgba(93,187,160,0.3)'},
    green:{bg:'rgba(62,207,142,0.12)',color:C.success,bd:'rgba(62,207,142,0.25)'},
    red:{bg:'rgba(239,68,68,0.12)',color:C.error,bd:'rgba(239,68,68,0.25)'},
    yellow:{bg:'rgba(245,158,11,0.12)',color:C.warning,bd:'rgba(245,158,11,0.25)'},
    gray:{bg:C.elevated,color:C.fg3,bd:C.border},
    baseball:{bg:'rgba(232,0,61,0.15)',color:'#ff8fa3',bd:'rgba(232,0,61,0.3)'},
    soccer:{bg:'rgba(27,107,58,0.2)',color:'#4ade80',bd:'rgba(27,107,58,0.4)'},
    basketball:{bg:'rgba(249,115,22,0.15)',color:'#fdba74',bd:'rgba(249,115,22,0.3)'},
  }[variant] || {bg:C.elevated,color:C.fg3,bd:C.border};
  return <span style={{display:'inline-flex',alignItems:'center',gap:5,borderRadius:9999,padding:'3px 10px',fontSize:11,fontWeight:600,background:v.bg,color:v.color,border:`1px solid ${v.bd}`,...style}}>{children}</span>;
}
function Btn({children, variant='primary', size='md', style={}, onClick}) {
  const sz = {sm:{padding:'6px 14px',fontSize:12},md:{padding:'10px 20px',fontSize:14},lg:{padding:'13px 28px',fontSize:16}}[size];
  const v = {
    primary:{bg:C.teal,color:C.deep,bd:'none'},
    secondary:{bg:'transparent',color:C.teal,bd:`1.5px solid ${C.teal}`},
    ghost:{bg:C.card,color:C.fg2,bd:`1px solid ${C.border}`},
    danger:{bg:C.error,color:'#fff',bd:'none'},
  }[variant];
  return <button onClick={onClick} style={{fontFamily:'inherit',fontWeight:600,cursor:'pointer',borderRadius:9999,...sz,background:v.bg,color:v.color,border:v.bd,...style}}>{children}</button>;
}
function NavBar({active='home', mode='dark', showBell=false, P=C}) {
  const items = [{id:'home',label:'홈'},{id:'mytickets',label:'내 티켓'},{id:'chat',label:'팀 채팅'},{id:'mypage',label:'마이'}];
  return (
    <nav style={{background:mode==='light'?'rgba(255,255,255,0.96)':'rgba(23,26,44,0.96)',borderBottom:`1px solid ${P.border}`,display:'flex',alignItems:'center',padding:'0 28px',height:58,gap:28,flexShrink:0}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginRight:12}}>
        <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${P.teal},${C.deep})`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff',fontSize:13}}>S</div>
        <span style={{fontWeight:800,fontSize:16,color:P.teal,letterSpacing:'-0.02em'}}>Sportify</span>
      </div>
      {items.map(it=>(
        <span key={it.id} style={{fontSize:13,fontWeight:active===it.id?700:500,color:active===it.id?P.teal:P.fg3,padding:'0 2px',height:'100%',borderBottom:active===it.id?`2px solid ${P.teal}`:'2px solid transparent',display:'flex',alignItems:'center'}}>{it.label}</span>
      ))}
      <div style={{marginLeft:'auto',display:'flex',gap:14,alignItems:'center'}}>
        {showBell && (
          <div style={{position:'relative'}}>
            <span style={{fontSize:18,color:P.fg2}}>🔔</span>
            <div style={{position:'absolute',top:-3,right:-3,minWidth:14,height:14,padding:'0 4px',borderRadius:9999,background:C.error,color:'#fff',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>3</div>
          </div>
        )}
        <div style={{width:32,height:32,borderRadius:'50%',background:P.elevated,border:`2px solid ${P.teal}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:P.teal}}>K</div>
      </div>
    </nav>
  );
}

/* ── 1. LOGIN ── */
function LoginScreen({mode='dark'}) {
  const P = mode==='light' ? Light : C;
  return (
    <div style={{width:'100%',height:'100%',display:'flex',background:P.dark,color:P.fg1}}>
      {/* Hero */}
      <div style={{flex:1,background:`linear-gradient(135deg,${C.deep},${P.dark} 70%)`,padding:64,display:'flex',flexDirection:'column',justifyContent:'space-between',position:'relative',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${C.teal},${C.deep})`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff',fontSize:18}}>S</div>
          <span style={{fontWeight:800,fontSize:22,color:C.teal,letterSpacing:'-0.02em'}}>Sportify</span>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.12em',color:C.teal,textTransform:'uppercase',marginBottom:14}}>2025 시즌 · 라이브 티켓팅</div>
          <h1 style={{fontSize:40,fontWeight:800,letterSpacing:'-0.03em',marginBottom:16,lineHeight:1.15,color:'#fff'}}>경기장의 함성을<br />가장 빠르게 만나는 법</h1>
          <p style={{color:'rgba(255,255,255,0.7)',fontSize:15,lineHeight:1.6,maxWidth:420}}>실시간 대기열 · 좌석 선택 · 팬 채팅까지<br />Sportify 하나로 야구·축구·농구 티켓을 잡으세요.</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center',color:'rgba(255,255,255,0.5)',fontSize:11}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:C.success}}></span>
          현재 1,847명 대기 중 · 오늘 8경기 오픈
        </div>
        {/* deco */}
        <div style={{position:'absolute',right:-80,bottom:-80,width:340,height:340,borderRadius:'50%',border:`1px solid ${C.teal}33`,opacity:0.4}}></div>
        <div style={{position:'absolute',right:-40,bottom:-40,width:260,height:260,borderRadius:'50%',border:`1px solid ${C.teal}22`,opacity:0.5}}></div>
      </div>
      {/* Form */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:48,background:P.dark}}>
        <div style={{width:380}}>
          <h2 style={{fontSize:26,fontWeight:800,marginBottom:8,letterSpacing:'-0.02em',color:P.fg1}}>로그인</h2>
          <p style={{color:P.fg3,fontSize:13,marginBottom:36}}>소셜 계정으로 시작하세요. 별도 가입은 필요 없습니다.</p>

          <button style={{width:'100%',padding:'13px 16px',borderRadius:10,border:`1px solid ${P.border}`,background:'#FEE500',color:'#191919',fontFamily:'inherit',fontWeight:700,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:10,cursor:'pointer',marginBottom:10}}>
            <span style={{fontSize:18}}>💬</span> 카카오로 시작하기
          </button>
          <button style={{width:'100%',padding:'13px 16px',borderRadius:10,border:`1px solid ${P.border}`,background:mode==='light'?'#fff':P.card,color:P.fg1,fontFamily:'inherit',fontWeight:600,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:10,cursor:'pointer',marginBottom:24}}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1 2.5-2.1 3.3v2.7h3.4c2-1.8 3.3-4.6 3.3-8z"/><path fill="#34A853" d="M12 23c2.8 0 5.2-.9 6.9-2.5l-3.4-2.7c-1 .6-2.2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 20.5 7.9 23 12 23z"/><path fill="#FBBC05" d="M6.2 14.5c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.8H2.7C2 9.1 1.5 10.5 1.5 12s.5 2.9 1.2 4.2l3.5-2.7z"/><path fill="#EA4335" d="M12 5.4c1.5 0 2.9.5 4 1.5l3-3C17.2 2.2 14.8 1 12 1 7.9 1 4.4 3.5 2.7 7l3.5 2.7c.8-2.5 3.1-4.3 5.8-4.3z"/></svg>
            Google로 시작하기
          </button>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,color:P.fg4,fontSize:11}}>
            <div style={{flex:1,height:1,background:P.border}}></div> 또는 <div style={{flex:1,height:1,background:P.border}}></div>
          </div>
          <button style={{width:'100%',padding:'12px 16px',borderRadius:10,border:`1px solid ${P.border}`,background:'transparent',color:P.fg2,fontFamily:'inherit',fontWeight:600,fontSize:13,cursor:'pointer'}}>이메일로 로그인</button>

          <p style={{marginTop:32,fontSize:11,color:P.fg4,lineHeight:1.6,textAlign:'center'}}>로그인 시 <span style={{color:P.teal}}>이용약관</span> 및 <span style={{color:P.teal}}>개인정보처리방침</span>에<br />동의한 것으로 간주됩니다.</p>
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24}}>
      <div style={{width:56,height:56,borderRadius:'50%',border:`3px solid ${C.elevated}`,borderTopColor:C.teal,animation:'spin 0.9s linear infinite'}}></div>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:16,fontWeight:700,color:C.fg1,marginBottom:6}}>로그인 중입니다</div>
        <div style={{fontSize:12,color:C.fg3}}>JWT 토큰 발급 · 사용자 프로필 동기화...</div>
      </div>
      <div style={{display:'flex',gap:6,marginTop:8}}>
        {['카카오 인증','토큰 발급','프로필 로드'].map((s,i)=>(
          <div key={s} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',borderRadius:9999,background:C.card,border:`1px solid ${i<2?C.teal+'55':C.border}`,fontSize:10,color:i<2?C.teal:C.fg4}}>
            {i<2?'✓':'•'} {s}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 2. GAME DETAIL ── */
function GameDetail({status='OPEN'}) {
  const m = matches[0];
  const sm = sportMeta[m.sport];
  const grades = [
    {grade:'VIP 박스석',  price:50000, total:120,  left:8,   color:C.teal},
    {grade:'1루 응원석',  price:25000, total:1200, left:142, color:'#ff8fa3'},
    {grade:'3루 응원석',  price:21000, total:1200, left:412, color:'#fdba74'},
    {grade:'외야 일반석', price:15000, total:2400, left:1832,color:C.fg3},
  ];
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <NavBar active="home" showBell />
      <div style={{flex:1,padding:'28px 40px',overflow:'auto'}}>
        <div style={{fontSize:11,color:C.fg4,marginBottom:14}}>홈 · 야구 · <span style={{color:C.fg2}}>KT Wiz vs 두산 베어스</span></div>

        {/* Hero */}
        <div style={{background:`linear-gradient(135deg,${sm.color}22,${C.deep})`,border:`1px solid ${C.border}`,borderRadius:16,padding:36,marginBottom:24,position:'relative',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <Badge variant={sm.badge}>{sm.icon} {sm.label}</Badge>
            {status==='OPEN' ? <Badge variant="green"><span style={{width:5,height:5,borderRadius:'50%',background:C.success,display:'inline-block'}}></span> 예매 중</Badge> : <Badge variant="yellow">곧 오픈</Badge>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:32,marginBottom:18}}>
            <div style={{textAlign:'center',flex:1}}>
              <div style={{width:64,height:64,margin:'0 auto 10px',borderRadius:14,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#171A2C',fontSize:18}}>KT</div>
              <div style={{fontSize:18,fontWeight:800}}>KT Wiz</div>
              <div style={{fontSize:11,color:C.fg4}}>홈 · 14승 8패</div>
            </div>
            <div style={{fontSize:32,fontWeight:800,color:C.fg4,letterSpacing:'-0.05em'}}>VS</div>
            <div style={{textAlign:'center',flex:1}}>
              <div style={{width:64,height:64,margin:'0 auto 10px',borderRadius:14,background:'#13294B',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff',fontSize:18}}>두산</div>
              <div style={{fontSize:18,fontWeight:800}}>두산 베어스</div>
              <div style={{fontSize:11,color:C.fg4}}>원정 · 12승 10패</div>
            </div>
          </div>
          <div style={{display:'flex',gap:24,padding:'14px 20px',background:'rgba(0,0,0,0.25)',borderRadius:10,marginBottom:18}}>
            <div><div style={{fontSize:10,color:C.fg4,marginBottom:3}}>경기일</div><div style={{fontSize:13,fontWeight:600}}>📅 {m.date} {m.time}</div></div>
            <div><div style={{fontSize:10,color:C.fg4,marginBottom:3}}>경기장</div><div style={{fontSize:13,fontWeight:600}}>📍 {m.venue}</div></div>
            <div><div style={{fontSize:10,color:C.fg4,marginBottom:3}}>예상 관중</div><div style={{fontSize:13,fontWeight:600}}>👥 18,500명</div></div>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            {status==='OPEN' ? (
              <Btn size="lg" style={{padding:'14px 32px'}}>대기열 입장 →</Btn>
            ) : (
              <div style={{padding:'12px 24px',background:C.card,border:`1px solid ${C.border}`,borderRadius:9999,fontSize:13,color:C.fg2}}>⏱ 오픈까지 <strong style={{color:C.warning}}>02:14:38</strong></div>
            )}
            <Btn variant="secondary" size="lg">💬 팬 채팅 입장</Btn>
            <button style={{padding:10,borderRadius:9999,border:`1px solid ${C.border}`,background:C.card,color:C.fg2,cursor:'pointer'}}>🤍</button>
          </div>
        </div>

        {/* Seat grades */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:'hidden',marginBottom:18}}>
          <div style={{padding:'14px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:14,fontWeight:700}}>좌석 등급</div>
            <div style={{fontSize:11,color:C.fg4}}>실시간 잔여석 · SSE</div>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:C.elevated}}>
              {['등급','가격','총 좌석','잔여','가용률',''].map(h=>(<th key={h} style={{padding:'10px 20px',fontSize:10,fontWeight:700,color:C.fg4,textTransform:'uppercase',letterSpacing:'0.04em',textAlign:'left'}}>{h}</th>))}
            </tr></thead>
            <tbody>{grades.map(g=>{
              const pct = Math.round(g.left/g.total*100);
              return (
                <tr key={g.grade} style={{borderTop:`1px solid ${C.border}`}}>
                  <td style={{padding:'14px 20px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:10,height:10,borderRadius:3,background:g.color}}></div>
                      <span style={{fontSize:13,fontWeight:600}}>{g.grade}</span>
                    </div>
                  </td>
                  <td style={{padding:'14px 20px',fontSize:14,fontWeight:700,color:C.teal}}>₩{g.price.toLocaleString()}</td>
                  <td style={{padding:'14px 20px',fontSize:12,color:C.fg3}}>{g.total.toLocaleString()}석</td>
                  <td style={{padding:'14px 20px',fontSize:12,fontWeight:600}}>{g.left.toLocaleString()}석</td>
                  <td style={{padding:'14px 20px',width:200}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{flex:1,height:5,background:C.elevated,borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,background:pct<10?C.error:pct<25?C.warning:C.success,borderRadius:3}}></div>
                      </div>
                      <span style={{fontSize:10,color:C.fg4,width:32}}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{padding:'14px 20px'}}>
                    {g.left===0 ? <Badge variant="gray">매진</Badge> : g.left<20 ? <Badge variant="red">마감 임박</Badge> : <Badge variant="green">예매 가능</Badge>}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>

        {/* Info grid */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>예매 안내</div>
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:8,fontSize:12,color:C.fg3,lineHeight:1.6}}>
              <li>• 1인당 최대 4매까지 구매 가능합니다.</li>
              <li>• 좌석 선점 후 <strong style={{color:C.fg2}}>15분 이내</strong>에 결제하지 않으면 자동 해제됩니다.</li>
              <li>• 경기 시작 1시간 전까지 100% 환불, 이후 환불 불가.</li>
              <li>• 결제는 카카오페이·네이버페이·신용카드·계좌이체를 지원합니다.</li>
            </ul>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>팬 채팅방</div>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              {['김','이','박','최','+'].map((n,i)=>(
                <div key={i} style={{width:28,height:28,borderRadius:'50%',background:i===4?C.elevated:`${[C.teal,C.purple,C.red,C.orange][i%4]}33`,border:`2px solid ${C.card}`,marginLeft:i?-8:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===4?C.fg3:'#fff'}}>{n}</div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.fg3,marginBottom:14}}>지금 <strong style={{color:C.teal}}>247명</strong>이 응원 중</div>
            <Btn variant="ghost" style={{width:'100%',justifyContent:'center'}}>채팅방 입장 →</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Annotation callout */
function Note({text, style={}}) {
  return <div style={{position:'absolute',background:C.teal,color:C.deep,fontSize:10,fontWeight:700,padding:'4px 9px',borderRadius:6,boxShadow:'0 4px 12px rgba(0,0,0,0.4)',whiteSpace:'nowrap',zIndex:10,...style}}>{text}</div>;
}
function NoteLine({style={}}) {
  return <div style={{position:'absolute',background:C.teal,height:1,zIndex:9,...style}}></div>;
}

function GameDetailAnnotated() {
  return (
    <div style={{width:'100%',height:'100%',position:'relative',background:'#0a0c14'}}>
      <div style={{position:'absolute',inset:'0 60px 0 0'}}><GameDetail status="OPEN" /></div>
      <Note text="① 실시간 잔여석 (SSE 1Hz)" style={{top:580,right:80}} />
      <NoteLine style={{top:589,right:300,width:60}} />
      <Note text="② 가용률 < 10%일 때 빨강 (마감 임박)" style={{top:660,right:80}} />
      <NoteLine style={{top:669,right:300,width:60}} />
      <Note text="③ Hover시 행 강조 + Enter Queue 단축" style={{top:740,right:80}} />
      <NoteLine style={{top:749,right:300,width:60}} />
      <Note text="④ 응원 인원 = 채팅방 connectedUsers" style={{top:880,right:80}} />
      <NoteLine style={{top:889,right:300,width:60}} />
    </div>
  );
}

/* ── 3. NOTIFICATION BELL DROPDOWN ── */
function BellDropdown({unread=true, empty=false}) {
  const items = [
    {icon:'⚾',title:'KT Wiz vs LG 예매가 오픈됐어요',time:'방금 전',read:false,type:'ticket'},
    {icon:'💳',title:'결제가 완료되었습니다',sub:'KT Wiz vs 두산 · ₩50,000',time:'2시간 전',read:false,type:'payment'},
    {icon:'⏰',title:'경기 시작 1시간 전 알림',sub:'수원 FC vs 전북 · 19:00 시작',time:'1일 전',read:false,type:'reminder'},
    {icon:'💬',title:'@김개발 님이 멘션했어요',sub:'#야구 채널 · "오늘 같이 가실 분?"',time:'2일 전',read:true,type:'mention'},
    {icon:'📡',title:'알림 채널이 연결됐어요',sub:'MQTT · Android 기기',time:'3일 전',read:true,type:'system'},
  ];
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column',position:'relative'}}>
      <NavBar active="home" showBell />
      {/* Dimmed background page hint */}
      <div style={{flex:1,padding:'28px 40px',opacity:0.3,pointerEvents:'none'}}>
        <h2 style={{fontSize:18,fontWeight:800}}>홈</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginTop:16}}>
          {[1,2,3].map(i=><div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,height:200}}></div>)}
        </div>
      </div>
      {/* Dropdown */}
      <div style={{position:'absolute',top:54,right:96,width:380,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.5)',overflow:'hidden'}}>
        {/* Pointer */}
        <div style={{position:'absolute',top:-7,right:24,width:14,height:14,background:C.card,borderTop:`1px solid ${C.border}`,borderLeft:`1px solid ${C.border}`,transform:'rotate(45deg)'}}></div>
        <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:14,fontWeight:700}}>알림</span>
            {!empty && <Badge variant="teal">3 unread</Badge>}
          </div>
          {!empty && <button style={{background:'none',border:'none',color:C.fg3,fontSize:11,fontFamily:'inherit',cursor:'pointer'}}>모두 읽음</button>}
        </div>
        {empty ? (
          <div style={{padding:'60px 20px',textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:12,opacity:0.3}}>🔕</div>
            <div style={{fontSize:13,fontWeight:600,color:C.fg2,marginBottom:5}}>새로운 알림이 없습니다</div>
            <div style={{fontSize:11,color:C.fg4,lineHeight:1.5}}>경기 오픈·결제·멘션 알림이 도착하면<br/>여기에 표시돼요.</div>
            <Btn variant="ghost" size="sm" style={{marginTop:18}}>알림 설정 →</Btn>
          </div>
        ) : (
          <div style={{maxHeight:440,overflow:'auto'}}>
            {items.map((it,i)=>(
              <div key={i} style={{padding:'12px 18px',borderBottom:i<items.length-1?`1px solid ${C.border}`:'none',display:'flex',gap:11,background:!it.read?'rgba(93,187,160,0.04)':'transparent',cursor:'pointer'}}>
                <div style={{width:32,height:32,borderRadius:9,background:C.elevated,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>{it.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'baseline',gap:8,justifyContent:'space-between'}}>
                    <div style={{fontSize:12,fontWeight:!it.read?700:500,color:!it.read?C.fg1:C.fg2,lineHeight:1.4}}>{it.title}</div>
                    <span style={{fontSize:9,color:C.fg4,whiteSpace:'nowrap'}}>{it.time}</span>
                  </div>
                  {it.sub && <div style={{fontSize:11,color:C.fg3,marginTop:3}}>{it.sub}</div>}
                </div>
                {!it.read && <div style={{width:7,height:7,borderRadius:'50%',background:C.teal,marginTop:6,flexShrink:0}}></div>}
              </div>
            ))}
          </div>
        )}
        <div style={{padding:'10px 18px',borderTop:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <button style={{background:'none',border:'none',color:C.teal,fontSize:11,fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>전체 알림 보기</button>
          <button style={{background:'none',border:'none',color:C.fg3,fontSize:11,fontFamily:'inherit',cursor:'pointer'}}>⚙ 설정</button>
        </div>
      </div>
    </div>
  );
}

/* ── 4. MY PAGE ── */
function MyPage({empty=false}) {
  const teams = empty ? [] : [
    {name:'KT Wiz',     sport:'⚾', color:C.red,    next:'06.15 vs 두산'},
    {name:'수원 FC',    sport:'⚽', color:C.green,  next:'06.20 vs 전북'},
    {name:'KT 소닉붐',  sport:'🏀', color:C.orange, next:'06.24 vs 모비스'},
  ];
  const tickets = [
    {match:'KT Wiz vs 두산',    date:'2025.06.15',seat:'1루측 B3',status:'CONFIRMED'},
    {match:'수원 FC vs 전북',   date:'2025.06.20',seat:'3루측 A7',status:'CONFIRMED'},
    {match:'KT 소닉붐 vs 모비스',date:'2025.04.10',seat:'VIP D2',  status:'CANCELLED'},
  ];
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <NavBar active="mypage" showBell />
      <div style={{flex:1,padding:'28px 40px',overflow:'auto'}}>
        {/* Profile header */}
        <div style={{background:`linear-gradient(135deg,${C.deep},#1a2840)`,border:`1px solid ${C.border}`,borderRadius:16,padding:28,marginBottom:24,display:'flex',alignItems:'center',gap:24}}>
          <div style={{width:80,height:80,borderRadius:'50%',background:C.elevated,border:`3px solid ${C.teal}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:800,color:C.teal}}>K</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
              <h1 style={{fontSize:22,fontWeight:800}}>김개발</h1>
              <button style={{background:'none',border:'none',color:C.fg3,fontSize:11,fontFamily:'inherit',cursor:'pointer'}}>✏ 닉네임 수정</button>
            </div>
            <div style={{fontSize:12,color:C.fg3,marginBottom:8}}>kim.dev@ktcloud.com · 2024.03 가입</div>
            <div style={{display:'flex',gap:8}}>
              <Badge variant="teal">VIP 회원</Badge>
              <Badge variant="green"><span style={{width:5,height:5,borderRadius:'50%',background:C.success,display:'inline-block'}}></span> 활성</Badge>
            </div>
          </div>
          <div style={{display:'flex',gap:24,paddingLeft:24,borderLeft:`1px solid ${C.border}`}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:C.teal}}>12</div>
              <div style={{fontSize:10,color:C.fg4,textTransform:'uppercase',letterSpacing:'0.05em'}}>예매 횟수</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800}}>{teams.length}</div>
              <div style={{fontSize:10,color:C.fg4,textTransform:'uppercase',letterSpacing:'0.05em'}}>관심 팀</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:C.warning}}>247p</div>
              <div style={{fontSize:10,color:C.fg4,textTransform:'uppercase',letterSpacing:'0.05em'}}>포인트</div>
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
          {/* Favorite teams */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700}}>관심 팀 <span style={{color:C.fg4,fontWeight:400}}>· 우선순위 순</span></div>
              <Btn variant="ghost" size="sm">+ 추가</Btn>
            </div>
            {empty ? (
              <div style={{padding:'36px 16px',textAlign:'center',background:C.elevated,borderRadius:10}}>
                <div style={{fontSize:36,marginBottom:10,opacity:0.4}}>⭐</div>
                <div style={{fontSize:13,fontWeight:600,color:C.fg2,marginBottom:4}}>관심 팀이 없습니다</div>
                <div style={{fontSize:11,color:C.fg4,lineHeight:1.5,marginBottom:14}}>관심 팀을 추가하면 홈 상단에<br/>해당 팀 경기가 우선 노출됩니다.</div>
                <Btn size="sm">팀 둘러보기 →</Btn>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {teams.map((t,i)=>(
                  <div key={t.name} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:9,background:C.elevated,border:`1px solid ${C.border}`}}>
                    <span style={{fontSize:11,color:C.fg4,fontWeight:600,width:18}}>#{i+1}</span>
                    <div style={{width:36,height:36,borderRadius:8,background:`${t.color}33`,border:`1px solid ${t.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{t.sport}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700}}>{t.name}</div>
                      <div style={{fontSize:10,color:C.fg3}}>다음 경기 · {t.next}</div>
                    </div>
                    <button style={{background:'none',border:'none',color:C.fg4,cursor:'pointer',fontSize:14}}>⋮⋮</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My tickets */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700}}>내 티켓 <span style={{color:C.fg4,fontWeight:400}}>· 최근 3건</span></div>
              <button style={{background:'none',border:'none',color:C.teal,fontSize:11,fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>전체 보기 →</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {tickets.map((t,i)=>{
                const cancel = t.status==='CANCELLED';
                return (
                  <div key={i} style={{padding:'12px 14px',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:9,opacity:cancel?0.6:1}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                      <div style={{fontSize:13,fontWeight:700,textDecoration:cancel?'line-through':'none'}}>{t.match}</div>
                      <Badge variant={cancel?'red':'green'}>{cancel?'취소':'예매 완료'}</Badge>
                    </div>
                    <div style={{fontSize:11,color:C.fg3}}>📅 {t.date} · 💺 {t.seat}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Account row */}
        <div style={{marginTop:18,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>계정 설정</div>
            <div style={{fontSize:11,color:C.fg3}}>닉네임·이메일 변경 · 알림 채널 · 회원 탈퇴</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn variant="ghost" size="sm">설정으로 →</Btn>
            <Btn variant="ghost" size="sm" style={{color:C.error,borderColor:'rgba(239,68,68,0.3)'}}>회원 탈퇴</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 5. EMPTY / ERROR STATES ── */
function StateCard({icon, color, title, desc, action, secondary}) {
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,padding:32,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',maxWidth:380}}>
        <div style={{width:84,height:84,margin:'0 auto 22px',borderRadius:'50%',background:`${color}18`,border:`1.5px solid ${color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36}}>{icon}</div>
        <h2 style={{fontSize:18,fontWeight:800,color:C.fg1,marginBottom:8,letterSpacing:'-0.01em'}}>{title}</h2>
        <p style={{fontSize:13,color:C.fg3,lineHeight:1.6,marginBottom:24}}>{desc}</p>
        <div style={{display:'flex',gap:8,justifyContent:'center'}}>
          {action && <Btn>{action}</Btn>}
          {secondary && <Btn variant="ghost">{secondary}</Btn>}
        </div>
      </div>
    </div>
  );
}
function EmptyState({kind}) {
  const map = {
    games:{icon:'🏟️',color:C.teal, title:'아직 예매 가능한 경기가 없어요', desc:'관심 팀을 추가하면 새 경기가 오픈될 때\n알림으로 알려드립니다.', action:'관심 팀 추가', secondary:'전체 일정'},
    notif:{icon:'🔕',color:C.fg3,  title:'새로운 알림이 없습니다', desc:'경기 오픈·결제·멘션 알림이\n도착하면 여기에 표시됩니다.', secondary:'알림 설정'},
    chat:{icon:'💬',color:C.purple,title:'아직 대화가 시작되지 않았어요', desc:'이 채널의 첫 메시지를 남겨보세요.\n팬들과 함께 응원하는 공간입니다.', action:'첫 메시지 쓰기'},
    loading:{icon:'⏳',color:C.warning,title:'대기열에 진입 중...', desc:'대기 순번을 가져오는 중입니다.\n잠시만 기다려 주세요.'},
  };
  if (kind==='loading') {
    return (
      <div style={{width:'100%',height:'100%',background:C.dark,padding:32,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:60,height:60,margin:'0 auto 22px',borderRadius:'50%',border:`3px solid ${C.elevated}`,borderTopColor:C.teal,animation:'spin 0.9s linear infinite'}}></div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:8,color:C.fg1}}>대기열에 진입 중...</h2>
          <p style={{fontSize:13,color:C.fg3,lineHeight:1.6}}>대기 순번을 가져오는 중입니다.<br/>잠시만 기다려 주세요.</p>
          <div style={{marginTop:20,display:'inline-flex',gap:6,padding:'5px 12px',background:C.card,border:`1px solid ${C.border}`,borderRadius:9999,fontSize:10,color:C.fg4}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:C.teal,animation:'pulse 1s ease infinite'}}></span> SSE 연결 중
          </div>
        </div>
      </div>
    );
  }
  const m = map[kind];
  return <StateCard {...m} desc={m.desc.split('\n').map((l,i)=><span key={i}>{l}<br/></span>)} />;
}
function ErrorState({kind}) {
  const map = {
    payment:{icon:'❌',color:C.error,title:'결제에 실패했습니다', desc:'카드 한도를 초과했거나 일시적인 오류가 발생했어요.\n다른 결제 수단으로 다시 시도해 주세요.', action:'다시 결제', secondary:'고객센터'},
    timeout:{icon:'⏱',color:C.warning,title:'대기 시간이 만료되었어요', desc:'네트워크 단절로 대기열에서 이탈했습니다.\n다시 줄을 서야 합니다.', action:'대기열 재진입', secondary:'홈으로'},
    seat:{icon:'⚠️',color:C.warning,title:'이미 다른 분이 선택한 좌석입니다', desc:'좌석을 선점하기 직전에 다른 사용자가\n먼저 선택했어요. 다른 좌석을 선택해 주세요.', action:'좌석 다시 보기'},
  };
  const m = map[kind];
  return <StateCard {...m} desc={m.desc.split('\n').map((l,i)=><span key={i}>{l}<br/></span>)} />;
}

/* ── 6. MOBILE BREAKPOINTS ── */
function MobileShell({children, active='home'}) {
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <div style={{height:36,background:C.dark,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 18px',fontSize:11,fontWeight:600,flexShrink:0}}>
        <span>9:41</span><span style={{display:'flex',gap:5}}>● ● ● ▮</span>
      </div>
      <div style={{padding:'10px 16px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:22,height:22,borderRadius:5,background:`linear-gradient(135deg,${C.teal},${C.deep})`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff',fontSize:11}}>S</div>
          <span style={{fontWeight:800,fontSize:14,color:C.teal}}>Sportify</span>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{position:'relative'}}><span style={{fontSize:15}}>🔔</span><div style={{position:'absolute',top:-2,right:-2,width:7,height:7,borderRadius:'50%',background:C.error}}></div></div>
          <div style={{width:26,height:26,borderRadius:'50%',background:C.elevated,border:`1.5px solid ${C.teal}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:C.teal}}>K</div>
        </div>
      </div>
      <div style={{flex:1,overflow:'auto'}}>{children}</div>
      <div style={{display:'flex',borderTop:`1px solid ${C.border}`,background:C.card,flexShrink:0}}>
        {[{id:'home',i:'🏟️',l:'홈'},{id:'tickets',i:'🎫',l:'티켓'},{id:'chat',i:'💬',l:'채팅'},{id:'me',i:'👤',l:'마이'}].map(t=>(
          <div key={t.id} style={{flex:1,padding:'8px 0 12px',display:'flex',flexDirection:'column',alignItems:'center',gap:3,color:active===t.id?C.teal:C.fg4}}>
            <span style={{fontSize:18,filter:active===t.id?'none':'grayscale(0.5)'}}>{t.i}</span>
            <span style={{fontSize:9,fontWeight:active===t.id?700:500}}>{t.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function MobileHome() {
  return (
    <MobileShell active="home">
      <div style={{padding:'14px 16px'}}>
        <h1 style={{fontSize:20,fontWeight:800,letterSpacing:'-0.02em',marginBottom:4}}>오늘의 경기</h1>
        <p style={{fontSize:11,color:C.fg3,marginBottom:14}}>관심 팀 3개 · 8경기 예매 가능</p>
        <div style={{display:'flex',gap:6,overflow:'auto',marginBottom:14}}>
          {['전체','⚾','⚽','🏀'].map((s,i)=>(<span key={s} style={{padding:'5px 12px',borderRadius:9999,fontSize:11,fontWeight:600,background:i===0?C.teal:C.card,color:i===0?C.deep:C.fg3,border:`1px solid ${i===0?C.teal:C.border}`,whiteSpace:'nowrap'}}>{s}</span>))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {matches.slice(0,3).map(m=>{
            const sm=sportMeta[m.sport];
            return (
              <div key={m.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,overflow:'hidden'}}>
                <div style={{background:`linear-gradient(135deg,${sm.color}22,${sm.color}33)`,padding:'8px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${sm.color}33`}}>
                  <span style={{fontSize:18}}>{sm.icon}</span>
                  <Badge variant={sm.badge}>{sm.label}</Badge>
                </div>
                <div style={{padding:'11px 12px'}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:5}}>{m.home} <span style={{color:C.fg4,fontWeight:400}}>vs</span> {m.away}</div>
                  <div style={{fontSize:10,color:C.fg3,marginBottom:8}}>📅 {m.date} {m.time} · 📍 {m.venue}</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:14,fontWeight:800,color:C.teal}}>₩{m.price.toLocaleString()}~</span>
                    <Badge variant={m.seats<20?'yellow':'green'}>{m.seats<20?'마감 임박':'예매 가능'}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
function MobileQueue() {
  return (
    <MobileShell active="home">
      <div style={{padding:24,textAlign:'center'}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:C.fg4,textTransform:'uppercase',marginBottom:12}}>실시간 대기열</div>
        <div style={{fontSize:11,color:C.fg3,marginBottom:18}}>⚾ KT Wiz vs 두산 · 06.15</div>
        <div style={{margin:'0 auto 16px',width:130,height:130,borderRadius:'50%',border:`3px solid ${C.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative'}}>
          <div style={{position:'absolute',inset:0,borderRadius:'50%',border:`3px solid ${C.teal}`,clipPath:'inset(0 47% 0 0 round 50%)'}}></div>
          <div style={{fontSize:36,fontWeight:800,color:C.teal,lineHeight:1}}>247</div>
          <div style={{fontSize:10,color:C.fg3}}>대기 순번</div>
        </div>
        <div style={{background:C.elevated,borderRadius:9999,height:5,margin:'0 0 8px',overflow:'hidden'}}>
          <div style={{height:'100%',background:C.teal,borderRadius:9999,width:'53%'}}></div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:C.fg4,marginBottom:18}}><span>전체 1,843명</span><span>53%</span></div>
        <div style={{background:C.elevated,borderRadius:9,padding:'10px 14px',marginBottom:14,fontSize:12,display:'flex',justifyContent:'space-between'}}><span style={{color:C.fg3}}>예상 대기</span><span style={{fontWeight:700,color:C.warning}}>약 16분</span></div>
        <div style={{fontSize:11,color:C.fg4,lineHeight:1.6,background:C.elevated,borderRadius:8,padding:'9px 12px',textAlign:'left'}}>💡 창을 닫아도 30초 내 재접속하면 순번 유지</div>
      </div>
    </MobileShell>
  );
}
function MobileChat() {
  const msgs = [
    {u:'김개발',c:C.teal,t:'오늘 경기 누가 봐요? ⚾',me:false},
    {u:'이디자인',c:C.purple,t:'저 3루측 2장 있어요 🙌',me:false},
    {u:'나',c:C.teal,t:'저도 갈게요!',me:true},
    {u:'박운영',c:C.red,t:'단톡방 만들까요?',me:false},
  ];
  return (
    <MobileShell active="chat">
      <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:13,fontWeight:700}}># general</span>
        <Badge variant="green" style={{fontSize:9,padding:'2px 6px'}}>247명</Badge>
      </div>
      <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:8}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',gap:7,flexDirection:m.me?'row-reverse':'row'}}>
            <div style={{width:24,height:24,borderRadius:'50%',background:`${m.c}33`,border:`1px solid ${m.c}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:m.c,flexShrink:0}}>{m.u[0]}</div>
            <div style={{maxWidth:'72%'}}>
              <div style={{fontSize:9,fontWeight:700,color:m.c,marginBottom:2,textAlign:m.me?'right':'left'}}>{m.u}</div>
              <div style={{background:m.me?'rgba(93,187,160,0.12)':C.elevated,border:`1px solid ${m.me?'rgba(93,187,160,0.25)':C.border}`,borderRadius:m.me?'10px 2px 10px 10px':'2px 10px 10px 10px',padding:'6px 10px',fontSize:11,lineHeight:1.5}}>{m.t}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:'8px 12px',borderTop:`1px solid ${C.border}`,display:'flex',gap:6,position:'sticky',bottom:0,background:C.dark}}>
        <div style={{flex:1,padding:'7px 12px',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:9999,fontSize:11,color:C.fg4}}>메시지 입력...</div>
        <button style={{width:34,height:34,borderRadius:'50%',background:C.teal,color:C.deep,border:'none',fontSize:14,fontWeight:700}}>↑</button>
      </div>
    </MobileShell>
  );
}
function TabletHome() {
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <NavBar active="home" showBell />
      <div style={{flex:1,padding:'20px 24px',overflow:'auto'}}>
        <div style={{background:`linear-gradient(135deg,${C.deep},#1a2840)`,border:`1px solid ${C.border}`,borderRadius:14,padding:'24px 28px',marginBottom:20,position:'relative'}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',color:C.teal,textTransform:'uppercase',marginBottom:8}}>2025 시즌 · SPORTIFY</div>
          <h1 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.03em',marginBottom:8,lineHeight:1.2}}>야구 · 축구 · 농구 한 곳에서</h1>
          <p style={{color:C.fg3,fontSize:12,marginBottom:14}}>실시간 대기열 · 좌석 선택 · 결제까지 원스톱</p>
          <Btn>대기열 입장 →</Btn>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
          {matches.map(m=>{
            const sm=sportMeta[m.sport];
            return (
              <div key={m.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
                <div style={{background:`linear-gradient(135deg,${sm.color}22,${sm.color}33)`,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${sm.color}33`}}>
                  <span style={{fontSize:22}}>{sm.icon}</span>
                  <Badge variant={sm.badge}>{sm.label}</Badge>
                </div>
                <div style={{padding:'12px 14px'}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:5}}>{m.home} <span style={{color:C.fg4,fontWeight:400}}>vs</span> {m.away}</div>
                  <div style={{fontSize:11,color:C.fg3,marginBottom:8}}>📅 {m.date} {m.time}</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:15,fontWeight:800,color:C.teal}}>₩{m.price.toLocaleString()}~</span>
                    <Badge variant={m.seats<20?'yellow':'green'}>{m.seats<20?'마감 임박':'예매 가능'}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── 7. ANNOTATED MOCKS ── */
function HomeAnnotated() {
  return (
    <div style={{width:'100%',height:'100%',position:'relative',background:'#0a0c14'}}>
      <div style={{position:'absolute',inset:'0 60px 0 0'}}>
        <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
          <NavBar active="home" showBell />
          <div style={{flex:1,padding:'24px 32px',overflow:'hidden'}}>
            <div style={{background:`linear-gradient(135deg,${C.deep},#1a2840)`,border:`1px solid ${C.border}`,borderRadius:14,padding:'28px 36px',marginBottom:24,position:'relative'}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',color:C.teal,textTransform:'uppercase',marginBottom:8}}>2025 시즌</div>
              <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-0.03em',marginBottom:8}}>야구 · 축구 · 농구</h1>
              <p style={{color:C.fg3,fontSize:13,marginBottom:14}}>실시간 대기열 · 좌석 선택 · 결제까지 원스톱</p>
              <div style={{display:'flex',gap:8}}><Btn>대기열 입장</Btn><Btn variant="secondary">일정 보기</Btn></div>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:18}}>
              {['전체','⚾ 야구','⚽ 축구','🏀 농구'].map((s,i)=>(<span key={s} style={{padding:'5px 12px',borderRadius:9999,fontSize:11,fontWeight:600,background:i===0?C.teal:C.card,color:i===0?C.deep:C.fg3,border:`1px solid ${i===0?C.teal:C.border}`}}>{s}</span>))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
              {matches.slice(0,3).map(m=>{
                const sm=sportMeta[m.sport];
                return (
                  <div key={m.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10}}>
                    <div style={{background:`linear-gradient(135deg,${sm.color}22,${sm.color}33)`,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${sm.color}33`}}>
                      <span style={{fontSize:22}}>{sm.icon}</span><Badge variant={sm.badge}>{sm.label}</Badge>
                    </div>
                    <div style={{padding:'12px 14px'}}>
                      <div style={{fontWeight:700,fontSize:13,marginBottom:5}}>{m.home} <span style={{color:C.fg4,fontWeight:400}}>vs</span> {m.away}</div>
                      <div style={{fontSize:11,color:C.fg3,marginBottom:10}}>📅 {m.date} {m.time}</div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <span style={{fontSize:15,fontWeight:800,color:C.teal}}>₩{m.price.toLocaleString()}~</span>
                        <Badge variant={m.seats<20?'yellow':'green'}>{m.seats<20?'마감 임박':'예매 가능'}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* annotation panel */}
      <div style={{position:'absolute',top:80,right:14,width:280,display:'flex',flexDirection:'column',gap:10}}>
        {[
          {n:'A',t:'Sticky NavBar',d:'스크롤 시 backdrop-blur로 고정 · 활성 탭은 teal underline'},
          {n:'B',t:'Hero CTA',d:'Primary teal · hover 시 12% lighten + 4px lift, transition 200ms'},
          {n:'C',t:'Filter chips',d:'Single-select · 선택 시 teal bg → deep text, 다른 종목은 ghost'},
          {n:'D',t:'Match Card',d:'Hover 시 teal border + 0 0 20px glow · 매진/곧 시작 카드는 60% opacity, 클릭 비활성'},
          {n:'E',t:'Status Badge',d:'잔여 0 = 매진(gray) · <20 = 마감 임박(yellow) · 그 외 예매 가능(green)'},
        ].map(a=>(
          <div key={a.n} style={{background:'rgba(93,187,160,0.1)',border:`1px solid ${C.teal}55`,borderRadius:8,padding:'9px 11px'}}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
              <div style={{width:20,height:20,borderRadius:'50%',background:C.teal,color:C.deep,fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{a.n}</div>
              <div style={{fontSize:11,fontWeight:700,color:C.fg1}}>{a.t}</div>
            </div>
            <div style={{fontSize:10,color:C.fg3,lineHeight:1.5,paddingLeft:27}}>{a.d}</div>
          </div>
        ))}
        <div style={{marginTop:6,padding:10,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,fontSize:10,color:C.fg3,lineHeight:1.6}}>
          <div style={{fontWeight:700,color:C.fg2,marginBottom:4,fontSize:11}}>📱 Breakpoints</div>
          • Desktop ≥1100: 3-col grid<br/>
          • Tablet 768–1099: 2-col<br/>
          • Mobile &lt;768: 1-col, sticky bottom-nav 등장
        </div>
      </div>
    </div>
  );
}

function QueueAnnotated() {
  return (
    <div style={{width:'100%',height:'100%',position:'relative',background:'#0a0c14',display:'flex'}}>
      <div style={{flex:1,background:C.dark,position:'relative'}}>
        <NavBar active="home" showBell />
        <div style={{padding:'40px 28px',display:'flex',justifyContent:'center'}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:32,width:440,textAlign:'center',color:C.fg1}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.08em',color:C.fg4,textTransform:'uppercase',marginBottom:14}}>실시간 대기열</div>
            <div style={{fontSize:13,color:C.fg3,marginBottom:6}}>⚾ KT Wiz vs 두산 · 06.15 18:30</div>
            <div style={{margin:'22px auto',width:130,height:130,borderRadius:'50%',border:`3px solid ${C.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative'}}>
              <div style={{position:'absolute',inset:0,borderRadius:'50%',border:`3px solid ${C.teal}`,clipPath:'inset(0 47% 0 0 round 50%)'}}></div>
              <div style={{fontSize:36,fontWeight:800,color:C.teal,lineHeight:1}}>247</div>
              <div style={{fontSize:11,color:C.fg3}}>대기 순번</div>
            </div>
            <div style={{background:C.elevated,borderRadius:9999,height:6,margin:'0 0 10px',overflow:'hidden'}}><div style={{height:'100%',background:C.teal,borderRadius:9999,width:'53%'}}></div></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.fg4,marginBottom:18}}><span>전체 1,843명</span><span>53%</span></div>
            <div style={{background:C.elevated,borderRadius:9,padding:'10px 14px',fontSize:13,display:'flex',justifyContent:'space-between'}}><span style={{color:C.fg3}}>예상 대기</span><span style={{fontWeight:700,color:C.warning}}>약 16분</span></div>
          </div>
        </div>
      </div>
      {/* SSE flow + notes */}
      <div style={{width:380,padding:'24px 20px',background:'#0a0c14',color:C.fg1,display:'flex',flexDirection:'column',gap:14}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:C.teal,textTransform:'uppercase',marginBottom:6}}>Realtime · SSE</div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>대기열 데이터 흐름</div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,fontSize:11,fontFamily:'monospace',color:C.fg3,lineHeight:1.7}}>
            <div><span style={{color:C.teal}}>POST</span> /api/queue/enter</div>
            <div style={{color:C.fg4}}>→ Redis ZADD queue:gameId</div>
            <div style={{marginTop:6}}><span style={{color:C.warning}}>SSE</span> /api/queue/sse?token=xxx</div>
            <div style={{color:C.fg4}}>← {`{position: 247, total: 1843}`}</div>
            <div style={{color:C.fg4}}>← {`{position: 246, total: 1845}`}</div>
            <div style={{color:C.success}}>← {`{ready: true, sessionId}`}</div>
          </div>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Interaction notes</div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {[
              ['Live 업데이트','순번이 줄어들 때 progress bar는 transition: width 1s ease로 부드럽게'],
              ['Pulse ring','내 차례 임박(top 10) 시 원형 인디케이터에 pulse 애니메이션 추가'],
              ['이탈 보호','tab close 시 beacon으로 heartbeat · 30초 grace period 후 ZREM'],
              ['진입 완료','ready=true 도착 시 fadeIn으로 좌석 선택 화면 자동 이동, 15분 reservation TTL 표시'],
              ['에러 핸들','SSE 연결 끊기면 자동 재시도 3회 → 실패 시 Queue Timeout error state로'],
            ].map(([t,d])=>(
              <div key={t} style={{padding:'8px 11px',borderRadius:7,background:'rgba(93,187,160,0.08)',border:`1px solid ${C.teal}33`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.teal,marginBottom:2}}>• {t}</div>
                <div style={{fontSize:10,color:C.fg3,lineHeight:1.5}}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.SportifyScreens = {
  LoginScreen, LoginLoading,
  GameDetail, GameDetailAnnotated,
  BellDropdown,
  MyPage,
  EmptyState, ErrorState,
  MobileHome, MobileQueue, MobileChat, TabletHome,
  HomeAnnotated, QueueAnnotated,
};
