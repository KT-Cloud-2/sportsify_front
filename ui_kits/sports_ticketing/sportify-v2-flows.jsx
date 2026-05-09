/* Sportify v2 — Flows: Seat, Payment, Chat (list + room with intensity) */
const V2 = window.SportifyV2Core;
const { C, sportMeta, matches, Badge, Btn, Toggle, NavBar, Note } = V2;
const { useState: useS2 } = React;

/* ── SEAT SELECTION ── */
function SeatScreen({state='default'}) {
  // 8 cols × 10 rows grid, grouped into 3 sections
  const sections = [
    {label:'1루 응원석 (TEAM1)', side:'TEAM1', grade:'R', price:25000, color:'#ff8fa3', rows:5, taken:[3,8,12,17,21,25,30,33,38]},
    {label:'중앙 VIP', side:'NEUTRAL', grade:'VIP', price:50000, color:C.teal, rows:2, taken:[1,4,9,12]},
    {label:'3루 응원석 (TEAM2)', side:'TEAM2', grade:'S', price:21000, color:'#fdba74', rows:5, taken:[2,7,11,16,20,24,29,32,37]},
  ];
  const selected = [{sec:0,row:1,col:3,seatNo:'1루-B4'},{sec:0,row:2,col:4,seatNo:'1루-C5'}];
  const total = selected.length * sections[0].price;

  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <NavBar active="home" />
      {/* Reservation timer banner */}
      <div style={{background:state==='timeout'?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.1)',borderBottom:`1px solid ${state==='timeout'?C.error+'66':C.warning+'66'}`,padding:'10px 32px',display:'flex',alignItems:'center',gap:12,fontSize:12}}>
        <span style={{fontSize:16}}>{state==='timeout'?'⏱':'⏳'}</span>
        <span style={{color:state==='timeout'?C.error:C.warning,fontWeight:700}}>
          {state==='timeout' ? '예약 세션이 만료되었습니다' : '예약 세션 만료까지'}
        </span>
        {state!=='timeout' && <span style={{fontSize:18,fontWeight:800,color:C.warning,fontFamily:'monospace',letterSpacing:'0.05em'}}>14:32</span>}
        <span style={{marginLeft:'auto',fontSize:11,color:C.fg3}}>예약 ID: <span style={{fontFamily:'monospace',color:C.fg2}}>r-7f3a8c91</span></span>
      </div>

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        {/* Map */}
        <div style={{flex:1,padding:'24px 32px',overflow:'auto'}}>
          <div style={{fontSize:11,color:C.fg4,marginBottom:12}}>홈 · 게임 · <span style={{color:C.fg2}}>좌석 선택</span></div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div>
              <h1 style={{fontSize:20,fontWeight:800,marginBottom:4}}>좌석을 선택하세요</h1>
              <div style={{fontSize:12,color:C.fg3}}>최대 4매 · 선택 후 결제까지 15분</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {[
                {l:'예매 가능',c:C.success},{l:'다른 사용자 선점',c:C.warning},{l:'판매 완료',c:C.fg4},{l:'내 선택',c:C.teal},
              ].map(k=>(<div key={k.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:C.fg3}}><div style={{width:12,height:12,borderRadius:3,background:k.c}}></div>{k.l}</div>))}
            </div>
          </div>

          {/* Stage */}
          <div style={{textAlign:'center',padding:'8px 0 18px'}}>
            <div style={{display:'inline-block',padding:'6px 32px',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:9999,fontSize:11,color:C.fg3,letterSpacing:'0.15em'}}>FIELD ⚾</div>
          </div>

          {/* Sections */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {sections.map((sec,si)=>(
              <div key={si} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:10,height:10,borderRadius:3,background:sec.color}}></div>
                    <span style={{fontSize:13,fontWeight:700}}>{sec.label}</span>
                    <Badge variant="purple" size="sm">{sec.grade}</Badge>
                    <span style={{fontSize:11,color:C.fg4,fontFamily:'monospace'}}>team_side: {sec.side}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:C.teal}}>₩{sec.price.toLocaleString()}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(20,1fr)',gap:4}}>
                  {Array.from({length: sec.rows*20}).map((_,i)=>{
                    const isTaken = sec.taken.includes(i);
                    const isSelected = selected.some(s=>s.sec===si && (s.row*20+s.col)===i);
                    const isReserved = i % 23 === 0 && !isTaken;
                    const conflict = state==='conflict' && si===0 && i===24;
                    return (
                      <div key={i} style={{
                        aspectRatio:'1',
                        borderRadius:3,
                        background: conflict ? C.error : isSelected ? C.teal : isTaken ? C.fg4 : isReserved ? C.warning : sec.color+'aa',
                        border: isSelected ? `1.5px solid #fff` : 'none',
                        opacity: conflict ? 1 : isTaken ? 0.5 : 1,
                        cursor: isTaken||isReserved ? 'not-allowed' : 'pointer',
                        animation: conflict ? 'pulse 0.5s ease infinite' : 'none',
                      }}></div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div style={{width:340,borderLeft:`1px solid ${C.border}`,background:C.card,padding:'20px 22px',display:'flex',flexDirection:'column',overflow:'auto'}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>선택한 좌석 ({selected.length}/4)</div>
          {state==='conflict' ? (
            <div style={{padding:'14px 16px',background:'rgba(239,68,68,0.1)',border:`1px solid ${C.error}66`,borderRadius:10,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.error,marginBottom:6,display:'flex',alignItems:'center',gap:8}}>⚠️ 좌석 선점 충돌 (HTTP 409)</div>
              <div style={{fontSize:11,color:C.fg2,lineHeight:1.6,marginBottom:10}}>1루-D5 좌석을 선택하기 직전, 다른 사용자가 먼저 선택했어요. 다시 선택해 주세요.</div>
              <div style={{fontSize:10,color:C.fg4,fontFamily:'monospace',background:C.elevated,padding:'6px 9px',borderRadius:5}}>seat_status: AVAILABLE → RESERVED</div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
              {selected.map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:C.elevated,borderRadius:9,border:`1px solid ${C.border}`}}>
                  <div style={{width:32,height:32,borderRadius:6,background:'#ff8fa322',border:`1px solid #ff8fa355`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#ff8fa3'}}>R</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700}}>{s.seatNo}</div>
                    <div style={{fontSize:10,color:C.fg4}}>1루 응원석 · TEAM1</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:C.teal}}>₩25,000</div>
                  <button style={{background:'none',border:'none',color:C.fg4,cursor:'pointer',fontSize:13}}>✕</button>
                </div>
              ))}
              {Array.from({length:4-selected.length}).map((_,i)=>(
                <div key={i} style={{padding:'10px 12px',background:'transparent',borderRadius:9,border:`1px dashed ${C.border}`,fontSize:11,color:C.fg4,textAlign:'center'}}>좌석 추가 가능</div>
              ))}
            </div>
          )}

          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,marginTop:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:12,color:C.fg3}}><span>좌석 ({selected.length}매)</span><span>₩{total.toLocaleString()}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:14,fontSize:12,color:C.fg3}}><span>예매 수수료</span><span>₩1,000</span></div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><span style={{fontSize:13,fontWeight:700}}>총 결제 금액</span><span style={{fontSize:18,fontWeight:800,color:C.teal}}>₩{(total+1000).toLocaleString()}</span></div>
            <Btn size="lg" style={{width:'100%'}} disabled={state==='timeout'}>선택 확정 · 결제로 →</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PAYMENT ── */
