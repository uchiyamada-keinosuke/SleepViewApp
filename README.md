<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>睡眠ステージ × 室温・湿度ビューア</title>
<style>
  :root{
    --bg:#0e1621;--panel:#161f2c;--panel2:#111a26;--grid:#243040;
    --ink:#e8eef6;--muted:#8ea0b4;--faint:#5b6b7e;
    --room:#ff9d5c;--out:#57c7ec;--roomH:#5fd39b;--outH:#b18cff;--core:#4f9dff;
  }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{margin:0;background:var(--bg);color:var(--ink);
    font-family:-apple-system,"Hiragino Kaku Gothic ProN","Noto Sans JP",system-ui,sans-serif;
    padding:16px 14px 40px;line-height:1.55}
  .wrap{max-width:780px;margin:0 auto}
  .top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
  h1{font-size:18px;font-weight:700;margin:0 0 2px}
  .sub{font-size:12px;color:var(--muted);margin:0 0 14px}
  a.logout{font-size:11.5px;color:var(--muted);text-decoration:none;border:1px solid var(--grid);
    border-radius:20px;padding:6px 12px;white-space:nowrap}

  .datebar{display:flex;align-items:center;gap:8px;margin-bottom:12px}
  .navb{background:var(--panel);border:1px solid var(--grid);border-radius:10px;color:var(--ink);
    width:38px;height:38px;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .navb:disabled{opacity:.3;cursor:default}
  select#dateSel{flex:1;background:var(--panel);border:1px solid var(--grid);border-radius:10px;
    color:var(--ink);padding:10px 12px;font-size:15px;font-weight:700;text-align:center;
    text-align-last:center;-webkit-appearance:none;appearance:none}

  .data{background:var(--panel);border:1px solid var(--grid);border-radius:14px;padding:12px 12px 10px;margin-bottom:14px}
  .drow{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .btn{display:inline-flex;align-items:center;gap:6px;background:#0e1621;border:1px solid var(--grid);
    border-radius:10px;padding:9px 13px;font-size:12.5px;color:var(--ink);cursor:pointer}
  .btn:hover{border-color:var(--room)}
  .btn.mini{padding:7px 11px;color:var(--muted)}
  .stat{font-size:11.5px;color:var(--muted)}
  .stat b{color:var(--ink);font-weight:600}
  .stat b.pend{color:var(--faint);font-weight:500}
  .dot{width:8px;height:8px;border-radius:50%;display:inline-block}
  details{margin-top:9px}
  summary{font-size:11.5px;color:var(--faint);cursor:pointer}
  .fmt{font-size:11px;color:var(--muted);background:var(--panel2);border:1px solid var(--grid);
    border-radius:10px;padding:10px 12px;margin-top:8px;line-height:1.7}
  code{background:#0e1621;border:1px solid var(--grid);border-radius:5px;padding:1px 5px;font-size:11px;
    color:#cbd5e1;font-family:ui-monospace,Menlo,Consolas,monospace}

  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
  .chip{background:var(--panel);border:1px solid var(--grid);border-radius:12px;
    padding:8px 11px;font-size:11.5px;color:var(--muted);flex:1 1 auto;min-width:92px}
  .chip b{display:block;font-size:15px;color:var(--ink);font-weight:700;font-variant-numeric:tabular-nums;margin-top:1px}
  .chip .u{font-size:11px;color:var(--faint);font-weight:500}

  .toggles{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
  .tg{display:flex;align-items:center;gap:7px;background:var(--panel);border:1px solid var(--grid);
    border-radius:20px;padding:7px 13px 7px 11px;font-size:12.5px;cursor:pointer;user-select:none}
  .tg input{position:absolute;opacity:0;width:0;height:0}
  .tg .sw{width:13px;height:13px;border-radius:4px;flex:none}
  .tg .sw.line{width:18px;height:3px;border-radius:2px}
  .tg .sw.dash{width:18px;height:0;border-top:3px dashed currentColor;background:none!important}
  .tg.off{opacity:.4}.tg.off .sw{filter:grayscale(1)}

  .card{background:var(--panel);border:1px solid var(--grid);border-radius:16px;padding:10px 8px 6px;position:relative;overflow:hidden}
  svg{display:block;width:100%;height:auto;touch-action:none}
  .empty{padding:48px 20px;text-align:center;color:var(--faint);font-size:13px}
  .tip{position:absolute;pointer-events:none;background:#0b1420ee;border:1px solid var(--grid);border-radius:10px;
    padding:8px 10px;font-size:11.5px;min-width:138px;opacity:0;transition:opacity .08s;backdrop-filter:blur(3px);z-index:5}
  .tip .t{color:var(--faint);font-size:10.5px;margin-bottom:4px;font-variant-numeric:tabular-nums}
  .tip .r{display:flex;justify-content:space-between;gap:12px;margin:2px 0}
  .tip .r span:first-child{color:var(--muted)}
  .tip .r b{font-variant-numeric:tabular-nums}
  .note{font-size:11.5px;color:var(--muted);margin-top:14px;padding:12px 14px;background:var(--panel2);
    border:1px solid var(--grid);border-radius:12px}
  .ynum{width:52px;background:#0e1621;border:1px solid var(--grid);border-radius:8px;color:#e8eef6;padding:6px 6px;font-size:13px}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <div>
      <h1>睡眠ステージ × 室温・湿度</h1>
      <p class="sub">睡眠ステージの上に温度・湿度を重ねて表示 ・ 日付で切り替え</p>
    </div>
    <a class="logout" href="/api/logout">ログアウト</a>
  </div>

  <div class="datebar">
    <button class="navb" id="prev">‹</button>
    <select id="dateSel"></select>
    <button class="navb" id="next">›</button>
  </div>

  <div class="data">
    <div class="drow">
      <label class="btn"><span class="dot" style="background:var(--core)"></span>睡眠ステージCSV
        <input type="file" accept=".csv,text/csv" id="fSleep" hidden></label>
      <label class="btn"><span class="dot" style="background:var(--room)"></span>温度・湿度CSV
        <input type="file" accept=".csv,text/csv" id="fEnv" hidden></label>
      <button class="btn mini" id="reset">サンプルに戻す</button>
    </div>
    <div class="drow" style="margin-top:9px">
      <div class="stat">睡眠: <b id="sSleep">—</b></div>
      <div class="stat">環境: <b id="sEnv">—</b></div>
    </div>
    <p style="font-size:11px;color:var(--faint);margin:8px 0 0">
      CSVをアップすると、日時から自動で日付を判定してその日に取り込みます（睡眠と環境は同じ夜なら自動でペアになります）。</p>
    <details>
      <summary>CSVフォーマット</summary>
      <div class="fmt">
        <b style="color:#e8eef6">睡眠ステージCSV</b><br>
        1行目: <code>start,end,stage</code>／ stage は <code>awake / rem / core / deep</code><br>
        例: <code>2026-07-22T01:05,2026-07-22T01:20,deep</code><br><br>
        <b style="color:#e8eef6">温度・湿度CSV</b><br>
        1行目: <code>time,room_temp,room_humidity,outdoor_temp,outdoor_humidity</code><br>
        例: <code>2026-07-22T05:00,31.8,67,28.0,82</code>／ 使わない列は空でOK<br>
        日時は日をまたぐため <code>YYYY-MM-DDTHH:MM</code> 推奨。
      </div>
    </details>
    <details>
      <summary>表示範囲の設定</summary>
      <div class="fmt">
        <div class="drow" style="gap:14px">
          <label style="display:flex;align-items:center;gap:6px;color:#e8eef6">
            <input type="radio" name="rmode" value="auto"> 自動（データ範囲）</label>
          <label style="display:flex;align-items:center;gap:6px;color:#e8eef6">
            <input type="radio" name="rmode" value="fixed"> 時刻を固定</label>
        </div>
        <div class="drow" id="fixedRow" style="gap:8px;margin-top:9px;align-items:center;color:#e8eef6">
          開始 <select id="rStart" style="background:#0e1621;border:1px solid var(--grid);border-radius:8px;color:#e8eef6;padding:6px 8px;font-size:13px"></select>
          →&nbsp;終了 <select id="rEnd" style="background:#0e1621;border:1px solid var(--grid);border-radius:8px;color:#e8eef6;padding:6px 8px;font-size:13px"></select>
        </div>
      </div>
    </details>
    <details>
      <summary>縦軸スケール</summary>
      <div class="fmt">
        <div class="drow" style="gap:14px">
          <label style="display:flex;align-items:center;gap:6px;color:#e8eef6"><input type="radio" name="ymode" value="auto"> 自動</label>
          <label style="display:flex;align-items:center;gap:6px;color:#e8eef6"><input type="radio" name="ymode" value="fixed"> 固定</label>
        </div>
        <div class="drow" id="yfixRow" style="gap:6px;margin-top:9px;align-items:center;color:#e8eef6;flex-wrap:wrap">
          <span style="color:#e0955f">温度℃</span>
          <input id="yTmin" type="number" class="ynum"> – <input id="yTmax" type="number" class="ynum">
          <span style="color:#7bbf9f;margin-left:8px">湿度%</span>
          <input id="yHmin" type="number" class="ynum"> – <input id="yHmax" type="number" class="ynum">
        </div>
      </div>
    </details>
  </div>

  <div class="chips" id="chips"></div>
  <div class="toggles" id="toggles"></div>

  <div class="card" id="card">
    <div id="tip" class="tip"></div>
    <svg id="chart" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet"></svg>
    <div class="empty" id="empty" style="display:none">この日のデータがありません。CSVを読み込んでください。</div>
  </div>

  <div class="note" id="note"></div>
</div>

<script>
/* ============ 既定データ ============ */
const DEFAULT_ENV_0721=`time,room_temp,room_humidity,outdoor_temp,outdoor_humidity
2026-07-20T22:00,33.8,59,31.5,68
2026-07-20T23:00,33.4,60,31.0,70
2026-07-21T00:00,33.2,62,30.5,72
2026-07-21T01:00,33.0,63,30.0,74
2026-07-21T02:00,32.7,64,29.5,76
2026-07-21T03:00,32.3,65,29.0,78
2026-07-21T04:00,32.2,66,28.5,80
2026-07-21T05:00,31.8,67,28.0,82
2026-07-21T06:00,32.1,68,28.0,82
2026-07-21T07:00,32.7,66,28.6,78
2026-07-21T08:00,33.2,63,30.0,70`;
const DEFAULT_SLEEP_0721=`start,end,stage
2026-07-20T23:59,2026-07-21T00:02,awake
2026-07-21T00:02,2026-07-21T00:21,core
2026-07-21T00:21,2026-07-21T00:24,awake
2026-07-21T00:24,2026-07-21T01:10,core
2026-07-21T01:10,2026-07-21T01:25,deep
2026-07-21T01:25,2026-07-21T01:50,core
2026-07-21T01:50,2026-07-21T02:06,rem
2026-07-21T02:06,2026-07-21T02:09,awake
2026-07-21T02:09,2026-07-21T02:45,core
2026-07-21T02:45,2026-07-21T03:00,deep
2026-07-21T03:00,2026-07-21T03:35,core
2026-07-21T03:35,2026-07-21T03:57,rem
2026-07-21T03:57,2026-07-21T04:00,awake
2026-07-21T04:00,2026-07-21T04:05,core
2026-07-21T04:05,2026-07-21T04:20,deep
2026-07-21T04:20,2026-07-21T05:10,core
2026-07-21T05:10,2026-07-21T05:22,rem
2026-07-21T05:22,2026-07-21T06:01,core
2026-07-21T06:01,2026-07-21T06:04,awake
2026-07-21T06:04,2026-07-21T06:27,core
2026-07-21T06:27,2026-07-21T06:30,awake
2026-07-21T06:30,2026-07-21T07:12,core
2026-07-21T07:12,2026-07-21T07:18,awake`;
const DEFAULT_SLEEP_0722=`start,end,stage
2026-07-22T00:24,2026-07-22T00:28,awake
2026-07-22T00:28,2026-07-22T00:40,core
2026-07-22T00:40,2026-07-22T00:43,awake
2026-07-22T00:43,2026-07-22T01:00,core
2026-07-22T01:00,2026-07-22T01:10,deep
2026-07-22T01:10,2026-07-22T01:13,awake
2026-07-22T01:13,2026-07-22T01:25,core
2026-07-22T01:25,2026-07-22T01:37,deep
2026-07-22T01:37,2026-07-22T01:40,awake
2026-07-22T01:40,2026-07-22T01:52,core
2026-07-22T01:52,2026-07-22T01:59,rem
2026-07-22T01:59,2026-07-22T03:10,core
2026-07-22T03:10,2026-07-22T03:45,rem
2026-07-22T03:45,2026-07-22T03:49,awake
2026-07-22T03:49,2026-07-22T04:12,core
2026-07-22T04:12,2026-07-22T04:26,deep
2026-07-22T04:26,2026-07-22T04:29,awake
2026-07-22T04:29,2026-07-22T04:45,core
2026-07-22T04:45,2026-07-22T04:57,deep
2026-07-22T04:57,2026-07-22T05:00,awake
2026-07-22T05:00,2026-07-22T05:35,core
2026-07-22T05:35,2026-07-22T05:48,rem
2026-07-22T05:48,2026-07-22T06:38,core
2026-07-22T06:38,2026-07-22T06:41,awake`;
const DEFAULT_ENV_0722=`time,room_temp,room_humidity,outdoor_temp,outdoor_humidity
2026-07-22T00:00,34.1,62,31.0,66
2026-07-22T01:00,33.3,64,30.3,69
2026-07-22T02:00,33.0,66,29.7,71
2026-07-22T03:00,32.6,66,29.2,73
2026-07-22T04:00,32.5,65,28.8,75
2026-07-22T05:00,32.4,64.5,28.4,77
2026-07-22T06:00,32.3,64,28.2,77
2026-07-22T07:00,33.1,63.5,29.5,72
2026-07-22T08:00,33.6,62.5,31.5,65`;
const DEFAULT_DAYS={
  '2026-07-21':{env:DEFAULT_ENV_0721,envName:'サンプル',sleep:DEFAULT_SLEEP_0721,sleepName:'サンプル'},
  '2026-07-22':{env:DEFAULT_ENV_0722,envName:'サンプル',sleep:DEFAULT_SLEEP_0722,sleepName:'サンプル'}
};

/* ============ ストレージ ============ */
const LS={days:'sv_days_v2',cur:'sv_cur',vis:'sv_vis',range:'sv_range'};
const stMeta={awake:{lane:0,c:'#fb7185',jp:'覚醒'},rem:{lane:1,c:'#26d6ea',jp:'レム'},
              core:{lane:2,c:'#4f9dff',jp:'コア'},deep:{lane:3,c:'#6f66e6',jp:'深い'}};

function getDays(){
  let d=null;
  try{d=JSON.parse(localStorage.getItem(LS.days)||'null');}catch(e){}
  if(!d){
    /* v1（単一データ）からの移行 */
    const oe=localStorage.getItem('sv_env_csv'),os=localStorage.getItem('sv_sleep_csv');
    if(oe||os){d={};const key=deriveKey((os||'')+'\n'+(oe||''))||'2026-07-21';
      d[key]={env:oe||'',envName:localStorage.getItem('sv_env_name')||'',
        sleep:os||'',sleepName:localStorage.getItem('sv_sleep_name')||''};}
    else d=JSON.parse(JSON.stringify(DEFAULT_DAYS));
    localStorage.setItem(LS.days,JSON.stringify(d));
  }
  return d;
}
function saveDays(d){localStorage.setItem(LS.days,JSON.stringify(d));}
function keys(d){return Object.keys(d).sort();}
function label(k){const[y,m,dd]=k.split('-');return `${+m}月${+dd}日`;}

/* ============ 解析 ============ */
function parseTime(s){s=(s||'').trim();if(!s)return NaN;
  const v=s.includes('-')?new Date(s.replace(' ','T')):new Date('2000-01-01T'+s);return v.getTime();}
function splitCSV(t){return t.replace(/\r/g,'').split('\n').map(l=>l.trim()).filter(l=>l.length);}
function idx(h,names){for(const n of names){const i=h.indexOf(n);if(i>=0)return i;}return -1;}
function deriveKey(text){
  const rows=splitCSV(text);let mx=-Infinity;
  for(const r of rows){for(const cell of r.split(',')){const t=parseTime(cell);if(!isNaN(t)&&t>mx)mx=t;}}
  if(mx===-Infinity)return null;const d=new Date(mx);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function parseEnv(text){
  const rows=splitCSV(text);if(!rows.length)return [];
  const h=rows[0].toLowerCase().split(',').map(x=>x.trim());
  const it=idx(h,['time','datetime','日時','時刻']),iRT=idx(h,['room_temp','roomtemp','室温']),
    iRH=idx(h,['room_humidity','roomhum','室内湿度']),iOT=idx(h,['outdoor_temp','out_temp','outtemp','外気温']),
    iOH=idx(h,['outdoor_humidity','out_humidity','outhum','外気湿度']);
  const num=v=>{v=(v||'').trim();return v===''?null:(isNaN(parseFloat(v))?null:parseFloat(v));};
  const out=[];
  for(let i=1;i<rows.length;i++){const c=rows[i].split(',');const t=parseTime(c[it]);if(isNaN(t))continue;
    out.push({t,roomT:iRT<0?null:num(c[iRT]),roomH:iRH<0?null:num(c[iRH]),
      outT:iOT<0?null:num(c[iOT]),outH:iOH<0?null:num(c[iOH])});}
  return out.sort((a,b)=>a.t-b.t);
}
function normStage(s){s=(s||'').trim().toLowerCase();
  if(['awake','wake','覚醒'].includes(s))return 'awake';
  if(['rem','レム'].includes(s))return 'rem';
  if(['core','light','コア'].includes(s))return 'core';
  if(['deep','深い'].includes(s))return 'deep';return null;}
function parseSleep(text){
  const rows=splitCSV(text);if(!rows.length)return [];
  const h=rows[0].toLowerCase().split(',').map(x=>x.trim());
  const iS=idx(h,['start','開始','from']),iE=idx(h,['end','終了','to']),iG=idx(h,['stage','ステージ','type']);
  const out=[];
  for(let i=1;i<rows.length;i++){const c=rows[i].split(',');
    const s=parseTime(c[iS]),e=parseTime(c[iE]),g=normStage(c[iG]);
    if(isNaN(s)||isNaN(e)||!g)continue;out.push({start:s,end:e,stage:g});}
  return out.sort((a,b)=>a.start-b.start);
}

/* ============ 状態 ============ */
let DAYS=getDays(),CUR=localStorage.getItem(LS.cur);
if(!CUR||!DAYS[CUR]){const ks=keys(DAYS);CUR=ks[ks.length-1];}
let ENV=[],SLEEP=[],SLEEPC=[];
const RANGE=Object.assign({mode:'auto',start:23,end:8,ymode:'fixed',tmin:27,tmax:35,hmin:55,hmax:85},JSON.parse(localStorage.getItem(LS.range)||'{}'));
const vis=Object.assign({room:true,out:true,roomH:true,outH:true,sleep:true},
  JSON.parse(localStorage.getItem(LS.vis)||'{}'));

function refresh(){
  const ks=keys(DAYS);
  const sel=document.getElementById('dateSel');
  sel.innerHTML=ks.map(k=>`<option value="${k}"${k===CUR?' selected':''}>${label(k)}</option>`).join('');
  const ci=ks.indexOf(CUR);
  document.getElementById('prev').disabled=ci<=0;
  document.getElementById('next').disabled=ci>=ks.length-1;
  const day=DAYS[CUR]||{env:'',sleep:''};
  ENV=parseEnv(day.env||'');SLEEP=parseSleep(day.sleep||'');
  document.getElementById('sSleep').innerHTML=day.sleep
    ?`${day.sleepName||'取込済'}（${SLEEP.length}区間）`:'<b class="pend">未取込</b>';
  document.getElementById('sEnv').innerHTML=day.env
    ?`${day.envName||'取込済'}（${ENV.length}点）`:'<b class="pend">未取込</b>';
  localStorage.setItem(LS.cur,CUR);
  render();
}

/* ============ レイアウト ============ */
const W=800,H=500,L=40,R=42,plotTop=58,plotBot=430,laneH=(plotBot-plotTop)/4;
const laneY=i=>plotTop+(i+0.5)*laneH,blockH=laneH*0.5;
const NS='http://www.w3.org/2000/svg',svg=document.getElementById('chart');
const el=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;};
function axisRange(vals,pad,step){if(!vals.length)return null;
  let mn=Math.min(...vals),mx=Math.max(...vals);
  mn=Math.floor((mn-pad)/step)*step;mx=Math.ceil((mx+pad)/step)*step;if(mn===mx)mx=mn+step;return[mn,mx];}
const interp=(pts,x)=>{if(!pts.length)return null;if(x<=pts[0][0])return pts[0][1];
  if(x>=pts[pts.length-1][0])return pts[pts.length-1][1];
  for(let i=1;i<pts.length;i++)if(x<=pts[i][0]){const a=pts[i-1],b=pts[i];
    return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}};
const fmtClock=ms=>{const d=new Date(ms);return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');};

let T0,T1,px,pyT,pyH,tRange,hRange,metricPts;
const LAT=35.42,LNG=136.76,TZ=9; // 岐阜市 / JST
function sunrise(date){
  const D2R=Math.PI/180,R2D=180/Math.PI,zenith=90.833;
  const N=Math.floor((date-new Date(date.getFullYear(),0,0))/86400000);
  const t=N+(6-LNG/15)/24, M=0.9856*t-3.289;
  const L=(M+1.916*Math.sin(M*D2R)+0.020*Math.sin(2*M*D2R)+282.634+360)%360;
  let RA=(R2D*Math.atan(0.91764*Math.tan(L*D2R))+360)%360;
  RA=(RA+(Math.floor(L/90)*90-Math.floor(RA/90)*90))/15;
  const sinDec=0.39782*Math.sin(L*D2R),cosDec=Math.cos(Math.asin(sinDec));
  const cosH=(Math.cos(zenith*D2R)-sinDec*Math.sin(LAT*D2R))/(cosDec*Math.cos(LAT*D2R));
  if(cosH>1||cosH<-1)return null;
  const H=(360-R2D*Math.acos(cosH))/15, T=H+RA-0.06571*t-6.622;
  const loc=((((T-LNG/15)%24+24)%24)+TZ+24)%24;
  return new Date(date.getFullYear(),date.getMonth(),date.getDate(),Math.floor(loc),Math.round((loc-Math.floor(loc))*60),0);
}
function render(){
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  const empty=document.getElementById('empty');
  const times=[];ENV.forEach(e=>times.push(e.t));SLEEP.forEach(s=>{times.push(s.start);times.push(s.end);});
  if(!times.length){svg.style.display='none';empty.style.display='block';
    document.getElementById('chips').innerHTML='';return;}
  svg.style.display='block';empty.style.display='none';
  if(RANGE.mode==='fixed'){
    const [Y,Mo,D]=CUR.split('-').map(Number);
    const sh=RANGE.start,eh=RANGE.end;
    T0=new Date(Y,Mo-1,D-(sh>=12?1:0),sh,0,0).getTime();
    T1=new Date(Y,Mo-1,D-(eh>=12?1:0),eh,0,0).getTime();
    if(T1<=T0)T1=T0+3600000;
  }else{
    T0=Math.min(...times);T1=Math.max(...times);if(T1===T0)T1=T0+3600000;
  }
  px=x=>L+(x-T0)/(T1-T0)*(W-L-R);
  const inw=t=>t>=T0&&t<=T1;
  metricPts={room:ENV.filter(e=>e.roomT!=null&&inw(e.t)).map(e=>[e.t,e.roomT]),
    out:ENV.filter(e=>e.outT!=null&&inw(e.t)).map(e=>[e.t,e.outT]),
    roomH:ENV.filter(e=>e.roomH!=null&&inw(e.t)).map(e=>[e.t,e.roomH]),
    outH:ENV.filter(e=>e.outH!=null&&inw(e.t)).map(e=>[e.t,e.outH])};
  SLEEPC=SLEEP.filter(s=>s.end>T0&&s.start<T1).map(s=>({start:Math.max(s.start,T0),end:Math.min(s.end,T1),stage:s.stage}));
  if(RANGE.ymode==='fixed'){tRange=[RANGE.tmin,RANGE.tmax];hRange=[RANGE.hmin,RANGE.hmax];}
  else{tRange=axisRange([...metricPts.room,...metricPts.out].map(p=>p[1]),0.5,1);
       hRange=axisRange([...metricPts.roomH,...metricPts.outH].map(p=>p[1]),2,5);}
  pyT=v=>tRange?plotBot-(v-tRange[0])/(tRange[1]-tRange[0])*(plotBot-plotTop):plotBot;
  pyH=v=>hRange?plotBot-(v-hRange[0])/(hRange[1]-hRange[0])*(plotBot-plotTop):plotBot;
  const add=(t,a)=>{const e=el(t,a);svg.appendChild(e);return e;};

  // 夜明け: 背景グラデ＋日の出ライン
  (function(){const sr=sunrise(new Date(T1));if(!sr)return;const srx=sr.getTime();
    const fr=t=>Math.max(0,Math.min(1,(t-T0)/(T1-T0)));
    const f0=fr(srx-28*6e4),f1=fr(srx),f2=fr(srx+40*6e4);
    const g=el('linearGradient',{id:'dawnGrad',x1:'0',y1:'0',x2:'1',y2:'0'});
    const st=(o,c,op)=>g.appendChild(el('stop',{offset:(o*100).toFixed(2)+'%','stop-color':c,'stop-opacity':op}));
    st(0,'#232a52',0);st(f0,'#3b2f74',0.06);st(f1,'#ff9d5c',0.20);st(f2,'#bcd8ff',0.13);st(1,'#dbeaff',0.16);
    svg.appendChild(g);
    add('rect',{x:L,y:plotTop,width:W-L-R,height:plotBot-plotTop,fill:'url(#dawnGrad)'});
    if(srx>=T0&&srx<=T1){const sx=px(srx);
      add('line',{x1:sx,y1:plotTop,x2:sx,y2:plotBot,stroke:'#ffcf8a','stroke-width':1.4,'stroke-dasharray':'4 3',opacity:.75});
      add('circle',{cx:sx,cy:plotTop+3,r:3.2,fill:'#ffd98a'});
      add('text',{x:sx+5,y:plotTop+12,fill:'#ffcf8a','font-size':10,'text-anchor':'start'}).textContent='日の出 '+fmtClock(srx);}
  })();
  if(vis.sleep)SLEEPC.filter(s=>s.stage==='awake').forEach(s=>
    add('rect',{x:px(s.start),y:plotTop,width:Math.max(1,px(s.end)-px(s.start)),height:plotBot-plotTop,fill:'#fb7185',opacity:.08}));
  for(let i=0;i<4;i++)add('line',{x1:L,y1:laneY(i),x2:W-R,y2:laneY(i),stroke:'#1c2634','stroke-width':1});

  if(vis.sleep){let prev=null;
    SLEEPC.forEach(s=>{const m=stMeta[s.stage],y=laneY(m.lane);
      if(prev)add('line',{x1:px(prev.end),y1:laneY(stMeta[prev.stage].lane),x2:px(s.start),y2:y,stroke:'#34455c','stroke-width':1.3});
      add('rect',{x:px(s.start),y:y-blockH/2,width:Math.max(2,px(s.end)-px(s.start)),height:blockH,rx:3,fill:m.c,opacity:.5});prev=s;});
    ['awake','rem','core','deep'].forEach(k=>{const m=stMeta[k],y=laneY(m.lane);
      add('rect',{x:L+3,y:y-9,width:34,height:16,rx:8,fill:'#0e1621',opacity:.72});
      add('text',{x:L+20,y:y+3.5,fill:m.c,'font-size':10.5,'text-anchor':'middle','font-weight':600}).textContent=m.jp;});}

  if(tRange){const ts=(tRange[1]-tRange[0]>6?2:1);for(let v=Math.ceil(tRange[0]/ts)*ts;v<=tRange[1]+0.001;v+=ts){
    add('line',{x1:L,y1:pyT(v),x2:W-R,y2:pyT(v),stroke:'#1f2a38','stroke-width':1,'stroke-dasharray':'2 4'});
    add('text',{x:W-R+6,y:pyT(v)+4,fill:'#e0955f','font-size':10.5,'text-anchor':'start'}).textContent=Math.round(v*10)/10;}
    add('text',{x:W-R+6,y:plotTop-4,fill:'#e0955f','font-size':10,'text-anchor':'start'}).textContent='℃';}
  if(hRange){const hs=hRange[1]-hRange[0]>25?10:5;
    for(let v=Math.ceil(hRange[0]/hs)*hs;v<=hRange[1]+0.001;v+=hs)
      add('text',{x:L-6,y:pyH(v)+4,fill:'#7bbf9f','font-size':10.5,'text-anchor':'end'}).textContent=Math.round(v);
    add('text',{x:L-6,y:plotTop-4,fill:'#7bbf9f','font-size':10,'text-anchor':'end'}).textContent='%';}

  const line=(pts,color,key,yf,dash)=>{if(!vis[key]||pts.length<1)return;
    const d=pts.map((p,i)=>(i?'L':'M')+px(p[0]).toFixed(1)+' '+yf(p[1]).toFixed(1)).join(' ');
    add('path',{d,fill:'none',stroke:color,'stroke-width':dash?2.2:2.8,'stroke-linejoin':'round',
      'stroke-linecap':'round',...(dash?{'stroke-dasharray':'6 5'}:{})});
    if(!dash)pts.forEach(p=>add('circle',{cx:px(p[0]),cy:yf(p[1]),r:2.3,fill:color,stroke:'#0e1621','stroke-width':1}));};
  line(metricPts.outH,'#b18cff','outH',pyH,true);line(metricPts.roomH,'#5fd39b','roomH',pyH,false);
  line(metricPts.out,'#57c7ec','out',pyT,false);line(metricPts.room,'#ff9d5c','room',pyT,false);

  const rangeH=(T1-T0)/3600000,step=rangeH<=7?1:rangeH<=15?2:3;
  const ticks=[T0];let tt=new Date(T0);
  tt=new Date(tt.getFullYear(),tt.getMonth(),tt.getDate(),tt.getHours()+((tt.getMinutes()||tt.getSeconds())?1:0),0,0).getTime();
  while(new Date(tt).getHours()%step!==0)tt+=3600000;
  for(;tt<T1-6e4;tt+=step*36e5)if(tt>T0+6e4)ticks.push(tt);
  ticks.push(T1);
  ticks.forEach(t=>{add('line',{x1:px(t),y1:plotTop,x2:px(t),y2:plotBot,stroke:'#18222f','stroke-width':1});
    add('text',{x:px(t),y:plotBot+22,fill:'#8ea0b4','font-size':11,'text-anchor':'middle'}).textContent=fmtClock(t);});

  window._cross=add('line',{x1:0,y1:plotTop,x2:0,y2:plotBot,stroke:'#fff','stroke-width':1,'stroke-dasharray':'3 3',opacity:0});
  window._dots={room:add('circle',{r:4.3,fill:'#ff9d5c',stroke:'#0e1621','stroke-width':2,opacity:0}),
    out:add('circle',{r:4.3,fill:'#57c7ec',stroke:'#0e1621','stroke-width':2,opacity:0}),
    roomH:add('circle',{r:4.3,fill:'#5fd39b',stroke:'#0e1621','stroke-width':2,opacity:0}),
    outH:add('circle',{r:4.3,fill:'#b18cff',stroke:'#0e1621','stroke-width':2,opacity:0})};
  renderChips();
}
function renderChips(){
  const dur=SLEEP.reduce((a,s)=>a+(s.end-s.start),0),durMin=Math.round(dur/60000);
  const sum=g=>Math.round(SLEEP.filter(s=>s.stage===g).reduce((a,s)=>a+(s.end-s.start),0)/60000);
  const rt=metricPts.room.map(p=>p[1]),rh=metricPts.roomH.map(p=>p[1]);
  const rng=(a,u,dec)=>a.length?`${Math.min(...a).toFixed(dec)} – ${Math.max(...a).toFixed(dec)}<span class="u"> ${u}</span>`:'—';
  const chips=[
    ['睡眠時間',durMin?`${Math.floor(durMin/60)}<span class="u">時間</span>${durMin%60}<span class="u">分</span>`:'—'],
    ['室温',rng(rt,'℃',1)],['室内湿度',rng(rh,'%',0)],
    ['覚醒 / レム',SLEEP.length?`${sum('awake')} / ${sum('rem')}<span class="u"> 分</span>`:'—']
  ];
  document.getElementById('chips').innerHTML=chips.map(c=>`<div class="chip">${c[0]}<b>${c[1]}</b></div>`).join('');
}

/* ============ 操作 ============ */
const tip=document.getElementById('tip'),card=document.getElementById('card');
function move(ev){if(!ENV.length&&!SLEEP.length)return;
  const r=svg.getBoundingClientRect();const cx=(ev.touches?ev.touches[0].clientX:ev.clientX)-r.left;
  let ms=((cx/r.width*W)-L)/(W-L-R)*(T1-T0)+T0;ms=Math.max(T0,Math.min(T1,ms));const X=px(ms);
  const val={room:interp(metricPts.room,ms),out:interp(metricPts.out,ms),roomH:interp(metricPts.roomH,ms),outH:interp(metricPts.outH,ms)};
  const yf={room:pyT,out:pyT,roomH:pyH,outH:pyH};
  _cross.setAttribute('x1',X);_cross.setAttribute('x2',X);_cross.setAttribute('opacity',.6);
  for(const k in _dots){const has=val[k]!=null&&vis[k];
    if(has){_dots[k].setAttribute('cx',X);_dots[k].setAttribute('cy',yf[k](val[k]));}_dots[k].setAttribute('opacity',has?1:0);}
  const st=SLEEPC.find(s=>ms>=s.start&&ms<s.end),stOn=vis.sleep&&st;
  const row=(lab,v,u,c)=>v==null?'':`<div class="r"><span>${lab}</span><b style="color:${c}">${u==='℃'?v.toFixed(1):Math.round(v)}${u}</b></div>`;
  tip.innerHTML=`<div class="t">${fmtClock(ms)}</div>`+
    (vis.room?row('室温',val.room,'℃','#ff9d5c'):'')+(vis.out?row('外気温',val.out,'℃','#57c7ec'):'')+
    (vis.roomH?row('室内湿度',val.roomH,'%','#5fd39b'):'')+(vis.outH?row('外気湿度',val.outH,'%','#b18cff'):'')+
    (vis.sleep?`<div class="r"><span>睡眠</span><b style="color:${stOn?stMeta[st.stage].c:'#455163'}">${st?stMeta[st.stage].jp:'—'}</b></div>`:'');
  tip.style.opacity=1;const cr=card.getBoundingClientRect();
  let tx=r.left-cr.left+cx+12;if(tx+152>cr.width)tx=r.left-cr.left+cx-152;
  tip.style.left=tx+'px';tip.style.top=(r.top-cr.top+14)+'px';}
function leave(){if(window._cross)_cross.setAttribute('opacity',0);
  if(window._dots)for(const k in _dots)_dots[k].setAttribute('opacity',0);tip.style.opacity=0;}
svg.addEventListener('mousemove',move);svg.addEventListener('mouseleave',leave);
svg.addEventListener('touchstart',move,{passive:true});svg.addEventListener('touchmove',move,{passive:true});
svg.addEventListener('touchend',leave);

/* 日付切替 */
document.getElementById('dateSel').addEventListener('change',e=>{CUR=e.target.value;refresh();});
document.getElementById('prev').addEventListener('click',()=>{const ks=keys(DAYS),i=ks.indexOf(CUR);if(i>0){CUR=ks[i-1];refresh();}});
document.getElementById('next').addEventListener('click',()=>{const ks=keys(DAYS),i=ks.indexOf(CUR);if(i<ks.length-1){CUR=ks[i+1];refresh();}});

/* トグル */
const tgDefs=[['room','室温','line','#ff9d5c'],['out','外気温','line','#57c7ec'],
  ['roomH','室内湿度','line','#5fd39b'],['outH','外気湿度','dash','#b18cff'],['sleep','睡眠ステージ','box','#4f9dff']];
const tgWrap=document.getElementById('toggles');
tgDefs.forEach(([k,label2,shape,color])=>{
  const lab=document.createElement('label');lab.className='tg'+(vis[k]?'':' off');lab.style.color=color;
  lab.innerHTML=`<input type="checkbox" ${vis[k]?'checked':''}><span class="sw ${shape==='line'?'line':shape==='dash'?'dash':''}" style="background:${color}"></span><span style="color:#e8eef6">${label2}</span>`;
  lab.querySelector('input').addEventListener('change',e=>{vis[k]=e.target.checked;
    lab.classList.toggle('off',!e.target.checked);localStorage.setItem(LS.vis,JSON.stringify(vis));render();});
  tgWrap.appendChild(lab);});

/* アップロード（日付を自動判定） */
function hookUpload(inputId,slot,parser,label3){
  document.getElementById(inputId).addEventListener('change',ev=>{
    const f=ev.target.files[0];if(!f)return;const rd=new FileReader();
    rd.onload=()=>{const txt=rd.result;
      try{const parsed=parser(txt);
        if(!parsed.length){alert(label3+'を読み取れませんでした。列名や形式を確認してください。');return;}
        const key=deriveKey(txt);if(!key){alert('日付を判定できませんでした。日時列を確認してください。');return;}
        DAYS[key]=DAYS[key]||{env:'',envName:'',sleep:'',sleepName:''};
        DAYS[key][slot]=txt;DAYS[key][slot+'Name']=f.name;
        saveDays(DAYS);CUR=key;refresh();
      }catch(e){alert('読み込みエラー: '+e.message);}};
    rd.readAsText(f);ev.target.value='';});
}
hookUpload('fSleep','sleep',parseSleep,'睡眠CSV');
hookUpload('fEnv','env',parseEnv,'温度・湿度CSV');
document.getElementById('reset').addEventListener('click',()=>{
  if(!confirm('サンプルデータに戻します。読み込んだCSVは消えます。'))return;
  DAYS=JSON.parse(JSON.stringify(DEFAULT_DAYS));saveDays(DAYS);
  const ks=keys(DAYS);CUR=ks[ks.length-1];refresh();});

document.getElementById('note').innerHTML=
 '睡眠ステージを土台に、温度（右軸 ℃）と湿度（左軸 %）を重ねています。'+
 '上の日付で夜を切り替え、チェックボックスで表示/非表示、グラフを指でなぞると各値が出ます。'+
 '温度・湿度が未取込の日は睡眠ステージのみ表示します。データはこの端末のブラウザに保存されます。';

/* 表示範囲の設定 */
(function(){
  const hh=h=>h+':00';
  const rS=document.getElementById('rStart'),rE=document.getElementById('rEnd');
  [20,21,22,23,0].forEach(h=>rS.add(new Option(hh(h),h)));
  [5,6,7,8,9,10].forEach(h=>rE.add(new Option(hh(h),h)));
  function syncUI(){
    document.querySelectorAll('input[name="rmode"]').forEach(r=>r.checked=(r.value===RANGE.mode));
    rS.value=RANGE.start;rE.value=RANGE.end;
    document.getElementById('fixedRow').style.opacity=RANGE.mode==='fixed'?1:.4;
    rS.disabled=rE.disabled=RANGE.mode!=='fixed';
  }
  function save(){localStorage.setItem(LS.range,JSON.stringify(RANGE));render();}
  document.querySelectorAll('input[name="rmode"]').forEach(r=>
    r.addEventListener('change',()=>{RANGE.mode=r.value;syncUI();save();}));
  rS.addEventListener('change',()=>{RANGE.start=+rS.value;save();});
  rE.addEventListener('change',()=>{RANGE.end=+rE.value;save();});
  // 縦軸スケール
  const yn={tmin:document.getElementById('yTmin'),tmax:document.getElementById('yTmax'),
    hmin:document.getElementById('yHmin'),hmax:document.getElementById('yHmax')};
  function syncY(){
    document.querySelectorAll('input[name="ymode"]').forEach(r=>r.checked=(r.value===RANGE.ymode));
    for(const k in yn)yn[k].value=RANGE[k];
    document.getElementById('yfixRow').style.opacity=RANGE.ymode==='fixed'?1:.4;
    for(const k in yn)yn[k].disabled=RANGE.ymode!=='fixed';
  }
  document.querySelectorAll('input[name="ymode"]').forEach(r=>
    r.addEventListener('change',()=>{RANGE.ymode=r.value;syncY();save();}));
  for(const k in yn)yn[k].addEventListener('change',()=>{const v=parseFloat(yn[k].value);if(!isNaN(v)){RANGE[k]=v;save();}});
  syncUI();syncY();
})();

refresh();
</script>
</body>
</html>