function PaymentScreen({state='default'}) {
  const seats = [{n:'1루-B4',p:25000},{n:'1루-C5',p:25000}];
  const total = 51000;
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column',position:'relative'}}>
      <NavBar active="home" />
      <div style={{background:'rgba(245,158,11,0.1)',borderBottom:`1px solid ${C.warning}66`,padding:'10px 32px',display:'flex',alignItems:'center',gap:12,fontSize:12}}>
        <span style={{fontSize:14}}>⏳</span>
        <span style={{color:C.warning,fontWeight:700}}>결제 세션 만료까지</span>
        <span style={{fontSize:18,fontWeight:800,color:state==='timeout'?C.error:C.warning,fontFamily:'monospace'}}>{state==='timeout'?'00:00':'12:48'}</span>
        <span style={{marginLeft:'auto',fontSize:10,color:C.fg4,fontFamily:'monospace'}}>idempotency_key: pay-9c8f-2b1e</span>
      </div>

      <div style={{flex:1,padding:'32px 40px',display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,overflow:'auto'}}>
        {/* Method */}
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:22}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>결제 수단 선택</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
              {[
                {id:'CARD',label:'신용/체크카드',sub:'국내 모든 카드',icon:'💳',sel:true},
                {id:'KAKAO_PAY',label:'카카오페이',sub:'간편결제',icon:'🟡'},
                {id:'TOSS_PAY',label:'토스페이',sub:'간편결제',icon:'🔵'},
              ].map(m=>(
                <div key={m.id} style={{padding:18,borderRadius:11,background:m.sel?'rgba(93,187,160,0.1)':C.elevated,border:`1.5px solid ${m.sel?C.teal:C.border}`,cursor:'pointer',textAlign:'center'}}>
                  <div style={{fontSize:26,marginBottom:8}}>{m.icon}</div>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{m.label}</div>
                  <div style={{fontSize:10,color:C.fg4}}>{m.sub}</div>
                  <div style={{marginTop:8,fontSize:9,color:C.fg4,fontFamily:'monospace'}}>method: {m.id}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:22}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>카드 정보</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div>
                <label style={{fontSize:11,color:C.fg3,marginBottom:6,display:'block'}}>카드 번호</label>
                <div style={{padding:'11px 14px',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.fg2,fontFamily:'monospace'}}>•••• •••• •••• 4837</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div><label style={{fontSize:11,color:C.fg3,marginBottom:6,display:'block'}}>유효기간</label><div style={{padding:'11px 14px',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.fg2}}>05 / 28</div></div>
                <div><label style={{fontSize:11,color:C.fg3,marginBottom:6,display:'block'}}>CVC</label><div style={{padding:'11px 14px',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.fg2}}>•••</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:22,height:'fit-content',position:'sticky',top:0}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>주문 요약</div>
          <div style={{padding:'12px 14px',background:C.elevated,borderRadius:9,marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}><span style={{fontSize:18}}>⚾</span><span style={{fontSize:12,fontWeight:700}}>KT Wiz vs LG 트윈스</span></div>
            <div style={{fontSize:11,color:C.fg3}}>📅 06.18 19:00 · 📍 수원KT위즈파크</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:14}}>
            {seats.map((s,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span style={{color:C.fg2}}>💺 {s.n}</span><span>₩{s.p.toLocaleString()}</span></div>))}
          </div>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:6,display:'flex',justifyContent:'space-between',fontSize:12,color:C.fg3}}><span>소계</span><span>₩{total.toLocaleString()}</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:14,fontSize:12,color:C.fg3}}><span>수수료</span><span>₩1,000</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><span style={{fontSize:13,fontWeight:700}}>총 결제 금액</span><span style={{fontSize:20,fontWeight:800,color:C.teal}}>₩{(total+1000).toLocaleString()}</span></div>
          <Btn size="lg" style={{width:'100%'}} disabled={state==='processing'||state==='timeout'}>{state==='processing'?'처리 중...':'₩52,000 결제하기'}</Btn>
          <div style={{marginTop:10,fontSize:10,color:C.fg4,textAlign:'center'}}>결제 확정 후 환불은 마이페이지에서 가능합니다.</div>
        </div>
      </div>

      {state==='processing' && (
        <div style={{position:'absolute',inset:0,background:'rgba(10,12,20,0.85)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'36px 48px',textAlign:'center',width:380}}>
            <div style={{width:54,height:54,margin:'0 auto 18px',borderRadius:'50%',border:`3px solid ${C.elevated}`,borderTopColor:C.teal,animation:'spin 0.9s linear infinite'}}></div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>결제 진행 중입니다</div>
            <div style={{fontSize:11,color:C.fg3,lineHeight:1.6}}>창을 닫거나 새로고침하지 마세요.<br/>중복 결제 방지를 위해 idempotency key가 적용됩니다.</div>
            <div style={{marginTop:18,display:'flex',gap:6,justifyContent:'center'}}>
              {['요청','검증','승인','웹훅'].map((s,i)=>(
                <div key={s} style={{padding:'4px 8px',borderRadius:9999,background:C.elevated,border:`1px solid ${i<2?C.teal+'55':C.border}`,fontSize:10,color:i<2?C.teal:C.fg4}}>{i<2?'✓':'•'} {s}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentResult({kind='success'}) {
  const map = {
    success:{icon:'✓',color:C.success,title:'결제가 완료되었습니다',sub:'티켓 2매가 발급되었습니다. 마이 페이지에서 QR을 확인하세요.',btn:'내 티켓 보기',btn2:'홈으로'},
    fail:   {icon:'✕',color:C.error,title:'결제에 실패했습니다',sub:'카드 한도를 초과했거나 PG에서 거절되었습니다.\n다른 결제 수단으로 다시 시도해 주세요.',btn:'다시 결제',btn2:'고객센터',code:'PG_DECLINED'},
    timeout:{icon:'⏱',color:C.warning,title:'결제 시간이 만료되었습니다',sub:'15분 내에 결제가 완료되지 않아 좌석 예약이 해제되었습니다.\n좌석은 다시 선택해야 합니다.',btn:'다시 시도',btn2:'홈으로',code:'RESERVATION_EXPIRED'},
  }[kind];
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <NavBar active="home" />
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:32}}>
        <div style={{textAlign:'center',maxWidth:420}}>
          <div style={{width:96,height:96,margin:'0 auto 24px',borderRadius:'50%',background:`${map.color}18`,border:`2px solid ${map.color}66`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:46,color:map.color}}>{map.icon}</div>
          <h2 style={{fontSize:22,fontWeight:800,marginBottom:10,letterSpacing:'-0.02em'}}>{map.title}</h2>
          <p style={{fontSize:13,color:C.fg3,lineHeight:1.7,marginBottom:18,whiteSpace:'pre-line'}}>{map.sub}</p>
          {kind==='success' && (
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:18,marginBottom:22,textAlign:'left'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:11}}><span style={{color:C.fg4}}>티켓 번호</span><span style={{fontFamily:'monospace',color:C.teal}}>KTS-2025-0618-7F3A</span></div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:11}}><span style={{color:C.fg4}}>경기</span><span>KT Wiz vs LG · 06.18 19:00</span></div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:11}}><span style={{color:C.fg4}}>좌석</span><span>1루-B4, 1루-C5</span></div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}><span style={{color:C.fg4}}>결제</span><span style={{color:C.success}}>₩52,000 · CARD</span></div>
            </div>
          )}
          {map.code && <div style={{display:'inline-block',marginBottom:18,fontSize:10,fontFamily:'monospace',color:C.fg4,padding:'4px 10px',background:C.card,borderRadius:6,border:`1px solid ${C.border}`}}>error_code: {map.code}</div>}
          <div style={{display:'flex',gap:8,justifyContent:'center'}}>
            <Btn>{map.btn}</Btn>
            <Btn variant="ghost">{map.btn2}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CHAT — Room list + Room detail with intensity meter, CHEER messages, in-room toggle ── */
function ChatScreen({state='default'}) {
  const rooms = [
    {id:'g-1', type:'GAME', name:'KT Wiz vs LG · 06.18', members:847,unread:12,active:true,notif:true},
    {id:'g-2', type:'GAME', name:'KT Wiz vs 두산 · 06.15',members:412,unread:0, notif:true},
    {id:'t-1', type:'TEAM', name:'KT Wiz 팬방',         members:5238,unread:3, notif:false},
    {id:'t-2', type:'TEAM', name:'수원 FC 팬방',        members:1284,unread:0, notif:true},
    {id:'pr-1',type:'GROUP',name:'야구 직관 친구들',     members:6,  unread:1, notif:true},
    {id:'pr-2',type:'PRIVATE',name:'@김개발',            members:2,  unread:0, notif:false},
  ];
  const messages = [
    {u:'system',t:'system',c:'박정훈님이 입장했습니다',time:'19:42'},
    {u:'이디자인',color:C.purple,t:'msg',c:'오늘 1회초 시작했어요!',time:'19:43',mine:false},
    {u:'박운영',color:C.red,t:'cheer',c:'KT GO!! 🔥🔥🔥',time:'19:43',mine:false},
    {u:'김개발',color:C.teal,t:'msg',c:'@이디자인 점수 어떻게 됐어요?',time:'19:44',mine:false,mention:'이디자인'},
    {u:'이디자인',color:C.purple,t:'msg',c:'2-1로 KT 리드 중이에요!',time:'19:45',mine:false},
    {u:'나',color:C.teal,t:'msg',c:'와 이거 직관 안 가서 후회되네요 ㅠ',time:'19:46',mine:true},
    {u:'박운영',color:C.red,t:'cheer',c:'이번 회 홈런 가즈아 ⚾💥',time:'19:47',mine:false},
    {u:'system',t:'system',c:'홍준영님이 입장했습니다',time:'19:48'},
  ];
  return (
    <div style={{width:'100%',height:'100%',background:C.dark,color:C.fg1,display:'flex',flexDirection:'column'}}>
      <NavBar active="chat" />
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        {/* Room list */}
        <div style={{width:320,borderRight:`1px solid ${C.border}`,background:C.card,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'16px 18px',borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <span style={{fontSize:15,fontWeight:800}}>채팅방</span>
              <button style={{background:'none',border:'none',color:C.fg3,fontSize:14,cursor:'pointer'}}>+</button>
            </div>
            <div style={{padding:'7px 12px',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11,color:C.fg4}}>🔍 채팅방 검색</div>
          </div>
          <div style={{flex:1,overflow:'auto'}}>
            {['GAME','TEAM','OTHER'].map(g=>(
              <div key={g}>
                <div style={{padding:'10px 18px 6px',fontSize:10,fontWeight:700,color:C.fg4,textTransform:'uppercase',letterSpacing:'0.06em'}}>{g==='GAME'?'경기 채팅':g==='TEAM'?'팀 채팅':'개인·그룹'}</div>
                {rooms.filter(r=>g==='GAME'?r.type==='GAME':g==='TEAM'?r.type==='TEAM':['PRIVATE','GROUP'].includes(r.type)).map(r=>(
                  <div key={r.id} style={{padding:'10px 18px',display:'flex',alignItems:'center',gap:10,background:r.active?'rgba(93,187,160,0.06)':'transparent',borderLeft:r.active?`3px solid ${C.teal}`:'3px solid transparent',cursor:'pointer'}}>
                    <div style={{width:34,height:34,borderRadius:9,background:C.elevated,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{r.type==='GAME'?'⚾':r.type==='TEAM'?'🏟️':r.type==='GROUP'?'👥':'👤'}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{fontSize:12,fontWeight:r.unread?700:600,color:C.fg1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.name}</div>
                        <Badge variant={r.type==='GAME'?'red':r.type==='TEAM'?'blue':'purple'} size="sm">{r.type}</Badge>
                      </div>
                      <div style={{fontSize:10,color:C.fg4,marginTop:1}}>{r.members.toLocaleString()}명 참여 중</div>
                    </div>
                    {/* Per-room notification bell — chat_participants.notification_enabled */}
                    <div title="채팅방별 알림" style={{cursor:'pointer',color:r.notif?C.teal:C.fg4,fontSize:13}}>{r.notif?'🔔':'🔕'}</div>
                    {r.unread>0 && <div style={{minWidth:18,height:18,padding:'0 5px',borderRadius:9999,background:C.error,color:'#fff',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{r.unread}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Room view */}
        <div style={{flex:1,display:'flex',flexDirection:'column',background:C.dark}}>
          {/* Header */}
          <div style={{padding:'14px 24px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:38,height:38,borderRadius:10,background:C.elevated,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>⚾</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14,fontWeight:700}}>KT Wiz vs LG 트윈스 · 06.18</span>
                <Badge variant="red" size="sm">GAME</Badge>
                <Badge variant="green" size="sm"><span style={{width:5,height:5,borderRadius:'50%',background:C.success,display:'inline-block'}}></span> LIVE</Badge>
              </div>
              <div style={{fontSize:11,color:C.fg4,marginTop:2}}>847명 참여 · 분당 38메시지</div>
            </div>
            {/* Chat intensity meter */}
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',background:C.card,border:`1px solid ${C.border}`,borderRadius:9}}>
              <span style={{fontSize:10,fontWeight:700,color:C.fg4,textTransform:'uppercase',letterSpacing:'0.05em'}}>응원 강도</span>
              <div style={{display:'flex',alignItems:'flex-end',gap:2,height:20}}>
                {[0.4,0.7,0.9,0.6,1.0,0.85,0.75,0.95].map((h,i)=>(<div key={i} style={{width:3,height:`${h*100}%`,background:i<5?C.success:C.warning,borderRadius:1}}></div>))}
              </div>
              <span style={{fontSize:11,fontWeight:700,color:C.warning}}>HOT</span>
            </div>
            {/* In-room notification toggle */}
            <button title="이 채팅방 알림" style={{padding:8,borderRadius:9,background:C.elevated,border:`1px solid ${C.teal}66`,color:C.teal,cursor:'pointer',fontSize:14}}>🔔</button>
            <button style={{padding:8,borderRadius:9,background:C.elevated,border:`1px solid ${C.border}`,color:C.fg3,cursor:'pointer',fontSize:14}}>⋯</button>
          </div>

          {/* Disconnected banner */}
          {state==='disconnected' && (
            <div style={{padding:'10px 24px',background:'rgba(245,158,11,0.1)',borderBottom:`1px solid ${C.warning}66`,fontSize:11,color:C.warning,display:'flex',alignItems:'center',gap:10}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:C.warning,animation:'pulse 0.8s ease infinite'}}></span>
              WebSocket 연결이 끊어졌습니다. 자동 재연결 중... (3/5회)
              <button style={{marginLeft:'auto',background:'none',border:'none',color:C.warning,cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit'}}>지금 재연결</button>
            </div>
          )}

          {/* Messages */}
          <div style={{flex:1,padding:'18px 24px',display:'flex',flexDirection:'column',gap:8,overflow:'auto'}}>
            {messages.map((m,i)=>{
              if (m.t==='system') return <div key={i} style={{textAlign:'center',fontSize:10,color:C.fg4,padding:'4px 0'}}>· {m.c} · {m.time}</div>;
              if (m.t==='cheer') return (
                <div key={i} style={{alignSelf:m.mine?'flex-end':'flex-start',maxWidth:'70%'}}>
                  {!m.mine && <div style={{fontSize:10,fontWeight:700,color:m.color,marginBottom:3,paddingLeft:34}}>{m.u}</div>}
                  <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                    {!m.mine && <div style={{width:26,height:26,borderRadius:'50%',background:`${m.color}33`,border:`1px solid ${m.color}66`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:m.color,flexShrink:0}}>{m.u[0]}</div>}
                    <div style={{padding:'8px 14px',borderRadius:'10px 10px 10px 4px',background:`linear-gradient(135deg,${C.warning}33,${C.error}22)`,border:`1px solid ${C.warning}66`,fontSize:14,fontWeight:700,color:'#fff',display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:9,fontWeight:800,padding:'1px 6px',borderRadius:9999,background:'rgba(245,158,11,0.3)',color:'#fbbf24',letterSpacing:'0.05em'}}>CHEER</span>
                      {m.c}
                    </div>
                  </div>
                </div>
              );
              return (
                <div key={i} style={{alignSelf:m.mine?'flex-end':'flex-start',maxWidth:'68%'}}>
                  {!m.mine && <div style={{fontSize:10,fontWeight:700,color:m.color,marginBottom:3,paddingLeft:34}}>{m.u}</div>}
                  <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                    {!m.mine && <div style={{width:26,height:26,borderRadius:'50%',background:`${m.color}33`,border:`1px solid ${m.color}66`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:m.color,flexShrink:0}}>{m.u[0]}</div>}
                    <div style={{padding:'8px 12px',borderRadius:m.mine?'12px 4px 12px 12px':'4px 12px 12px 12px',background:m.mine?'rgba(93,187,160,0.18)':C.elevated,border:`1px solid ${m.mine?'rgba(93,187,160,0.35)':C.border}`,fontSize:13,lineHeight:1.5}}>
                      {m.mention ? <>@{m.mention} <span style={{background:'rgba(245,158,11,0.2)',padding:'0 4px',borderRadius:3,color:C.warning,fontWeight:600}}>mention</span> {m.c.replace(/@\S+/,'').trim()}</> : m.c}
                    </div>
                    <span style={{fontSize:9,color:C.fg4,whiteSpace:'nowrap',marginBottom:4}}>{m.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{padding:'12px 20px',borderTop:`1px solid ${C.border}`,display:'flex',gap:8,alignItems:'center'}}>
            <button style={{padding:'8px 12px',borderRadius:9,background:C.elevated,border:`1px solid ${C.border}`,color:C.fg3,cursor:'pointer',fontSize:14}}>📎</button>
            <button style={{padding:'8px 12px',borderRadius:9,background:C.elevated,border:`1px solid ${C.border}`,color:C.fg3,cursor:'pointer',fontSize:14}}>📷</button>
            <div style={{flex:1,padding:'10px 14px',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:9,fontSize:12,color:C.fg4}}>메시지 입력 · @ 멘션 · /cheer 응원 메시지</div>
            <button style={{padding:'10px 16px',borderRadius:9,background:C.warning,border:'none',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>📣 CHEER</button>
            <button style={{padding:'10px 18px',borderRadius:9,background:C.teal,border:'none',color:C.tealDeep,fontSize:13,fontWeight:700,cursor:'pointer'}}>전송</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SportifyV2Flows = { SeatScreen, PaymentScreen, PaymentResult, ChatScreen };
