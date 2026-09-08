/* ==========================================================
   人体解剖学智评学径智能体 v2 — 主逻辑
   模块：
     1. 数据：知识图谱 / 题库 / 历史 / 试点
     2. 工具：评分判定 / 报告生成 / 本地存储
     3. 学生端：测评 → 诊断 → 阶段3 自测
     4. 数据看板：雷达图 / 柱状图 / 饼图 / 历史表
     5. 知识图谱：ECharts graph 渲染 + 掌握度着色
     6. AI 伴学：mock + 真实大模型接入 / 浮窗
     7. 教师端：题库编辑 / 班级汇总 / 大模型配置 / 试点成效
     8. 路由 / Tab 切换 / 角色模式
   ========================================================== */

'use strict';

/* ==========================================================
   1. 数据层
   ========================================================== */

/* 知识图谱（节点 + 前置依赖边） */
const KG = {
  "肱肌":                {m:"运动系统", p:["肱骨骨性结构"],       f:"屈肘关节的关键肌"},
  "肱骨骨性结构":        {m:"运动系统", p:[],                     f:"骨性标志"},
  "肩关节":              {m:"运动系统", p:["肱骨骨性结构"],       f:"球窝关节"},
  "骨连接":              {m:"运动系统", p:[],                     f:"基础概念"},
  "肌的起止和作用":      {m:"运动系统", p:["骨连接"],             f:"肌肉命名规则"},
  "膝关节":              {m:"运动系统", p:["骨连接"],             f:"人体最大关节"},
  "前臂骨":              {m:"运动系统", p:["骨连接"],             f:"桡尺骨"},
  "胃的位置和形态":      {m:"消化系统", p:[],                     f:"胃的解剖"},
  "肝的毗邻":            {m:"消化系统", p:["胃的位置和形态"],     f:"脏器毗邻"},
  "肝的形态与分叶":      {m:"消化系统", p:[],                     f:"分叶命名"},
  "食管":                {m:"消化系统", p:[],                     f:"三处狭窄"},
  "胰的位置和形态":      {m:"消化系统", p:["胃的位置和形态"],     f:"腹膜后位"},
  "胆囊":                {m:"消化系统", p:["肝的形态与分叶"],     f:"底/体/颈/管"},
  "小肠":                {m:"消化系统", p:[],                     f:"十二指肠/空肠/回肠"},
  "大肠":                {m:"消化系统", p:[],                     f:"盲肠起始"},
  "肺的位置和形态":      {m:"呼吸系统", p:[],                     f:"肺尖锁骨上 2cm"},
  "气管":                {m:"呼吸系统", p:[],                     f:"胸骨角分叉"},
  "肺段":                {m:"呼吸系统", p:["肺的位置和形态"],     f:"支气管肺段"},
  "鼻腔":                {m:"呼吸系统", p:[],                     f:"鼻后孔通咽"},
  "胸膜":                {m:"呼吸系统", p:["肺的位置和形态"],     f:"脏/壁两层"},
  "支气管树":            {m:"呼吸系统", p:["气管"],               f:"主支气管分支"},
  "呼吸肌":              {m:"呼吸系统", p:[],                     f:"膈为关键"},
  "解剖学姿势":          {m:"绪论",     p:[],                     f:"标准姿势"},
  "解剖学方位术语":      {m:"绪论",     p:["解剖学姿势"],         f:"上下/前后/内外"},
  "解剖学切面":          {m:"绪论",     p:[],                     f:"矢状/冠状/水平"},
  "人体器官系统":        {m:"绪论",     p:[],                     f:"九大系统"},
  "结构与功能":          {m:"绪论",     p:[],                     f:"适应观"},
  "肾的位置和形态":      {m:"泌尿系统", p:[],                     f:"左高右低"},
  "肾的结构":            {m:"泌尿系统", p:["肾的位置和形态"],     f:"皮质/髓质/窦"},
  "泌尿小管":            {m:"泌尿系统", p:["肾的结构"],           f:"肾单位"},
  "输尿管":              {m:"泌尿系统", p:[],                     f:"三处狭窄"},
  "肾门":                {m:"泌尿系统", p:["肾的位置和形态"],     f:"内侧缘"},
  "膀胱":                {m:"泌尿系统", p:[],                     f:"膀胱三角"},
  "睾丸":                {m:"生殖系统", p:[],                     f:"生精+雄激素"},
  "男性生殖管道":        {m:"生殖系统", p:["睾丸"],               f:"附睾/输精管/射精管"},
  "子宫":                {m:"生殖系统", p:[],                     f:"膀胱直肠之间"},
  "女性生殖器":          {m:"生殖系统", p:["子宫"],               f:"输卵管分部"},
  "会阴":                {m:"生殖系统", p:[],                     f:"盆膈以下软组织"},
  "垂体":                {m:"内分泌系统", p:[],                   f:"蝶骨垂体窝"},
  "甲状腺":              {m:"内分泌系统", p:[],                   f:"左/右叶+峡"},
  "肾上腺":              {m:"内分泌系统", p:[],                   f:"肾上方"},
  "胰岛":                {m:"内分泌系统", p:[],                   f:"调节血糖"},
  "甲状旁腺":            {m:"内分泌系统", p:["甲状腺"],           f:"调节血钙"},
  "心脏的位置和形态":    {m:"循环系统", p:[],                     f:"中纵隔"},
  "心脏的结构":          {m:"循环系统", p:["心脏的位置和形态"],   f:"四腔"},
  "心脏瓣膜":            {m:"循环系统", p:["心脏的结构"],         f:"二/三尖瓣/主/肺动脉瓣"},
  "冠状动脉":            {m:"循环系统", p:["心脏的位置和形态"],   f:"升主动脉发出"},
  "心脏传导系":          {m:"循环系统", p:["心脏的结构"],         f:"窦房结起步"},
  "体循环和肺循环":      {m:"循环系统", p:["心脏的结构"],         f:"循环路径"},
  "眼球壁":              {m:"感觉器", p:[],                       f:"三层结构"},
  "眼球内容物":          {m:"感觉器", p:["眼球壁"],               f:"房水/晶状体/玻璃体"},
  "耳":                  {m:"感觉器", p:[],                       f:"听小骨三块"},
  "视网膜":              {m:"感觉器", p:["眼球壁"],               f:"感光细胞"},
  "眼球结构":            {m:"感觉器", p:["眼球内容物"],           f:"睫状体调曲度"},
  "前庭蜗器":            {m:"感觉器", p:["耳"],                   f:"前庭器平衡"},
  "中枢神经系统":        {m:"神经系统", p:[],                     f:"脑+脊髓"},
  "脑膜":                {m:"神经系统", p:[],                     f:"三层被膜"},
  "脊髓":                {m:"神经系统", p:[],                     f:"L1 下缘"},
  "反射弧":              {m:"神经系统", p:["中枢神经系统"],       f:"5 部分"},
  "脑的结构":            {m:"神经系统", p:["中枢神经系统"],       f:"4 大脑叶"},
  "自主神经":            {m:"神经系统", p:["反射弧"],             f:"内脏活动调节"}
};

/* 题库（保留原有 10 大系统） */

/* ============ 掌握度模型（指数平滑知识追踪，持久化） ============ */
const Mastery = {
  all(){ try { return JSON.parse(localStorage.getItem("anatomy_mastery") || "{}"); } catch(e){ return {}; } },
  save(a){ try { localStorage.setItem("anatomy_mastery", JSON.stringify(a)); } catch(e){} },
  get(kp){ const a = this.all(); return a[kp] || {m:.5, n:0}; },
  update(kp, obs){
    const a = this.all();
    const o = a[kp] || {m:.5, n:0};
    const m = o.m + 0.4 * (obs - o.m);
    a[kp] = {m: Math.max(0, Math.min(1, m)), n: o.n + 1};
    this.save(a);
    return a[kp];
  },
  label(m){ return m >= .8 ? "掌握良好" : m >= .5 ? "部分掌握" : "完全未掌握"; }
};

/* ============ 统一六维能力模型（融合核心） ============
   L1—L3 学科基础：医学生同样要求的结构与功能素养
   L4—L6 专业特色：健康服务与管理专业专属的评估与干预能力
   测评引擎与体态实训引擎共用同一坐标系，数据双向流动
*/
const COMPETENCY = [
  { key:"L1", name:"结构定位", short:"结构", tier:"base", desc:"识别、命名并定位人体结构" },
  { key:"L2", name:"毗邻关系", short:"毗邻", tier:"base", desc:"判断结构的空间毗邻与层次" },
  { key:"L3", name:"功能机制", short:"机制", tier:"base", desc:"解释结构与功能之间的机制" },
  { key:"L4", name:"异常识别", short:"异常", tier:"pro",  desc:"从体态与体征中识别偏离" },
  { key:"L5", name:"风险沟通", short:"风险", tier:"pro",  desc:"分级风险并识别转介指征" },
  { key:"L6", name:"管理干预", short:"干预", tier:"pro",  desc:"给出非医疗健康管理方案" }
];
const COMP_BY_KEY = {};
COMPETENCY.forEach(function(c){ COMP_BY_KEY[c.key] = c; });

/* 测评错误类型 → 能力维度 */
const ERROR_TO_COMP = { A:"L1", B:"L2", C:"L1", D:"L3", "待判定":"L1" };
/* 体态实训维度 → 能力维度 */
const POSTURE_TO_COMP = {
  structure:["L1","L2"], mechanism:["L3"], risk:["L5"],
  intervention:["L6"], ethics:["L5"], thinking:["L4"]
};

const UNIFIED_KEY = "hsm_anatomy_competency_v1";
const LEGACY_KEYS = { state:"anatomy_v2_state_v1", posture:"posture-decoder-training-v1" };

function compOfQuestion(q){
  return q.comp || ERROR_TO_COMP[q.errorType || "待判定"] || "L1";
}
function emptyUnified(){
  var comp = {};
  COMPETENCY.forEach(function(c){ comp[c.key] = { v:0, n:0, exp:0 }; });
  return {
    version: 1, createdAt: nowISO(), updatedAt: nowISO(),
    comp: comp, timeline: [],
    quiz: { sessions:0, answers:0, correct:0, modules:{} },
    posture: { cases:0, riskFlags:0, redFlags:0, byModule:{}, skills:{} }
  };
}
function loadUnified(){
  var u = null;
  try{ u = JSON.parse(localStorage.getItem(UNIFIED_KEY) || "null"); }catch(e){}
  if(!u || !u.comp){ u = migrateLegacy(emptyUnified()); saveUnified(u); }
  return u;
}
function saveUnified(u){
  u.updatedAt = nowISO();
  try{ localStorage.setItem(UNIFIED_KEY, JSON.stringify(u)); }catch(e){}
}
/* 记一次能力观测：obs 为 0—1 的达成度 */
function compCredit(u, key, obs, src, label){
  if(!COMP_BY_KEY[key]) return u;
  var o = Math.max(0, Math.min(1, obs));
  var c = u.comp[key] || { v:0, n:0, exp:0 };
  c.v = c.n === 0 ? o : (c.v + 0.35 * (o - c.v));
  c.n = c.n + 1;
  c.exp = (c.exp || 0) + 1;
  u.comp[key] = c;
  u.timeline.unshift({ ts: nowISO(), k: key, v: Math.round(c.v * 100), src: src || "", label: label || "" });
  if(u.timeline.length > 150) u.timeline = u.timeline.slice(0, 150);
  return u;
}
function compPct(u, key){ var c = (u.comp || {})[key]; return c && c.n ? Math.round(c.v * 100) : 0; }
function compLevel(pct){ return pct >= 80 ? "熟练" : pct >= 60 ? "达标" : pct >= 35 ? "发展中" : "待建立"; }

/* 历史数据迁移：把两份老档案合并为一份统一档案 */
function migrateLegacy(u){
  try{
    var raw = localStorage.getItem(LEGACY_KEYS.state);
    if(raw){
      var s = JSON.parse(raw);
      if(s && s.stats){
        u.quiz.sessions = s.stats.sessions || 0;
        u.quiz.answers = s.stats.answerCount || 0;
        u.quiz.correct = s.stats.correctCount || 0;
        u.quiz.modules = s.stats.modules || {};
        (s.history || []).forEach(function(h){
          var rate = typeof h.correctRate === "number" ? h.correctRate : 0;
          ["L1","L2","L3"].forEach(function(k){
            u = compCredit(u, k, rate, "quiz", h.system || "");
          });
        });
      }
    }
  }catch(e){}
  try{
    var praw = localStorage.getItem(LEGACY_KEYS.posture);
    if(praw){
      var p = JSON.parse(praw);
      if(p){
        u.posture.cases = Number(p.completed) || 0;
        u.posture.skills = p.skills && typeof p.skills === "object" ? p.skills : {};
        (p.records || []).forEach(function(r){
          u.posture.byModule[r.module] = (u.posture.byModule[r.module] || 0) + 1;
          if(r.level >= 2) u.posture.riskFlags++;
          if(r.level === 3) u.posture.redFlags++;
          u = compCredit(u, "L4", r.level >= 2 ? 1 : 0.6, "posture", r.query || "");
          u = compCredit(u, "L5", r.level >= 2 ? 0.9 : 0.6, "posture", r.query || "");
        });
        Object.keys(u.posture.skills).forEach(function(sk){
          var ks = POSTURE_TO_COMP[sk] || [];
          var cnt = Number(u.posture.skills[sk]) || 0;
          ks.forEach(function(k){
            for(var i = 0; i < cnt; i++){ u = compCredit(u, k, 0.85, "posture", sk); }
          });
        });
      }
    }
  }catch(e){}
  return u;
}

/* ============ 原创解剖示意图（SVG，用于识图题） ============ */

const FIGURES={
  planes:`<svg viewBox="0 0 340 210" width="340"><ellipse cx="170" cy="34" rx="18" ry="22" fill="#ffe3d0" stroke="#b9836a"/><rect x="150" y="58" width="40" height="86" rx="16" fill="#ffe3d0" stroke="#b9836a"/><rect x="132" y="146" width="16" height="52" rx="7" fill="#ffe3d0" stroke="#b9836a"/><rect x="192" y="146" width="16" height="52" rx="7" fill="#ffe3d0" stroke="#b9836a"/><line x1="170" y1="12" x2="170" y2="200" stroke="#c23a3a" stroke-width="2.5"/><ellipse cx="170" cy="120" rx="66" ry="16" fill="none" stroke="#1769d1" stroke-width="2" stroke-dasharray="7 4"/><ellipse cx="170" cy="100" rx="14" ry="52" fill="none" stroke="#16794b" stroke-width="2" stroke-dasharray="3 3"/><text x="176" y="26" font-size="12" fill="#c23a3a">矢状面？</text><text x="60" y="112" font-size="12" fill="#16794b">冠状面</text><text x="230" y="138" font-size="12" fill="#1769d1">水平面</text><text x="170" y="205" font-size="11" fill="#687783" text-anchor="middle">人体前面观（原创示意图）</text></svg>`,
  shoulder:`<svg viewBox="0 0 340 210" width="340"><path d="M40 60 L150 95 L128 150 L36 118 Z" fill="#f5e7d8" stroke="#a08060" stroke-width="2"/><circle cx="150" cy="86" r="20" fill="#ffe3d0" stroke="#b9836a" stroke-width="2"/><rect x="168" y="82" width="120" height="22" rx="11" fill="#ffe3d0" stroke="#b9836a" stroke-width="2"/><text x="150" y="60" font-size="13" fill="#c23a3a" text-anchor="middle">？</text><line x1="150" y1="64" x2="150" y2="74" stroke="#c23a3a" stroke-width="2"/><text x="60" y="160" font-size="12" fill="#687783">肩胛骨</text><text x="230" y="120" font-size="12" fill="#687783">肱骨</text><text x="170" y="200" font-size="11" fill="#687783" text-anchor="middle">肩部前面观（原创示意图）</text></svg>`,
  pancreas:`<svg viewBox="0 0 340 210" width="340"><path d="M60 40 C110 20 150 30 165 60 C180 90 150 120 120 110 C95 102 70 80 60 40 Z" fill="#f9e0d9" stroke="#c07a6a" stroke-width="2"/><path d="M95 118 C140 108 200 112 235 130 C255 140 262 158 250 170 C240 178 225 172 215 164 C190 146 130 140 95 150 Z" fill="#f3e9d2" stroke="#9a8540" stroke-width="2"/><path d="M215 118 C245 112 268 130 268 150 C268 172 248 184 228 182" fill="none" stroke="#8aa86a" stroke-width="12" stroke-linecap="round" opacity=".7"/><text x="160" y="100" font-size="13" fill="#c23a3a" text-anchor="middle">？</text><line x1="160" y1="104" x2="160" y2="120" stroke="#c23a3a" stroke-width="2"/><text x="90" y="35" font-size="12" fill="#687783">胃</text><text x="290" y="150" font-size="12" fill="#687783">十二指肠</text><text x="170" y="205" font-size="11" fill="#687783" text-anchor="middle">腹腔前面观，？处结构位于胃后方（原创示意图）</text></svg>`,
  diaphragm:`<svg viewBox="0 0 340 210" width="340"><path d="M70 40 C70 20 130 14 132 40 C134 66 92 70 70 40 Z" fill="#f2d9ec" stroke="#a06a9a" stroke-width="2"/><path d="M205 40 C205 20 265 14 267 40 C269 66 227 70 205 40 Z" fill="#f2d9ec" stroke="#a06a9a" stroke-width="2"/><path d="M40 130 C80 96 130 96 168 122 C206 96 256 96 300 130" fill="none" stroke="#1769d1" stroke-width="4" stroke-linecap="round"/><path d="M212 132 C240 118 276 120 292 140 L292 168 L212 168 Z" fill="#e8b7a0" stroke="#b97a5c" stroke-width="2"/><text x="168" y="112" font-size="13" fill="#c23a3a" text-anchor="middle">？</text><text x="70" y="30" font-size="12" fill="#687783">左肺</text><text x="250" y="30" font-size="12" fill="#687783">右肺</text><text x="252" y="158" font-size="12" fill="#687783">肝</text><text x="170" y="200" font-size="11" fill="#687783" text-anchor="middle">胸腹部前面观（原创示意图）</text></svg>`,
  kidney:`<svg viewBox="0 0 340 210" width="340"><rect x="158" y="20" width="24" height="170" rx="8" fill="#e8e4d8" stroke="#a09a80" stroke-width="2"/><path d="M70 55 C40 65 34 130 70 160 C104 186 128 150 128 108 C128 66 100 45 70 55 Z" fill="#e5a8a8" stroke="#a85c5c" stroke-width="2"/><path d="M270 55 C300 65 306 130 270 160 C236 186 212 150 212 108 C212 66 240 45 270 55 Z" fill="#e5a8a8" stroke="#a85c5c" stroke-width="2"/><text x="132" y="108" font-size="13" fill="#c23a3a">？</text><line x1="134" y1="108" x2="206" y2="108" stroke="#c23a3a" stroke-width="2" stroke-dasharray="4 3"/><text x="70" y="185" font-size="12" fill="#687783">左肾</text><text x="255" y="185" font-size="12" fill="#687783">右肾</text><text x="170" y="15" font-size="12" fill="#687783" text-anchor="middle">脊柱</text><text x="170" y="205" font-size="11" fill="#687783" text-anchor="middle">？所指为肾门通常所在部位（原创示意图）</text></svg>`,
  uterus:`<svg viewBox="0 0 340 210" width="340"><path d="M60 60 C60 40 96 40 96 60 L96 110 C96 130 60 130 60 110 Z" fill="#d9e8f5" stroke="#6a8ab0" stroke-width="2"/><path d="M150 70 C150 50 196 42 196 62 C196 84 176 96 168 118 L160 140 C158 152 148 152 146 140 L140 112 C136 94 150 88 150 70 Z" fill="#e8b7c8" stroke="#a8607e" stroke-width="2"/><rect x="220" y="55" width="42" height="95" rx="16" fill="#e8d9c5" stroke="#a08a60" stroke-width="2"/><text x="176" y="46" font-size="13" fill="#c23a3a" text-anchor="middle">？</text><line x1="176" y1="50" x2="174" y2="60" stroke="#c23a3a" stroke-width="2"/><text x="62" y="150" font-size="12" fill="#687783">膀胱</text><text x="222" y="170" font-size="12" fill="#687783">直肠</text><text x="170" y="200" font-size="11" fill="#687783" text-anchor="middle">女性盆腔正中矢状面（原创示意图）</text></svg>`,
  thyroid:`<svg viewBox="0 0 340 210" width="340"><rect x="146" y="40" width="48" height="140" rx="14" fill="#eee6d8" stroke="#a09a80" stroke-width="2"/><line x1="146" y1="70" x2="194" y2="70" stroke="#a09a80"/><line x1="146" y1="100" x2="194" y2="100" stroke="#a09a80"/><line x1="146" y1="130" x2="194" y2="130" stroke="#a09a80"/><path d="M148 84 C120 74 106 108 128 122 C140 130 146 122 148 112 Z" fill="#e5a8a8" stroke="#a85c5c" stroke-width="2"/><path d="M192 84 C220 74 234 108 212 122 C200 130 194 122 192 112 Z" fill="#e5a8a8" stroke="#a85c5c" stroke-width="2"/><path d="M148 96 C162 92 178 92 192 96" fill="none" stroke="#a85c5c" stroke-width="7"/><text x="112" y="66" font-size="13" fill="#c23a3a">？</text><text x="200" y="170" font-size="12" fill="#687783">气管软骨</text><text x="170" y="200" font-size="11" fill="#687783" text-anchor="middle">颈前部前面观（原创示意图）</text></svg>`,
  conduction:`<svg viewBox="0 0 340 210" width="340"><path d="M70 40 L270 40 L288 120 L240 176 L100 176 L52 120 Z" fill="#f2d9ec" stroke="#a06a9a" stroke-width="2"/><line x1="170" y1="40" x2="170" y2="176" stroke="#a06a9a" stroke-width="1.5" stroke-dasharray="5 4"/><path d="M60 108 C60 86 150 86 150 108 L150 130 C150 152 60 152 60 130 Z" fill="#f7e3ee" stroke="#c58fae"/><path d="M190 108 C190 86 280 86 280 108 L280 130 C280 152 190 152 190 130 Z" fill="#f7e3ee" stroke="#c58fae"/><text x="105" y="124" font-size="12" fill="#687783" text-anchor="middle">右心房</text><text x="235" y="124" font-size="12" fill="#687783" text-anchor="middle">左心房</text><text x="105" y="166" font-size="12" fill="#687783" text-anchor="middle">右心室</text><text x="235" y="166" font-size="12" fill="#687783" text-anchor="middle">左心室</text><circle cx="105" cy="94" r="7" fill="#c23a3a"/><text x="120" y="90" font-size="13" fill="#c23a3a">？</text><circle cx="130" cy="130" r="5" fill="#925900"/><line x1="130" y1="134" x2="130" y2="160" stroke="#925900" stroke-width="3"/><text x="170" y="200" font-size="11" fill="#687783" text-anchor="middle">心脏前面观，？为心脏传导系结构（原创示意图）</text></svg>`,
  brain:`<svg viewBox="0 0 340 210" width="340"><path d="M60 110 C52 70 90 40 140 42 C200 40 260 55 272 95 C284 130 262 168 220 172 C196 174 190 158 186 146 C180 130 196 118 208 108" fill="#f3e0e0" stroke="#b06a6a" stroke-width="2"/><path d="M208 108 C226 98 236 84 232 66" fill="none" stroke="#b06a6a" stroke-width="2"/><path d="M100 70 C120 100 130 130 132 158" fill="none" stroke="#687783" stroke-width="1.6" stroke-dasharray="4 3"/><path d="M92 86 C160 96 226 96 252 74" fill="none" stroke="#925900" stroke-width="2.2"/><text x="120" y="55" font-size="12" fill="#687783">额叶</text><text x="188" y="55" font-size="12" fill="#687783">顶叶</text><text x="256" y="140" font-size="12" fill="#687783">枕叶</text><text x="120" y="130" font-size="13" fill="#c23a3a">？</text><text x="258" y="70" font-size="11" fill="#925900">中央沟</text><text x="176" y="112" font-size="11" fill="#925900">外侧沟</text><text x="170" y="200" font-size="11" fill="#687783" text-anchor="middle">大脑半球外侧面（原创示意图）</text></svg>`
};

const SYSTEM_BANKS={
"运动系统":{title:"运动系统·深度学习（主战场）",questions:[
{layer:"肌学",id:1,type:"single",knowledgePoint:"肱肌",prompt:"肱肌的主要作用是？",options:["屈肘关节","伸肘关节","外展肩关节","旋前前臂"],correct:"A",score:10,errorType:"D",brief:"肱肌的起止与作用",explain:"肱肌起自肱骨体前面下半，止于尺骨粗隆，主要作用为屈肘关节。",scene:"社区体检中，一位长期伏案工作者主诉屈肘费力，需判断受累肌肉。"},
{layer:"骨学",id:2,type:"single",knowledgePoint:"肱骨骨性结构",prompt:"肱骨近端的骨性标志是？",options:["大结节","冠突","尺骨鹰嘴","桡骨头"],correct:"A",score:10,errorType:"C",brief:"肱骨标志辨认",explain:"大结节位于肱骨上端外侧，是肩部重要骨性标志；冠突、鹰嘴属尺骨，桡骨头属桡骨。",scene:"体态评估触诊肩部骨性标志时，需定位的肱骨上端结构是？"},
{layer:"关节学",id:3,type:"multiple",knowledgePoint:"肩关节",prompt:"肩关节的组成结构包括？",options:["肱骨头","肩胛骨关节盂","尺骨滑车","关节囊"],correct:["A","B","D"],score:10,errorType:"B",brief:"肩关节组成",explain:"肩关节由肱骨头与肩胛骨关节盂构成，外被关节囊；尺骨滑车参与肘关节。",scene:"为圆肩客户设计肩带稳定性训练前，需先明确参与的关节结构。"},
{layer:"骨学",id:4,type:"fill",knowledgePoint:"骨连接",prompt:"骨与骨之间借纤维结缔组织、软骨或骨相连，统称为___。",options:[],correct:["骨连接","骨连结"],score:10,errorType:"A",brief:"骨连接的定义",explain:"骨与骨之间的连结结构统称骨连接（骨连结），包括直接连结与间接连结（关节）。",scene:"向客户解释「为何久坐后关节发僵」时，需先讲清骨与骨的连结形式。"},
{layer:"肌学",id:5,type:"single",knowledgePoint:"肌的起止和作用",prompt:"肌肉中通常被固定的一端称为？",options:["起点","止点","肌腹","腱膜"],correct:"A",score:10,errorType:"A",brief:"肌的起止概念",explain:"肌肉附着中通常固定不动的一端为起点，移动的一端为止点；起点止点是相对的。",scene:"分析头前伸人群的肌力失衡，需先区分肌肉的固定端与移动端。"},
{layer:"关节学",id:6,type:"image",knowledgePoint:"肩关节",prompt:"识图判断：图中标“？”的关节属于？",options:["肩关节","肘关节","髋关节","膝关节"],correct:"A",score:10,errorType:"C",brief:"关节图谱辨认",figure:"shoulder",explain:"图示为肩胛骨关节盂与肱骨头构成的肩关节，是典型的球窝关节。",scene:"体态筛查图谱中标注「？」的关节，是圆肩评估的关键部位。"},
{layer:"关节学",id:7,type:"multiple",knowledgePoint:"膝关节",prompt:"膝关节的主要韧带包括？",options:["前交叉韧带","后交叉韧带","髌韧带","桡骨环状韧带"],correct:["A","B","C"],score:10,errorType:"B",brief:"膝关节韧带",explain:"膝交叉韧带（前、后）与髌韧带均为膝关节重要韧带；桡骨环状韧带属肘关节。",scene:"为运动风险较高的客户做膝扭伤宣教，需重点说明的稳定结构是？"},
{layer:"骨学",id:8,type:"single",knowledgePoint:"前臂骨",prompt:"前臂位于外侧（桡侧）的骨是？",options:["桡骨","尺骨","肱骨","肩胛骨"],correct:"A",score:10,errorType:"C",brief:"前臂骨位置",explain:"解剖姿势下前臂外侧为桡骨（桡侧），内侧为尺骨（尺侧）。",scene:"评估前臂旋前受限者时，需先明确桡侧与尺侧各自的骨。"},
{layer:"骨学",id:9,type:"single",knowledgePoint:"肱骨骨性结构",prompt:"肱骨体后面自内上斜向外下的浅沟是？",options:["桡神经沟","尺神经沟","结节间沟","肱骨滋养孔"],correct:"A",score:10,errorType:"B",brief:"桡神经沟",explain:"桡神经沟内有桡神经与肱深动脉走行，肱骨中段骨折易损伤桡神经。",scene:"客户肱骨中段骨折后出现垂腕，需判断易受损伤的神经走行部位。",comp:"L4"},
{layer:"关节学",id:10,type:"single",knowledgePoint:"膝关节",prompt:"膝关节内具有缓冲震荡作用的结构是？",options:["半月板","前交叉韧带","髌韧带","腓侧副韧带"],correct:"A",score:10,errorType:"D",brief:"半月板功能",explain:"半月板为纤维软骨板，加深关节窝并缓冲震荡；交叉韧带主要限制胫骨前后移位。",scene:"为长期深蹲人群做膝部健康宣教时，需讲明起缓冲作用的结构。"},
{id:11,type:"single",layer:"骨学",knowledgePoint:"骨的形态分类",prompt:"按形态分类，腕骨属于？",options:["短骨","长骨","扁骨","不规则骨"],correct:"A",score:10,errorType:"A",brief:"骨的形态分类",scene:"阅读骨科影像报告时，需先明确各类骨的形态归属。",explain:"骨按形态分为长骨、短骨、扁骨和不规则骨四类；腕骨、跗骨属短骨，多成群分布于承受压力且运动复杂的部位。"},
{id:12,type:"single",layer:"骨学",knowledgePoint:"骨的构造",prompt:"骨质按结构可分为？",options:["骨密质和骨松质","骨外膜和骨内膜","红骨髓和黄骨髓","有机质和无机质"],correct:"A",score:10,errorType:"A",brief:"骨的构造层次",scene:"为骨质疏松人群讲解骨强度时，需说明骨质的结构分层。",explain:"骨由骨膜、骨质和骨髓构成；骨质是骨的主要部分，分骨密质（致密坚硬）与骨松质（海绵状、交织成骨小梁）。"},
{id:13,type:"single",layer:"骨学",knowledgePoint:"骨髓",prompt:"成人具有造血功能的红骨髓主要存在于？",options:["骨松质的间隙内","长骨的骨髓腔内","骨密质的骨板间","骨外膜的深面"],correct:"A",score:10,errorType:"B",brief:"红骨髓的分布",scene:"解读血常规异常报告时，需明确成人造血组织的所在部位。",explain:"胎儿及幼儿骨髓均为红骨髓；成年后长骨骨髓腔内的红骨髓被脂肪组织代替成为黄骨髓，红骨髓主要保留于骨松质间隙内。"},
{id:14,type:"single",layer:"骨学",knowledgePoint:"骨的化学成分",prompt:"老年人骨中无机质比例相对增大，其物理特性表现为？",options:["脆性较大，易发生骨折","易变形而不易骨折","弹性和硬度俱佳","韧性增强、不易折断"],correct:"A",score:10,errorType:"D",brief:"骨成分与物理特性",scene:"为老年客户做防跌倒宣教时，需解释其骨折风险增高的结构基础。",explain:"成人骨有机质与无机质之比约为3:7；老年人无机质比例更高，骨的脆性增大、韧性下降，轻微外力即可造成骨折。"},
{id:15,type:"single",layer:"骨学",knowledgePoint:"椎骨一般形态",prompt:"相邻椎骨的椎弓根上、下切迹共同围成？",options:["椎间孔","椎孔","椎管","骶管裂孔"],correct:"A",score:10,errorType:"B",brief:"椎间孔的形成",scene:"客户主诉久坐后下肢放射痛，需判断神经根可能受压的通道。",explain:"椎体与椎弓围成椎孔，各椎孔相连成椎管；相邻椎骨的椎弓根上下切迹围成椎间孔，内有脊神经和血管通过。"},
{id:16,type:"single",layer:"骨学",knowledgePoint:"颈椎特征",prompt:"颈椎区别于其他椎骨的特征性结构是？",options:["横突有横突孔","椎体侧面有肋凹","棘突呈叠瓦状排列","棘突呈板状水平后伸"],correct:"A",score:10,errorType:"A",brief:"颈椎的形态特征",scene:"解读颈椎影像报告时，需明确颈椎的标志性结构。",explain:"颈椎椎体较小、椎孔较大，横突根部有横突孔（内有椎动脉通过），第2—6颈椎棘突末端分叉，这些是与胸、腰椎鉴别的关键。"},
{id:17,type:"single",layer:"骨学",knowledgePoint:"胸椎特征",prompt:"胸椎的主要形态特征是？",options:["椎体侧面及横突有肋凹","横突有孔","椎体最大","棘突末端分叉"],correct:"A",score:10,errorType:"A",brief:"胸椎的形态特征",scene:"进行胸椎节段定位时，需依据其特征性结构。",explain:"胸椎椎体侧面及横突末端有与肋相连的肋凹，棘突细长并向后下方倾斜呈叠瓦状排列，是与肋构成胸廓的基础。"},
{id:18,type:"single",layer:"骨学",knowledgePoint:"腰椎特征",prompt:"腰椎棘突的形态特点是？",options:["呈板状，水平伸向后方","细长并呈叠瓦状","末端分叉","短小而向后下倾斜"],correct:"A",score:10,errorType:"A",brief:"腰椎的形态特征",scene:"为客户定位腰段棘突、评估腰椎生理曲度时，需明确其形态特点。",explain:"腰椎椎体粗大，棘突呈板状、水平伸向后方，棘突间隙较宽，故腰椎穿刺常选第3—4或第4—5腰椎棘突间隙。"},
{id:19,type:"single",layer:"骨学",knowledgePoint:"胸骨角",prompt:"胸骨角平对的标志是？",options:["第2肋软骨，约平第4胸椎下缘","第1肋软骨","第4肋软骨","第7肋软骨"],correct:"A",score:10,errorType:"B",brief:"胸骨角的体表意义",scene:"为客户进行胸部体表定位与肋计数时，需找到起始标志。",explain:"胸骨角是胸骨柄与胸骨体结合处微向前突的横行隆起，两侧平对第2肋软骨，后方约平第4胸椎体下缘，是计数肋和肋间隙的重要标志。"},
{id:20,type:"fill",layer:"骨学",knowledgePoint:"椎骨的数目",prompt:"成人骶骨由5块骶椎融合而成，尾骨通常由___块尾椎融合而成。",options:[],correct:["3~4","3-4","4","3"],score:10,errorType:"A",brief:"椎骨数目",scene:"解读腰骶部影像报告时，需明确各段椎骨的数目。",explain:"成人椎骨共26块：颈椎7、胸椎12、腰椎5、骶骨1（由5块骶椎融合）、尾骨1（由3—4块尾椎融合）。"},
{id:21,type:"multiple",layer:"骨学",knowledgePoint:"肩胛骨标志",prompt:"属于肩胛骨的骨性标志包括？",options:["肩峰","喙突","关节盂","大结节"],correct:["A","B","C"],score:10,errorType:"A",brief:"肩胛骨标志辨认",scene:"体态评估中触诊肩带骨性标志时，需区分肩胛骨与肱骨的标志。",explain:"肩胛骨有肩峰、喙突、关节盂、肩胛冈、肩胛下角等标志；大结节属肱骨，是肩部重要的骨性标志。"},
{id:22,type:"multiple",layer:"骨学",knowledgePoint:"肱骨标志",prompt:"属于肱骨的骨性标志有？",options:["大结节","外科颈","桡神经沟","尺骨鹰嘴"],correct:["A","B","C"],score:10,errorType:"C",brief:"肱骨标志辨认",scene:"评估上肢力线与触诊肘部标志时，需区分肱骨与尺骨的结构。",explain:"肱骨有大结节、小结节、外科颈、三角肌粗隆、桡神经沟、内外上髁等标志；尺骨鹰嘴属尺骨。"},
{id:23,type:"single",layer:"骨学",knowledgePoint:"髋骨的构成",prompt:"髋骨由哪三块骨融合而成？",options:["髂骨、坐骨和耻骨","髂骨、骶骨和尾骨","股骨、髌骨和胫骨","耻骨、坐骨和骶骨"],correct:"A",score:10,errorType:"A",brief:"髋骨的组成",scene:"评估骨盆带与下肢力线时，需明确髋骨的构成。",explain:"髋骨为不规则骨，幼年时由髂骨、坐骨和耻骨以软骨连结，16岁前后在髋臼处融合为一块髋骨。"},
{id:24,type:"single",layer:"关节学",knowledgePoint:"椎间盘",prompt:"椎间盘的纤维环破裂、髓核突出，最可能导致？",options:["椎间盘突出症，压迫神经根","骶髂关节错位","黄韧带肥厚","脊柱滑脱"],correct:"A",score:10,errorType:"D",brief:"椎间盘与间盘突出",scene:"客户主诉久坐后腰痛并向一侧下肢放射，需判断可能的解剖学基础。",explain:"椎间盘由周围的纤维环和中央的胶状髓核构成；纤维环破裂后髓核突出可压迫脊神经根或脊髓，形成椎间盘突出症，以颈、腰部多见。"},
{id:25,type:"single",layer:"关节学",knowledgePoint:"前纵韧带",prompt:"前纵韧带的主要作用是防止脊柱？",options:["过度后伸","过度前屈","过度侧屈","过度旋转"],correct:"A",score:10,errorType:"D",brief:"前纵韧带功能",scene:"为客户设计腰背伸展类动作时，需明确限制过伸的结构。",explain:"前纵韧带位于椎体前面，宽而坚韧，有限制脊柱过度后伸和防止椎间盘向前脱出的作用。"},
{id:26,type:"single",layer:"关节学",knowledgePoint:"后纵韧带",prompt:"后纵韧带的主要作用是防止脊柱？",options:["过度前屈","过度后伸","过度侧屈","椎体左右移位"],correct:"A",score:10,errorType:"D",brief:"后纵韧带功能",scene:"指导客户进行体前屈类拉伸时，需明确限制过度前屈的结构。",explain:"后纵韧带位于椎体后面、椎管前壁，较前纵韧带窄，有限制脊柱过度前屈的作用。"},
{id:27,type:"fill",layer:"关节学",knowledgePoint:"脊柱的生理性弯曲",prompt:"脊柱从侧面观有颈曲、胸曲、腰曲和___曲四个生理性弯曲。",options:[],correct:["骶"],score:10,errorType:"A",brief:"脊柱四曲",scene:"评估客户侧面体态照时，需对照脊柱的正常生理曲度。",explain:"脊柱侧面观有颈曲（凸向前）、胸曲（凸向后）、腰曲（凸向前）和骶曲（凸向后）四个生理性弯曲，增大了脊柱的弹性与承重能力。"},
{id:28,type:"multiple",layer:"关节学",knowledgePoint:"胸廓的组成",prompt:"胸廓由下列哪些结构共同组成？",options:["12对肋","12个胸椎","胸骨","锁骨"],correct:["A","B","C"],score:10,errorType:"A",brief:"胸廓构成",scene:"为客户进行呼吸模式评估时，需明确参与呼吸运动的骨性结构。",explain:"胸廓由12个胸椎、12对肋、胸骨及其骨连结构成，具有保护心肺、参与呼吸运动的功能；锁骨不参与胸廓构成。"},
{id:29,type:"single",layer:"关节学",knowledgePoint:"肩关节特点",prompt:"关于肩关节结构特点的描述，正确的是？",options:["肱骨头大、关节盂浅，关节囊薄而松弛","肱骨头小、关节盂深，关节囊厚而紧张","由肱骨头与肩峰构成","稳定性强而运动幅度小"],correct:"A",score:10,errorType:"A",brief:"肩关节结构特点",scene:"为客户设计肩带稳定性训练前，需明确肩关节的结构特点与风险。",explain:"肩关节由肱骨头与肩胛骨关节盂构成，头大窝浅、关节囊薄而松弛，是全身运动幅度最大但稳定性最差的关节，故易发生脱位。"},
{id:30,type:"multiple",layer:"关节学",knowledgePoint:"肘关节的组成",prompt:"肘关节为复合关节，包括下列哪些关节？",options:["肱尺关节","肱桡关节","桡尺近侧关节","桡腕关节"],correct:["A","B","C"],score:10,errorType:"A",brief:"肘关节构成",scene:"客户肘部活动受限，需判断受累的具体关节。",explain:"肘关节由肱尺关节、肱桡关节和桡尺近侧关节共同组成，包在一个关节囊内；桡腕关节属腕部，不属肘关节。"},
{id:31,type:"single",layer:"关节学",comp:"L4",knowledgePoint:"桡骨环状韧带",prompt:"幼儿前臂被突然牵拉后哭闹、不肯活动上肢，最可能损伤的结构是？",options:["桡骨环状韧带","尺侧副韧带","桡侧副韧带","肱二头肌长头腱"],correct:"A",score:10,errorType:"D",brief:"桡骨小头半脱位",scene:"家长牵拉幼儿手腕后孩子哭闹拒动，健康管理师需快速判断可能损伤并决定是否转诊。",explain:"幼儿桡骨头发育尚不完善、桡骨环状韧带松弛，前臂旋前位被牵拉时易发生桡骨小头半脱位，需及时就医复位。"},
{id:32,type:"single",layer:"关节学",knowledgePoint:"骶髂关节",prompt:"全身最稳固的关节是？",options:["骶髂关节","肩关节","髋关节","膝关节"],correct:"A",score:10,errorType:"A",brief:"骶髂关节的稳定性",scene:"评估骨盆带稳定性与腰骶部负荷传递时，需明确该关节的特点。",explain:"骶髂关节由骶骨与髂骨的耳状面构成，关节面凹凸嵌合、周围韧带强劲，活动度极小，是全身最稳固的关节，主要承担躯干重力向骨盆的传递。"},
{id:33,type:"single",layer:"关节学",knowledgePoint:"髋关节特点",prompt:"关于髋关节结构特点的描述，正确的是？",options:["股骨头大、髋臼深，关节囊及髂股韧带厚而紧张","股骨头大、髋臼浅，关节囊薄而松弛","由股骨头与髋臼唇单独构成","运动幅度明显大于肩关节"],correct:"A",score:10,errorType:"A",brief:"髋关节结构特点",scene:"为老年客户做防跌倒宣教时，需说明髋关节稳定性与骨折风险的关系。",explain:"髋关节由股骨头与髋臼构成，头大窝深，关节囊厚韧并有髂股韧带加强，稳定性强于肩关节，但运动幅度相应较小。"},
{id:34,type:"multiple",layer:"关节学",knowledgePoint:"膝关节的辅助结构",prompt:"膝关节内的重要辅助结构包括？",options:["前交叉韧带","后交叉韧带","内侧半月板","桡骨环状韧带"],correct:["A","B","C"],score:10,errorType:"A",brief:"膝关节辅助结构",scene:"客户运动后膝部疼痛、打软腿，需判断可能受累的膝内结构。",explain:"膝关节内有前、后交叉韧带和内、外侧半月板等重要辅助结构；桡骨环状韧带属肘关节。"},
{id:35,type:"single",layer:"关节学",knowledgePoint:"骨盆的分界",prompt:"大骨盆与小骨盆的分界（界线）由下列哪些结构连成？",options:["骶骨岬、弓状线、耻骨梳和耻骨联合上缘","两侧髂前上棘连线","耻骨联合下缘与尾骨尖","两侧坐骨结节连线"],correct:"A",score:10,errorType:"B",brief:"骨盆界线",scene:"解读盆腔影像报告、定位盆腔脏器时，需明确大小骨盆的分界。",explain:"界线由骶骨岬、弓状线、耻骨梳、耻骨结节和耻骨联合上缘连成，是大、小骨盆的分界。"},
{id:36,type:"single",layer:"关节学",knowledgePoint:"踝关节",prompt:"踝关节（距小腿关节）主要由哪些骨构成？",options:["胫骨、腓骨下端与距骨","胫骨下端与跟骨","距骨与跟骨","腓骨下端与跟骨"],correct:"A",score:10,errorType:"A",brief:"踝关节构成",scene:"客户踝扭伤后肿胀疼痛，需判断受累关节与可能的损伤结构。",explain:"踝关节由胫骨、腓骨下端与距骨滑车构成，主要作背屈与跖屈；距骨与跟骨之间为距跟关节，参与足的内翻与外翻。"},
{id:37,type:"single",layer:"肌学",knowledgePoint:"肌的形态和构造",prompt:"骨骼肌的基本构成是？",options:["肌腹和肌腱","肌腹和筋膜","肌腱和韧带","肌纤维和骨膜"],correct:"A",score:10,errorType:"A",brief:"骨骼肌的构造",scene:"为客户解释肌肉拉伤好发部位时，需说明肌的结构组成。",explain:"每块骨骼肌由肌腹（肌纤维构成，能收缩）和肌腱（致密结缔组织，附着于骨）两部分构成。"},
{id:38,type:"multiple",layer:"肌学",knowledgePoint:"肌的辅助装置",prompt:"属于肌的辅助装置的有？",options:["筋膜","滑膜囊","腱鞘","关节盘"],correct:["A","B","C"],score:10,errorType:"A",brief:"肌辅助装置",scene:"客户腕部反复用力后疼痛，需判断可能受累的辅助结构。",explain:"肌的辅助装置包括筋膜、滑膜囊、腱鞘和籽骨，具有保护、减少摩擦和改变肌牵引方向的作用；关节盘属关节的辅助结构。"},
{id:39,type:"single",layer:"肌学",comp:"L4",knowledgePoint:"斜方肌",prompt:"客户一侧肩膀偏低、耸肩无力，最可能受累的肌肉是？",options:["斜方肌","三角肌","背阔肌","胸大肌"],correct:"A",score:10,errorType:"D",brief:"斜方肌功能与损伤判断",scene:"体态照显示客户一侧肩线偏低且耸肩困难，需判断受累肌肉。",explain:"斜方肌上部纤维上提肩胛骨、下部纤维下降肩胛骨，全部纤维收缩使肩胛骨向脊柱靠拢；一侧斜方肌瘫痪可致该侧肩胛骨下垂、耸肩无力。"},
{id:40,type:"single",layer:"肌学",knowledgePoint:"背阔肌",prompt:"背阔肌的主要作用是？",options:["使肩关节内收、后伸和旋内","使肩关节外展","使肩胛骨上提","屈肘关节"],correct:"A",score:10,errorType:"D",brief:"背阔肌的功能",scene:"为客户设计划船类动作训练时，需明确主要发力肌肉。",explain:"背阔肌位于背下部及胸后外侧，主要作用是使肩关节内收、后伸和旋内；上肢上举固定时可上提躯干。"},
{id:41,type:"single",layer:"肌学",knowledgePoint:"竖脊肌",prompt:"对人体维持直立起重要作用的背深层肌是？",options:["竖脊肌","背阔肌","斜方肌","菱形肌"],correct:"A",score:10,errorType:"D",brief:"竖脊肌的功能",scene:"久坐人群腰背酸痛、直立困难，需明确维持人体直立的关键肌群。",explain:"竖脊肌位于脊柱两侧、斜方肌与背阔肌深面，是背肌中最长最大的肌，一侧收缩使脊柱侧屈，两侧收缩使脊柱后伸并仰头，对维持人体直立至关重要。"},
{id:42,type:"single",layer:"肌学",knowledgePoint:"胸大肌",prompt:"胸大肌的主要作用是？",options:["使肩关节内收、屈和内旋","使肩关节外展","使肩胛骨后缩","伸肘关节"],correct:"A",score:10,errorType:"D",brief:"胸大肌的功能",scene:"圆肩体态客户胸前紧张，需明确短缩肌肉及其作用。",explain:"胸大肌位于胸廓前壁，使肩关节内收、屈和内旋；上肢固定时可上提躯干，并协助吸气。"},
{id:43,type:"single",layer:"肌学",comp:"L4",knowledgePoint:"前锯肌",prompt:"客户做推墙动作时肩胛骨内侧缘翘起呈翼状，最可能无力的肌肉是？",options:["前锯肌","斜方肌","背阔肌","大圆肌"],correct:"A",score:10,errorType:"D",brief:"翼状肩胛的判断",scene:"体态筛查中客户推墙时肩胛骨内侧缘明显翘起，需判断受累肌肉。",explain:"前锯肌牵引肩胛骨向前并紧贴胸廓，其瘫痪时肩胛骨内侧缘翘起，形成翼状肩胛。"},
{id:44,type:"single",layer:"肌学",knowledgePoint:"膈的裂孔",prompt:"膈的食管裂孔约平对？",options:["第10胸椎","第8胸椎","第12胸椎","第1腰椎"],correct:"A",score:10,errorType:"B",brief:"膈的三个裂孔",scene:"解读膈疝相关影像报告时，需明确各裂孔的定位。",explain:"膈有三个裂孔：主动脉裂孔约平第12胸椎，食管裂孔约平第10胸椎，腔静脉孔约平第8胸椎。"},
{id:45,type:"multiple",layer:"肌学",knowledgePoint:"腹肌前外侧群",prompt:"构成腹前外侧壁的肌包括？",options:["腹直肌","腹外斜肌","腹内斜肌","腰方肌"],correct:["A","B","C"],score:10,errorType:"A",brief:"腹前外侧壁肌群",scene:"为客户设计核心训练时，需明确腹壁各层肌肉的构成。",explain:"腹前外侧群包括腹直肌、腹外斜肌、腹内斜肌和腹横肌；腰方肌属腹后群。"},
{id:46,type:"single",layer:"肌学",knowledgePoint:"腹股沟韧带",prompt:"腹股沟韧带由哪块肌的腱膜下缘卷曲增厚形成？",options:["腹外斜肌","腹内斜肌","腹横肌","腹直肌"],correct:"A",score:10,errorType:"B",brief:"腹股沟韧带的形成",scene:"客户腹股沟区不适，需明确该区韧带的来源与体表定位。",explain:"腹外斜肌腱膜下缘在髂前上棘与耻骨结节之间卷曲增厚，形成腹股沟韧带。"},
{id:47,type:"single",layer:"肌学",knowledgePoint:"三角肌",prompt:"三角肌的主要作用是？",options:["使肩关节外展","屈肘关节","伸肘关节","使肩关节内收"],correct:"A",score:10,errorType:"D",brief:"三角肌的功能",scene:"客户肩部外展无力，需判断主要受累肌肉。",explain:"三角肌从前、外、后三面包绕肩关节，主要作用是使肩关节外展（中部纤维）；前部纤维屈和内旋，后部纤维伸和外旋。"},
{id:48,type:"multiple",layer:"肌学",comp:"L4",knowledgePoint:"肩袖",prompt:"组成肩袖（肌腱袖）的肌包括？",options:["冈上肌","冈下肌","小圆肌","三角肌"],correct:["A","B","C"],score:10,errorType:"A",brief:"肩袖肌群构成",scene:"客户举臂时肩部疼痛、外展困难，需判断肩袖的构成肌肉。",explain:"肩袖由冈上肌、冈下肌、小圆肌和肩胛下肌的腱共同构成，包绕肩关节并加强其稳定性；三角肌不属于肩袖。"},
{id:49,type:"single",layer:"肌学",knowledgePoint:"肱二头肌",prompt:"肱二头肌的主要作用是？",options:["屈肘，并使前臂旋后","伸肘关节","屈肩关节并内收","使前臂旋前"],correct:"A",score:10,errorType:"D",brief:"肱二头肌的功能",scene:"客户屈肘及旋后动作无力，需判断受累肌肉。",explain:"肱二头肌位于臂前群浅层，主要作用是屈肘关节，并使旋前的前臂旋后；另有屈肩作用。"},
{id:50,type:"single",layer:"肌学",comp:"L4",knowledgePoint:"肱三头肌的神经支配",prompt:"客户肱骨中段骨折后出现伸肘无力，最可能损伤的神经是？",options:["桡神经","正中神经","尺神经","肌皮神经"],correct:"A",score:10,errorType:"B",brief:"桡神经与肱骨的关系",scene:"客户肱骨干骨折后伸肘困难，需判断受损神经及其走行关系。",explain:"桡神经紧贴肱骨体后面的桡神经沟走行，肱骨中段骨折时易损伤桡神经，导致伸肘、伸腕障碍。"},
{id:51,type:"single",layer:"肌学",comp:"L4",knowledgePoint:"前臂肌起点",prompt:"客户反复用力屈腕后肘内侧疼痛，前臂前群肌多起自？",options:["肱骨内上髁","肱骨外上髁","尺骨鹰嘴","桡骨茎突"],correct:"A",score:10,errorType:"B",brief:"前臂肌的起止",scene:"客户反复屈腕后肘内侧疼痛（高尔夫球肘），需判断受累肌群的起点。",explain:"前臂前群肌共9块，多起自肱骨内上髁，主要司屈腕、屈指和前臂旋前；后群肌多起自肱骨外上髁，司伸腕伸指与旋后。"},
{id:52,type:"single",layer:"肌学",comp:"L4",knowledgePoint:"髂腰肌",prompt:"久坐人群站立时髋前部紧张、骨盆前倾，常与哪块肌短缩有关？",options:["髂腰肌","臀大肌","腘绳肌","胫骨前肌"],correct:"A",score:10,errorType:"D",brief:"髂腰肌与骨盆前倾",scene:"久坐客户站立时骨盆前倾、髋前紧张，需判断可能短缩的肌肉。",explain:"髂腰肌由髂肌和腰大肌组成，主要作用是屈髋关节；长期屈髋久坐可致其短缩紧张，牵拉腰椎增大腰曲，形成骨盆前倾体态。"},
{id:53,type:"single",layer:"肌学",knowledgePoint:"臀大肌",prompt:"臀大肌的主要作用是？",options:["伸髋关节","屈髋关节","外展髋关节","屈膝关节"],correct:"A",score:10,errorType:"D",brief:"臀大肌的功能",scene:"客户从坐位站起困难、爬楼无力，需判断主要受累肌肉。",explain:"臀大肌位于臀部浅层，越过髋关节后方，主要作用是伸髋关节，并使髋关节外旋；人体直立、起立和跑跳时发挥重要作用。"},
{id:54,type:"single",layer:"肌学",comp:"L4",knowledgePoint:"臀中肌",prompt:"客户单腿站立时对侧骨盆下降，最可能无力的肌肉是？",options:["臀中肌","臀大肌","股四头肌","缝匠肌"],correct:"A",score:10,errorType:"D",brief:"臀中肌与 Trendelenburg 征",scene:"体态筛查中客户单腿站立时对侧骨盆下降，需判断无力肌肉并评估跌倒风险。",explain:"臀中肌与臀小肌越过髋关节上方，是维持单腿站立时骨盆水平的主要肌肉；一侧无力时出现对侧骨盆下降（Trendelenburg 征阳性）。"},
{id:55,type:"multiple",layer:"肌学",knowledgePoint:"股四头肌",prompt:"股四头肌包括下列哪些肌？",options:["股直肌","股内侧肌","股外侧肌","股二头肌"],correct:["A","B","C"],score:10,errorType:"A",brief:"股四头肌组成",scene:"客户伸膝无力、上下楼梯困难，需判断受累肌群。",explain:"股四头肌由股直肌、股内侧肌、股外侧肌和股中间肌组成，是膝关节主要的伸肌；股二头肌属大腿后群。"},
{id:56,type:"multiple",layer:"肌学",knowledgePoint:"大腿后群肌",prompt:"大腿后群肌（腘绳肌）包括？",options:["股二头肌","半腱肌","半膜肌","股薄肌"],correct:["A","B","C"],score:10,errorType:"A",brief:"腘绳肌组成",scene:"客户运动中突发大腿后侧疼痛，需判断受累肌群。",explain:"大腿后群肌包括股二头肌、半腱肌和半膜肌，共同作用是伸髋和屈膝；股薄肌属大腿内侧群。"},
{id:57,type:"single",layer:"肌学",knowledgePoint:"小腿三头肌",prompt:"小腿三头肌由腓肠肌和哪块肌组成？",options:["比目鱼肌","胫骨前肌","腓骨长肌","趾长屈肌"],correct:"A",score:10,errorType:"A",brief:"小腿三头肌组成",scene:"客户提踵无力、跟腱区不适，需判断受累肌群。",explain:"小腿三头肌由浅层的腓肠肌和深层的比目鱼肌组成，向下汇合成跟腱止于跟骨，主要作用是使足跖屈。"},
{id:58,type:"single",layer:"肌学",comp:"L4",knowledgePoint:"小腿前群肌",prompt:"客户行走时足尖拖地（足下垂），最可能受累的肌群是？",options:["小腿前群肌","小腿后群肌","小腿外侧群肌","大腿后群肌"],correct:"A",score:10,errorType:"D",brief:"足下垂的判断",scene:"客户行走时足尖拖地，需判断受累肌群并评估是否需要转诊。",explain:"小腿前群肌（胫骨前肌、𧿹长伸肌、趾长伸肌）主要使足背屈并内翻；该群肌麻痹时可出现足下垂、行走时足尖拖地。"},
{id:59,type:"single",layer:"体态生物力学",comp:"L4",knowledgePoint:"人体重力线",prompt:"正常人体直立时，侧面观重力线大致经过？",options:["外耳孔—肩峰—股骨大转子—膝关节前方—外踝前方","枕外隆凸—脊柱正中—足跟","头顶—脐—足跟后方","肩峰—髂前上棘—内踝"],correct:"A",score:10,errorType:"B",brief:"正常重力线参照",scene:"体态评估时，需先建立正常重力线的参照标准，再判断偏离。",explain:"正常直立位侧面观，重力线大致经过外耳孔、肩峰、股骨大转子、膝关节前方和外踝前方，是判断体态偏离的基准。"},
{id:60,type:"multiple",layer:"体态生物力学",comp:"L4",knowledgePoint:"圆肩含胸的肌力失衡",prompt:"圆肩含胸（上交叉综合征）常见的肌力失衡表现为？",options:["胸大肌与胸小肌紧张短缩","中下斜方肌与菱形肌薄弱","肩胛提肌与上斜方肌紧张","股四头肌紧张短缩"],correct:["A","B","C"],score:10,errorType:"D",brief:"上交叉综合征",scene:"办公族客户圆肩含胸，需分析其肌力失衡模式以设计干预方案。",explain:"上交叉综合征表现为胸大肌、胸小肌与肩胛提肌、上斜方肌紧张短缩，而中下斜方肌、菱形肌与颈深屈肌薄弱，形成圆肩含胸头前伸的交叉模式。"},
{id:61,type:"single",layer:"体态生物力学",comp:"L4",knowledgePoint:"头前伸体态",prompt:"头前伸体态中，通常需重点强化（而非牵伸）的肌群是？",options:["颈深屈肌","胸锁乳突肌","肩胛提肌","上斜方肌"],correct:"A",score:10,errorType:"D",brief:"头前伸的干预方向",scene:"客户头前伸明显，制定干预方案时需区分该牵伸还是该强化。",explain:"头前伸时常伴颈深屈肌薄弱与胸锁乳突肌、肩胛提肌、上斜方肌紧张；干预需强化颈深屈肌，同时牵伸后侧紧张肌群。"},
{id:62,type:"multiple",layer:"体态生物力学",comp:"L4",knowledgePoint:"骨盆前倾的肌力失衡",prompt:"骨盆前倾常见的肌力失衡表现为？",options:["髂腰肌与竖脊肌紧张短缩","臀大肌与腹肌薄弱","腘绳肌紧张短缩","胫骨前肌薄弱"],correct:["A","B"],score:10,errorType:"D",brief:"下交叉综合征",scene:"客户站立时骨盆前倾、腰部前凸增大，需分析肌力失衡模式。",explain:"下交叉综合征表现为髂腰肌与腰段竖脊肌紧张短缩，而臀大肌与腹肌薄弱，导致骨盆前倾并增大腰椎前凸。"},
{id:63,type:"single",layer:"体态生物力学",comp:"L4",knowledgePoint:"膝超伸",prompt:"膝超伸（膝反张）体态中，通常相对薄弱的肌群是？",options:["腘绳肌","股四头肌","小腿三头肌","髂腰肌"],correct:"A",score:10,errorType:"D",brief:"膝超伸的失衡分析",scene:"客户站立时膝关节过度后伸，需判断薄弱肌群并设计训练。",explain:"膝超伸者常伴腘绳肌相对薄弱、股四头肌与小腿三头肌紧张，使膝关节被动锁于过伸位，增加关节负荷。"},
{id:64,type:"single",layer:"体态生物力学",comp:"L4",knowledgePoint:"足弓的维持结构",prompt:"维持足内侧纵弓的重要结构包括？",options:["胫骨后肌腱与足底筋膜","腓骨长肌腱","小腿三头肌","胫骨前肌"],correct:"A",score:10,errorType:"D",brief:"足弓维持结构",scene:"客户久站后足底内侧酸痛、足弓塌陷，需判断主要维持结构。",explain:"足内侧纵弓由跟骨、距骨、舟骨、三块楔骨和第1—3跖骨构成，主要靠胫骨后肌腱、足底筋膜与足底韧带维持。"},
{id:65,type:"single",layer:"体态生物力学",comp:"L4",knowledgePoint:"代偿与异常步态",prompt:"髋外展肌薄弱时，行走中常出现的代偿方式是？",options:["躯干向患侧倾斜（Trendelenburg 步态）","加大屈膝角度","足尖着地","上肢摆动幅度增大"],correct:"A",score:10,errorType:"D",brief:"代偿步态识别",scene:"观察客户行走姿态，需识别代偿动作并追溯到薄弱肌群。",explain:"髋外展肌（臀中肌、臀小肌）薄弱时，为维持单腿支撑期骨盆水平，躯干会向患侧倾斜以移动重心，形成 Trendelenburg 步态。"},
{id:66,type:"multiple",layer:"体态生物力学",comp:"L4",knowledgePoint:"核心稳定肌群",prompt:"核心稳定肌群（深层核心）通常包括？",options:["腹横肌","多裂肌","盆底肌","胸大肌"],correct:["A","B","C"],score:10,errorType:"A",brief:"核心稳定肌群构成",scene:"为客户设计核心稳定性训练前，需明确深层核心肌群的构成。",explain:"深层核心包括腹横肌、多裂肌、盆底肌和膈，共同通过腹内压调节维持脊柱稳定；胸大肌属胸廓浅层运动肌，不属于核心稳定肌。"}
]},
"消化系统":{title:"消化系统·单元测评",questions:[
{id:1,type:"single",knowledgePoint:"胃的位置和形态",prompt:"胃大部分位于？",options:["左季肋区和腹上区","右季肋区","脐区","盆腔"],correct:"A",score:10,errorType:"B",brief:"胃的位置",explain:"胃大部分位于左季肋区，小部分位于腹上区。",scene:"客户主诉上腹饱胀，健康管理师需先定位胃所在的腹部分区。"},
{id:2,type:"multiple",knowledgePoint:"肝的毗邻",prompt:"肝脏的主要毗邻结构包括？",options:["胃","右肾","胆囊","脾（与肝直接接触）"],correct:["A","B","C"],score:10,errorType:"B",brief:"肝的毗邻关系",explain:"肝右叶下面邻右肾、结肠右曲，下面左份邻胃，胆囊位于胆囊窝内；脾与肝不直接毗邻。",scene:"解读体检腹部超声报告时，需判断肝与邻近器官的位置关系。"},
{id:3,type:"fill",knowledgePoint:"肝的形态与分叶",prompt:"肝脏膈面以镰状韧带分为肝___和肝右叶。",options:[],correct:["左叶","肝左叶"],score:10,errorType:"A",brief:"肝的分叶术语",explain:"肝膈面借镰状韧带分为肝左叶与肝右叶；肝下面借“H”形沟分四叶。",scene:"阅读肝脏影像报告，需明确镰状韧带划分的肝叶名称。"},
{id:4,type:"single",knowledgePoint:"食管",prompt:"食管的第二个生理性狭窄位于？",options:["主动脉弓跨越处（与其相遇处）","咽与食管交界处","膈食管裂孔处","胃食管连接处"],correct:"A",score:10,errorType:"B",brief:"食管狭窄位置",explain:"食管第二狭窄在主动脉弓与左主支气管跨越处，距中切牙约25cm。",scene:"宣教「细嚼慢咽」时，可解释食管生理性狭窄的好发部位。"},
{id:5,type:"image",knowledgePoint:"胰的位置和形态",prompt:"识图判断：图中位于胃后方、横行于腹后壁的“？”器官是？",options:["胰","脾","肝","胆囊"],correct:"A",score:10,errorType:"C",brief:"胰的图谱辨认",figure:"pancreas",explain:"胰横位于腹后壁第1—2腰椎前方，胃后方，分为头、体、尾。",scene:"腹型肥胖人群代谢风险评估，需先定位腹后壁的「？」器官。"},
{id:6,type:"multiple",knowledgePoint:"胆囊",prompt:"胆囊可分为哪些部分？",options:["底","体","颈","峡"],correct:["A","B","C"],score:10,errorType:"A",brief:"胆囊分部",explain:"胆囊自前向后分为底、体、颈三部分，颈向下延续为胆囊管。",scene:"胆囊结石人群健康宣教中，需说明胆囊的分部。"},
{id:7,type:"single",knowledgePoint:"小肠",prompt:"小肠包括十二指肠、空肠和？",options:["回肠","盲肠","结肠","直肠"],correct:"A",score:10,errorType:"A",brief:"小肠分部",explain:"小肠分为十二指肠、空肠和回肠；盲肠、结肠、直肠属大肠。",scene:"为消化不良客户讲解营养吸收部位时，需列全小肠的分部。"},
{id:8,type:"fill",knowledgePoint:"大肠",prompt:"大肠的起始部是___。",options:[],correct:["盲肠"],score:10,errorType:"A",brief:"大肠起始部",explain:"大肠起自盲肠，止于肛门，分为盲肠、阑尾、结肠、直肠和肛管。",scene:"便秘人群肠道健康宣教，需从大肠的起始部讲起。"},
{id:9,type:"single",knowledgePoint:"阑尾",prompt:"阑尾根部的体表投影（McBurney点）位于？",options:["脐与右髂前上棘连线的中、外1/3交界处","脐与左髂前上棘连线中点","右腹直肌外缘与肋弓交点","脐水平线与右锁骨中线交点"],correct:"A",score:10,errorType:"B",brief:"阑尾体表投影",explain:"McBurney点位于脐与右髂前上棘连线的中、外1/3交界处，阑尾炎症时此处压痛明显。",scene:"客户右下腹压痛，需判断该体表标志是否提示紧急转诊。",comp:"L4"},
{id:10,type:"single",knowledgePoint:"胃的位置和形态",prompt:"幽门约位于？",options:["第1腰椎体右侧","第3腰椎体左侧","第12胸椎左侧","脐平面"],correct:"A",score:10,errorType:"B",brief:"幽门位置",explain:"幽门约平第1腰椎体右侧，是胃与十二指肠的分界。",scene:"解读胃镜报告时，需明确胃与十二指肠分界所处的体表平面。"}
]},
"呼吸系统":{title:"呼吸系统·单元测评",questions:[
{id:1,type:"single",knowledgePoint:"肺的位置和形态",prompt:"肺尖可高出锁骨内侧端上方约？",options:["1—2 cm","5 cm","10 cm","不超过锁骨平面"],correct:"A",score:10,errorType:"B",brief:"肺尖位置",explain:"肺尖高出锁骨内侧1/3段上方2—3cm（约1—2指宽）。",scene:"为驼背客户做肺功能宣教前，需明确肺尖高出锁骨的体表高度。"},
{id:2,type:"single",knowledgePoint:"气管",prompt:"气管在何处分为左、右主支气管？",options:["胸骨角平面（约平第4胸椎下缘）","剑突平面","颈静脉切迹平面","膈肌平面"],correct:"A",score:10,errorType:"A",brief:"气管分叉平面",explain:"气管叉约平胸骨角平面（第4胸椎体下缘），是支气管镜检查的重要标志。",scene:"解释「为何异物易坠入右侧」，需先讲清气管的分叉平面。"},
{id:3,type:"multiple",knowledgePoint:"肺段",prompt:"右肺通常包括的肺叶有？",options:["上叶","中叶","下叶","前叶"],correct:["A","B","C"],score:10,errorType:"A",brief:"肺叶划分",explain:"右肺借斜裂和水平裂分为上、中、下三叶；左肺借斜裂分为上、下两叶。",scene:"制定呼吸训练方案时，需明确右肺的肺叶划分。"},
{id:4,type:"single",knowledgePoint:"鼻腔",prompt:"鼻腔向后经哪个结构通向咽？",options:["鼻后孔（ choanae ）","喉口","咽鼓管咽口","梨状孔"],correct:"A",score:10,errorType:"B",brief:"鼻腔后部通道",explain:"鼻腔经鼻后孔通鼻咽；梨状孔是骨性鼻腔前口。",scene:"讲解鼻呼吸与口呼吸的差异时，需说明鼻腔后部的通道结构。"},
{id:5,type:"image",knowledgePoint:"肺的位置和形态",prompt:"识图判断：图中肺下缘紧邻的“？”结构是？",options:["膈","肝","胃","心包"],correct:"A",score:10,errorType:"C",brief:"肺与膈的毗邻识图",figure:"diaphragm",explain:"肺底膈面与膈相邻，右肺底还借膈与肝相邻。",scene:"评估胸式呼吸异常者时，需判断肺下缘紧邻的「？」结构。"},
{id:6,type:"multiple",knowledgePoint:"胸膜",prompt:"胸膜包括哪些部分？",options:["脏胸膜","壁胸膜","胸膜腔","心包膜"],correct:["A","B","C"],score:10,errorType:"B",brief:"胸膜组成",explain:"胸膜分脏胸膜与壁胸膜，两者围成胸膜腔；心包膜属心包结构。",scene:"解释呼吸时胸痛的原因，需讲明胸膜的分部与腔隙。"},
{id:7,type:"fill",knowledgePoint:"支气管树",prompt:"气管在胸骨角平面分为左、右___。",options:[],correct:["主支气管"],score:10,errorType:"A",brief:"支气管分支",explain:"气管分为左、右主支气管，右主支气管粗短走行较直，异物易坠入。",scene:"宣教「为何右侧更易发生吸入性肺炎」，需明确气管的分支名称。"},
{id:8,type:"single",knowledgePoint:"呼吸肌",prompt:"平静吸气时最主要的呼吸肌是？",options:["膈","腹直肌","胸大肌","肋间内肌"],correct:"A",score:10,errorType:"D",brief:"呼吸肌功能",explain:"膈是最重要的吸气肌，收缩时膈穹下降、胸腔容积增大。",scene:"指导腹式呼吸训练时，需指出最主要的吸气肌。"},
{id:9,type:"single",knowledgePoint:"喉",prompt:"喉腔中最狭窄的部位是？",options:["声门裂","喉前庭","前庭裂","喉室"],correct:"A",score:10,errorType:"B",brief:"喉腔狭窄部位",explain:"声门裂是喉腔最狭窄处，成人异物与急性喉炎水肿的好发部位。",scene:"急救宣教中需强调，喉腔最狭窄、最易发生梗阻的部位是？"},
{id:10,type:"fill",knowledgePoint:"胸膜",prompt:"胸膜腔的最低部位称为___，深吸气时肺下缘也不能到达。",options:[],correct:["肋膈隐窝","肋膈窦"],score:10,errorType:"B",brief:"肋膈隐窝",explain:"肋胸膜与膈胸膜转折处形成肋膈隐窝（肋膈窦），是胸膜腔最低点，胸腔积液常积聚于此。",scene:"解读胸腔积液报告时，需明确积液最先积聚的最低部位。"}
]},
"绪论":{title:"绪论·单元测评",questions:[
{id:1,type:"single",knowledgePoint:"解剖学姿势",prompt:"标准解剖学姿势中，人体应？",options:["身体直立、两眼平视、上肢下垂、掌心向前","身体俯卧、掌心向后","身体坐位、掌心向内","身体屈曲、掌心向下"],correct:"A",score:10,errorType:"A",brief:"标准解剖学姿势",explain:"解剖学姿势强调掌心向前（前臂旋后），一切方位描述均以此为准。",scene:"体态评估前，统一观察标准所采用的人体姿势是？"},
{id:2,type:"multiple",knowledgePoint:"解剖学方位术语",prompt:"描述人体结构相互位置关系的术语包括？",options:["上和下（颅侧与尾侧）","前和后（腹侧与背侧）","内侧和外侧","深和浅以外新增的“快和慢”"],correct:["A","B","C"],score:10,errorType:"A",brief:"方位术语",explain:"方位术语描述空间位置关系（上下、前后、内侧外侧、深浅）；“快慢”是速度概念。",scene:"书写体态评估报告时，规范描述空间位置关系应使用？"},
{id:3,type:"fill",knowledgePoint:"解剖学切面",prompt:"沿人体前后径与垂直轴所作、将人体分为左右两部分的切面是___面。",options:[],correct:["矢状面","正中矢状面"],score:10,errorType:"A",brief:"人体切面",explain:"矢状面将人体分为左右两部分；通过正中线的为正中矢状面。",scene:"分析侧面体态照片时，所参照的人体切面是？"},
{id:4,type:"single",knowledgePoint:"人体器官系统",prompt:"人体结构和功能的基本单位是？",options:["细胞","组织","器官","系统"],correct:"A",score:10,errorType:"A",brief:"人体结构层次",explain:"细胞是结构与功能的基本单位；组织由细胞和细胞间质构成。",scene:"健康宣教「结构与功能」关系前，需明确人体结构与功能的基本单位。"},
{id:5,type:"image",knowledgePoint:"解剖学切面",prompt:"识图判断：图中红色虚线所示、将人体分为左右两部分的切面是？",options:["矢状面","冠状面","水平面","斜切面"],correct:"A",score:10,errorType:"C",brief:"切面识图",figure:"planes",explain:"矢状面沿前后方向垂直纵切，将人体分为左右两部分。",scene:"体态照片中红色虚线所示、将人体分为左右两部分的切面是？"},
{id:6,type:"single",knowledgePoint:"结构与功能",prompt:"人体结构与功能之间的关系通常是？",options:["结构决定并适应功能","结构与功能无关","功能先于结构形成","二者完全相同"],correct:"A",score:10,errorType:"D",brief:"结构功能关系",explain:"结构是功能的物质基础，功能活动又影响结构形态，二者相互依存。",scene:"向客户解释「圆肩为何会引起肩痛」的理论依据是？"},
{id:7,type:"single",knowledgePoint:"正常与变异",prompt:"器官的形态、位置、结构超出常见范围但对功能无明显影响者，通常称为？",options:["变异","畸形","异常","畸变"],correct:"A",score:10,errorType:"A",brief:"变异概念",explain:"变异属正常范围内的个体差异；超出并影响功能者称异常或畸形。",scene:"评估报告中描述个体差异、但不影响功能者，应称为？"},
{id:8,type:"single",knowledgePoint:"解剖学切面",prompt:"将人体分为上、下两部分的切面是？",options:["水平面（横切面）","矢状面","冠状面","正中矢状面"],correct:"A",score:10,errorType:"A",brief:"水平面",explain:"水平面垂直于人体长轴，将人体分为上、下两部分。",scene:"分析人体分段体成分数据时，将人体分为上、下两部分的切面是？"}
]},
"泌尿系统":{title:"泌尿系统·单元测评",questions:[
{id:1,type:"single",knowledgePoint:"肾的位置和形态",prompt:"肾位于腹膜后间隙，通常？",options:["左肾高于右肾","右肾高于左肾","两肾等高","两肾均位于盆腔"],correct:"A",score:10,errorType:"B",brief:"肾的位置",explain:"因肝右叶存在，右肾位置低于左肾约半个椎体（1—2cm）。",scene:"解读体检报告「双肾位置」时，需明确左右肾的高低差异。"},
{id:2,type:"multiple",knowledgePoint:"肾的结构",prompt:"肾的主要结构包括？",options:["肾皮质","肾髓质","肾窦","肝门"],correct:["A","B","C"],score:10,errorType:"C",brief:"肾的结构",explain:"肾实质分皮质与髓质，肾门凹陷入内形成肾窦；肝门属肝结构。",scene:"阅读肾脏超声报告，需明确肾实质的分层与腔隙结构。"},
{id:3,type:"fill",knowledgePoint:"泌尿小管",prompt:"肾的结构与功能单位是___。",options:[],correct:["肾单位"],score:10,errorType:"A",brief:"肾单位",explain:"肾单位由肾小体与肾小管组成，每侧肾约有100万个以上。",scene:"讲解肾功能指标前，需明确肾的结构与功能单位。"},
{id:4,type:"single",knowledgePoint:"输尿管",prompt:"输尿管的第二处狭窄位于？",options:["跨越髂血管处","肾盂与输尿管移行处","膀胱壁内段","尿道内口"],correct:"A",score:10,errorType:"B",brief:"输尿管狭窄",explain:"输尿管三处狭窄：起始处、跨髂血管处（第二狭窄）、壁内段（最狭窄）。",scene:"肾结石患者健康宣教，需说明结石易嵌顿的第二处狭窄。"},
{id:5,type:"image",knowledgePoint:"肾门",prompt:"识图判断：图中“？”所指肾门通常位于肾的？",options:["内侧缘","外侧缘","上极","下极"],correct:"A",score:10,errorType:"C",brief:"肾门识图",figure:"kidney",explain:"肾门位于肾内侧缘中部凹陷处，是肾血管、肾盂、神经淋巴管出入部位。",scene:"解读肾脏影像时，血管与肾盂出入的「？」部位位于肾的？"},
{id:6,type:"single",knowledgePoint:"膀胱",prompt:"膀胱三角位于？",options:["膀胱底内面（两输尿管口与尿道内口之间）","膀胱尖外面","膀胱颈外面","膀胱顶部"],correct:"A",score:10,errorType:"B",brief:"膀胱三角",explain:"膀胱三角缺乏黏膜下层，无论充盈与否均平滑无皱襞，是肿瘤与结核好发部位。",scene:"解读膀胱镜报告时，需明确该处好发病变的三角区域名称。"},
{id:7,type:"single",knowledgePoint:"肾的被膜",prompt:"肾的被膜由外向内依次为？",options:["肾筋膜、脂肪囊、纤维囊","纤维囊、脂肪囊、肾筋膜","脂肪囊、肾筋膜、纤维囊","纤维囊、肾筋膜、脂肪囊"],correct:"A",score:10,errorType:"B",brief:"肾被膜层次",explain:"由外向内为肾筋膜、肾脂肪囊、肾纤维囊；肾周封闭即将药液注入脂肪囊。",scene:"讲解「肾周封闭」治疗时，需明确由外向内的被膜层次。"},
{id:8,type:"fill",knowledgePoint:"输尿管",prompt:"输尿管三处狭窄中最狭窄的是___。",options:[],correct:["壁内段","膀胱壁内段"],score:10,errorType:"B",brief:"输尿管最狭窄处",explain:"壁内段是输尿管最狭窄处，结石易嵌顿于此。",scene:"结石患者的饮食与运动指导，需强调最狭窄、最易嵌顿处。",comp:"L4"}
]},
"生殖系统":{title:"生殖系统·单元测评",questions:[
{id:1,type:"single",knowledgePoint:"睾丸",prompt:"睾丸的主要功能是？",options:["产生精子和分泌雄激素","储存尿液","产生胆汁","分泌胰液"],correct:"A",score:10,errorType:"D",brief:"睾丸功能",explain:"睾丸生精小管产生精子，间质细胞分泌雄激素，兼具外分泌与内分泌功能。",scene:"男性健康宣教中，需说明睾丸兼具的双重功能。"},
{id:2,type:"multiple",knowledgePoint:"男性生殖管道",prompt:"男性生殖管道包括？",options:["附睾","输精管","射精管","输尿管"],correct:["A","B","C"],score:10,errorType:"A",brief:"男性生殖管道",explain:"附睾、输精管、射精管属男性生殖管道；输尿管属泌尿系统。",scene:"解读男性不育检查报告时，需区分生殖管道与泌尿管道。"},
{id:3,type:"fill",knowledgePoint:"子宫",prompt:"子宫位于骨盆腔中央，在膀胱与___之间。",options:[],correct:["直肠"],score:10,errorType:"B",brief:"子宫毗邻",explain:"子宫前邻膀胱、后邻直肠，膀胱充盈程度可改变子宫体位。",scene:"女性体检宣教中，需说明子宫与邻近器官的位置关系。"},
{id:4,type:"single",knowledgePoint:"女性生殖器",prompt:"输卵管由内侧向外侧通常分为子宫部、峡、壶腹和？",options:["漏斗部","阴道部","宫颈部","卵巢部"],correct:"A",score:10,errorType:"A",brief:"输卵管分部",explain:"输卵管由内向外为子宫部、峡、壶腹、漏斗（末端有输卵管伞）。",scene:"解读输卵管造影报告，需明确由内侧向外侧的分部顺序。"},
{id:5,type:"image",knowledgePoint:"子宫",prompt:"识图判断：图中呈梨形、位于膀胱与直肠之间的“？”器官是？",options:["子宫","卵巢","阴道","膀胱"],correct:"A",score:10,errorType:"C",brief:"子宫识图",figure:"uterus",explain:"子宫呈前后略扁的倒置梨形，位于小骨盆中央、膀胱与直肠之间。",scene:"盆腔影像中呈倒置梨形、位于膀胱与直肠之间的「？」器官是？"},
{id:6,type:"single",knowledgePoint:"会阴",prompt:"会阴通常指？",options:["盆膈以下封闭骨盆下口的全部软组织","腹腔顶部","胸腔底部","颅底软组织"],correct:"A",score:10,errorType:"B",brief:"会阴范围",explain:"广义会阴为盆膈以下封闭骨盆下口的软组织，以两侧坐骨结节连线分为前、后两个三角。",scene:"产后康复评估中，需明确会阴的解剖范围。"},
{id:7,type:"single",knowledgePoint:"子宫固定装置",prompt:"维持子宫前倾的主要韧带是？",options:["子宫圆韧带","子宫阔韧带","骶子宫韧带","子宫主韧带"],correct:"A",score:10,errorType:"D",brief:"子宫韧带功能",explain:"子宫圆韧带维持子宫前倾；骶子宫韧带维持前屈；主韧带防止子宫下垂。",scene:"讲解盆底松弛成因时，需说明维持子宫前倾的主要韧带。"},
{id:8,type:"single",knowledgePoint:"男性尿道",prompt:"男性尿道最狭窄的部位是？",options:["尿道外口","尿道内口","膜部","前列腺部"],correct:"A",score:10,errorType:"B",brief:"尿道狭窄",explain:"尿道外口最狭窄；尿道膜部最短最固定，耻骨骨折易损伤。",scene:"导尿操作健康宣教中，需明确男性尿道最狭窄的部位。"}
]},
"内分泌系统":{title:"内分泌系统·单元测评",questions:[
{id:1,type:"single",knowledgePoint:"垂体",prompt:"垂体位于？",options:["蝶骨垂体窝内","颞骨乳突内","筛骨筛窦内","下颌窝内"],correct:"A",score:10,errorType:"B",brief:"垂体位置",explain:"垂体借漏斗连于下丘脑，位于蝶骨体上面的垂体窝内。",scene:"解读垂体影像报告时，需明确其所处的骨性结构。"},
{id:2,type:"multiple",knowledgePoint:"甲状腺",prompt:"甲状腺的形态通常包括？",options:["左叶","右叶","甲状腺峡","锥状叶（可缺如）"],correct:["A","B","C"],score:10,errorType:"A",brief:"甲状腺形态",explain:"甲状腺呈“H”形，分左右两叶与峡部，约半数人有锥状叶。",scene:"甲状腺触诊与超声筛查，需明确其正常形态分部。"},
{id:3,type:"fill",knowledgePoint:"肾上腺",prompt:"肾上腺位于肾的___方，与肾共同包在肾筋膜内。",options:[],correct:["上","上方"],score:10,errorType:"B",brief:"肾上腺位置",explain:"肾上腺左呈半月形、右呈三角形，分别覆于两肾上极内上方。",scene:"解读肾上腺影像时，需明确其与肾的位置关系。"},
{id:4,type:"single",knowledgePoint:"胰岛",prompt:"胰岛主要分泌的调节血糖的激素是？",options:["胰岛素和胰高血糖素","胆汁和胃液","甲状腺素和降钙素","肾上腺素和去甲肾上腺素"],correct:"A",score:10,errorType:"D",brief:"胰岛功能",explain:"胰岛B细胞分泌胰岛素降血糖，A细胞分泌胰高血糖素升血糖。",scene:"糖尿病健康管理宣教中，需明确调节血糖的激素来源。"},
{id:5,type:"image",knowledgePoint:"甲状腺",prompt:"识图判断：图中位于喉与气管前外侧的“？”内分泌腺是？",options:["甲状腺","垂体","胸腺","肾上腺"],correct:"A",score:10,errorType:"C",brief:"甲状腺识图",figure:"thyroid",explain:"甲状腺峡部位于第2—4气管软骨环前方，叶贴于喉与气管两侧。",scene:"颈前部「？」内分泌腺，是代谢评估的常规检查对象。"},
{id:6,type:"single",knowledgePoint:"甲状旁腺",prompt:"甲状旁腺主要参与调节？",options:["血钙水平","血氧水平","胆汁分泌","尿液浓缩"],correct:"A",score:10,errorType:"D",brief:"甲状旁腺功能",explain:"甲状旁腺分泌甲状旁腺激素升血钙；甲状腺滤泡旁细胞分泌降钙素。",scene:"骨质疏松人群补钙宣教，需说明调节血钙的腺体。"},
{id:7,type:"single",knowledgePoint:"甲状腺",prompt:"人体最大的内分泌腺是？",options:["甲状腺","垂体","肾上腺","松果体"],correct:"A",score:10,errorType:"A",brief:"最大的内分泌腺",explain:"甲状腺重约20—30g，是人体最大的内分泌腺。",scene:"内分泌健康宣教中，人体最大的内分泌腺是？"},
{id:8,type:"fill",knowledgePoint:"松果体",prompt:"分泌褪黑素、参与调节睡眠节律的内分泌器官是___。",options:[],correct:["松果体","松果腺"],score:10,errorType:"D",brief:"松果体功能",explain:"松果体位于上丘脑缰连合后上方，分泌褪黑素，儿童期发达。",scene:"睡眠节律干预宣教中，需明确分泌褪黑素的器官。"}
]},
"循环系统":{title:"循环系统·单元测评",questions:[
{id:1,type:"single",knowledgePoint:"心脏的位置和形态",prompt:"心脏位于？",options:["中纵隔内","后纵隔内","腹膜后间隙","上纵隔内"],correct:"A",score:10,errorType:"B",brief:"心脏位置",explain:"心约2/3位于正中矢状面左侧，位于中纵隔内。",scene:"心率异常客户健康评估，需明确心脏所在的纵隔分区。"},
{id:2,type:"multiple",knowledgePoint:"心脏的结构",prompt:"心脏的四个腔包括？",options:["右心房","右心室","左心房","左心室"],correct:["A","B","C","D"],score:10,errorType:"C",brief:"心脏四腔",explain:"心被冠状沟与室间隔分为左右心房和左右心室四个腔。",scene:"解读心脏超声报告，需明确心脏的腔室构成。"},
{id:3,type:"fill",knowledgePoint:"心脏瓣膜",prompt:"左心房与左心室之间的瓣膜是___瓣。",options:[],correct:["二尖瓣","僧帽瓣"],score:10,errorType:"A",brief:"房室瓣",explain:"左房室口周缘附二尖瓣，右房室口为三尖瓣。",scene:"解读心超报告中「左房室口瓣膜」描述时，该瓣膜名称是？"},
{id:4,type:"single",knowledgePoint:"冠状动脉",prompt:"冠状动脉起自？",options:["升主动脉根部（主动脉窦）","肺动脉干","上腔静脉","主动脉弓"],correct:"A",score:10,errorType:"B",brief:"冠状动脉起点",explain:"左、右冠状动脉分别起自主动脉左窦与右窦，走行于冠状沟内。",scene:"冠心病风险宣教中，需说明冠状动脉的起始部位。"},
{id:5,type:"image",knowledgePoint:"心脏传导系",prompt:"识图判断：图中“？”所示心脏传导系正常起搏点是？",options:["窦房结","房室结","房室束","浦肯野纤维"],correct:"A",score:10,errorType:"C",brief:"传导系识图",figure:"conduction",explain:"窦房结位于上腔静脉与右心房交界处界沟上端心外膜深面，是心脏正常起搏点。",scene:"解读心电图时，心脏正常起搏点「？」是？"},
{id:6,type:"single",knowledgePoint:"体循环和肺循环",prompt:"肺循环的起点是？",options:["右心室","左心室","右心房","左心房"],correct:"A",score:10,errorType:"D",brief:"肺循环路径",explain:"肺循环：右心室→肺动脉→肺泡毛细血管→肺静脉→左心房。",scene:"为久坐人群讲解全身循环路径时，需先明确肺循环的起始腔室。"},
{id:7,type:"single",knowledgePoint:"体循环和肺循环",prompt:"体循环的终点（血液回流处）是？",options:["右心房","左心房","右心室","左心室"],correct:"A",score:10,errorType:"D",brief:"体循环路径",explain:"体循环：左心室→主动脉→全身毛细血管→上、下腔静脉→右心房。",scene:"讲解久坐导致下肢回流受阻时，需明确体循环的血液回流部位。"},
{id:8,type:"single",knowledgePoint:"头臂静脉",prompt:"头臂静脉由哪两条静脉汇合而成？",options:["颈内静脉和锁骨下静脉","颈外静脉和颈内静脉","锁骨下静脉和腋静脉","颈内静脉和椎静脉"],correct:"A",score:10,errorType:"B",brief:"头臂静脉组成",explain:"头臂静脉在胸锁关节后方由颈内静脉与锁骨下静脉汇合而成。",scene:"上肢水肿评估时，需明确该静脉由哪两条静脉汇合而成。"}
]},
"感觉器":{title:"感觉器·单元测评",questions:[
{id:1,type:"single",knowledgePoint:"眼球壁",prompt:"眼球壁由外向内依次为？",options:["纤维膜、血管膜、视网膜","视网膜、血管膜、纤维膜","血管膜、纤维膜、视网膜","纤维膜、视网膜、血管膜"],correct:"A",score:10,errorType:"A",brief:"眼球壁层次",explain:"眼球壁三层：外层纤维膜（角膜+巩膜），中层血管膜（虹膜+睫状体+脉络膜），内层视网膜。",scene:"视力保健宣教中，需明确眼球壁由外向内的层次构成。"},
{id:2,type:"multiple",knowledgePoint:"眼球内容物",prompt:"眼球内容物包括？",options:["房水","晶状体","玻璃体","角膜"],correct:["A","B","C"],score:10,errorType:"C",brief:"眼球内容物",explain:"房水、晶状体、玻璃体均无血管、透明，与角膜共同构成屈光系统；角膜属眼球壁纤维膜。",scene:"讲解屈光系统构成时，需区分眼球壁与眼球内容物。"},
{id:3,type:"fill",knowledgePoint:"耳",prompt:"中耳鼓室内连接鼓膜与内耳的听小骨由外向内为锤骨、砧骨和___。",options:[],correct:["镫骨"],score:10,errorType:"A",brief:"听小骨",explain:"三块听小骨构成听骨链，将声波振动由鼓膜传至前庭窗。",scene:"听力筛查宣教中，需明确听骨链由外向内的组成顺序。"},
{id:4,type:"single",knowledgePoint:"视网膜",prompt:"感光细胞主要位于？",options:["视网膜","巩膜","脉络膜","虹膜"],correct:"A",score:10,errorType:"C",brief:"感光细胞位置",explain:"视锥与视杆细胞位于视网膜外层，黄斑中央凹处视锥细胞最密集。",scene:"解释「黄斑为何是视力最敏锐处」时，需明确感光细胞位置。"},
{id:5,type:"image",knowledgePoint:"眼球结构",prompt:"识图判断：能调节晶状体曲度、参与聚焦的结构是？",options:["睫状体","虹膜","巩膜","视神经"],correct:"A",score:10,errorType:"C",brief:"眼球结构识图",figure:"conduction",explain:"睫状体内睫状肌收缩使睫状小带松弛，晶状体变凸、屈光力增强（视近物）。",scene:"视疲劳人群健康宣教，需说明调节晶状体曲度的「？」结构。"},
{id:6,type:"single",knowledgePoint:"前庭蜗器",prompt:"维持身体平衡的感受器主要位于？",options:["前庭器（壶腹嵴、椭圆囊斑、球囊斑）","耳蜗","鼓膜","外耳道"],correct:"A",score:10,errorType:"D",brief:"平衡觉",explain:"前庭器感受直线加速度与旋转加速度；耳蜗的螺旋器（Corti器）感受声波。",scene:"老年人跌倒风险评估，需明确维持身体平衡的感受器所在。",comp:"L4"},
{id:7,type:"single",knowledgePoint:"眼球内容物",prompt:"房水产生于？",options:["睫状体","晶状体","玻璃体","虹膜"],correct:"A",score:10,errorType:"D",brief:"房水循环",explain:"房水由睫状体产生，经眼后房→瞳孔→前房→虹膜角膜角→巩膜静脉窦回流；循环受阻致青光眼。",scene:"青光眼筛查宣教中，需说明房水的产生部位。"},
{id:8,type:"single",knowledgePoint:"耳",prompt:"沟通鼓室与鼻咽部的结构是？",options:["咽鼓管","咽鼓管咽口","蜗水管","鼓室上隐窝"],correct:"A",score:10,errorType:"B",brief:"咽鼓管",explain:"咽鼓管维持鼓室内外气压平衡，小儿咽鼓管短而平直，故中耳炎多见。",scene:"解释「儿童为何易患中耳炎」时，需明确该通道结构。"}
]},
"神经系统":{title:"神经系统·单元测评",questions:[
{id:1,type:"single",knowledgePoint:"中枢神经系统",prompt:"中枢神经系统包括？",options:["脑和脊髓","脑神经和脊神经","交感神经和副交感神经","神经节和神经丛"],correct:"A",score:10,errorType:"A",brief:"中枢神经系统",explain:"脑与脊髓组成中枢神经系统；脑神经、脊神经等属周围神经系统。",scene:"腕部麻木客户评估时，需区分中枢与周围神经系统。",comp:"L4"},
{id:2,type:"multiple",knowledgePoint:"脑膜",prompt:"脑和脊髓的被膜包括？",options:["硬膜","蛛网膜","软膜","胸膜"],correct:["A","B","C"],score:10,errorType:"A",brief:"脑脊髓被膜",explain:"由外向内为硬膜、蛛网膜、软膜三层；蛛网膜下隙含脑脊液。",scene:"讲解腰椎穿刺风险时，需明确脑与脊髓的被膜层次。"},
{id:3,type:"fill",knowledgePoint:"脊髓",prompt:"脊髓下端在成人约平第___腰椎体下缘。",options:[],correct:["1","一","L1","腰1"],score:10,errorType:"A",brief:"脊髓位置",explain:"成人脊髓下端平第1腰椎体下缘，故腰椎穿刺常在第3—4腰椎棘突间进行。",scene:"解释「腰穿为何选第3—4腰椎间隙」，需明确脊髓下端平面。"},
{id:4,type:"single",knowledgePoint:"反射弧",prompt:"完成反射活动的结构基础是？",options:["反射弧","突触小体","神经核","灰质"],correct:"A",score:10,errorType:"D",brief:"反射弧",explain:"反射弧由感受器、传入神经、中枢、传出神经、效应器五部分组成。",scene:"评估膝跳反射异常者时，需明确反射活动的结构基础。"},
{id:5,type:"image",knowledgePoint:"脑的结构",prompt:"识图判断：大脑半球外侧沟下方的“？”脑叶是？",options:["颞叶","额叶","顶叶","枕叶"],correct:"A",score:10,errorType:"C",brief:"脑叶识图",figure:"brain",explain:"外侧沟（Sylvius沟）下方为颞叶；中央沟前方为额叶、后方为顶叶。",scene:"解读脑功能影像时，外侧沟下方的「？」脑叶是？"},
{id:6,type:"single",knowledgePoint:"自主神经",prompt:"支配心肌、平滑肌和腺体的神经属于？",options:["自主神经（内脏运动神经）","躯体运动神经","躯体感觉神经","特殊内脏感觉神经"],correct:"A",score:10,errorType:"D",brief:"自主神经功能",explain:"内脏运动神经（自主神经）分交感与副交感两部，不受意志直接支配。",scene:"讲解「压力为何引起心悸」时，需明确支配内脏的神经类型。"},
{id:7,type:"single",knowledgePoint:"大脑皮层功能定位",prompt:"大脑皮质的躯体运动中枢位于？",options:["中央前回及中央旁小叶前部","中央后回","颞横回","距状沟周围皮质"],correct:"A",score:10,errorType:"D",brief:"皮层功能定位",explain:"中央前回为躯体运动区（倒置、左右交叉投影）；中央后回为躯体感觉区。",scene:"脑卒中康复评估中，需明确躯体运动中枢所在部位。"},
{id:8,type:"fill",knowledgePoint:"脑的结构",prompt:"分布于舌前2/3味蕾、传导味觉的神经是___神经。",options:[],correct:["面","面神经","Ⅶ","7"],score:10,errorType:"B",brief:"味觉神经",explain:"舌前2/3一般内脏感觉由三叉神经（舌神经）传导，味觉由面神经（鼓索）传导；后1/3由舌咽神经。",scene:"客户主诉舌前部味觉减退，需判断受累的脑神经。",comp:"L4"}
]}
};

/* 试点应用成效（占位，请替换为真实试点数据） */
const PILOT_DATA = [
  {cohort:"2024 级健康服务与管理 1 班", pre:62.5, post:84.3, gain:21.8, n:42, note:"运动系统、消化系统两轮对比，AI 路径组较传统组高 14 分"},
  {cohort:"2024 级健康服务与管理 2 班", pre:58.7, post:79.1, gain:20.4, n:40, note:"加入阶段 3 自测后，错题知识点再错率下降 31%"},
  {cohort:"2023 级对照班", pre:60.2, post:70.5, gain:10.3, n:38, note:"传统教学组，作为基线参考"}
];

/* 历史：localStorage key */
const LS_KEY = "anatomy_v2_state_v1";

/* 默认 LLM 配置 */
const DEFAULT_LLM = {
  provider: "mock",
  apiKey: "",
  baseURL: "",
  model: ""
};

/* 教师 PIN */
const TEACHER_PIN = "anatomy2026";

/* ==========================================================
   2. 工具函数
   ========================================================== */

function esc(x){ return String(x??"").replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])) }
function escAttr(x){ return esc(x).replace(/"/g,"&quot;") }
function split(v){ return String(v??"").split(/[|,，、]/).map(x=>x.trim()).filter(Boolean) }
function clone(x){ return JSON.parse(JSON.stringify(x)) }
function ts(){ const d=new Date(); return d.toLocaleTimeString("zh-CN",{hour12:false}) }
function nowISO(){ return new Date().toISOString() }

/* 选项乱序：防止学生盲选固定选项（提升测评效度） */
function shuffleOptions(q){
  if(!q.options || q.options.length < 2) return q;
  var nq = clone(q);
  var idx = [];
  for(var i = 0; i < nq.options.length; i++) idx.push(i);
  for(var j = idx.length - 1; j > 0; j--){
    var r = Math.floor(Math.random() * (j + 1));
    var t = idx[j]; idx[j] = idx[r]; idx[r] = t;
  }
  var remap = function(letter){
    var oldIdx = letter.charCodeAt(0) - 65;
    var newPos = idx.indexOf(oldIdx);
    return String.fromCharCode(65 + newPos);
  };
  var isLetter = function(v){
    return typeof v === "string" && v.length === 1 && v.charCodeAt(0) >= 65 && v.charCodeAt(0) <= 90;
  };
  var newOpts = [];
  for(var k = 0; k < idx.length; k++) newOpts.push(nq.options[idx[k]]);
  nq.options = newOpts;
  if(Array.isArray(nq.correct)){
    var nc = [];
    for(var m = 0; m < nq.correct.length; m++){
      nc.push(isLetter(nq.correct[m]) ? remap(nq.correct[m]) : nq.correct[m]);
    }
    nq.correct = nc;
  } else if(isLetter(nq.correct)){
    nq.correct = remap(nq.correct);
  }
  return nq;
}

/* 评分判定：单选 / 多选 / 填空 */
function markQuestion(q){
  const p = Number(q.score) || 0;
  let g = 0, r = "错误";
  function norma(x){ return String(x||"").trim().replace(/[\s\u3000]/g,"").toLowerCase(); }
  if(q.type === "multiple"){
    const a = Array.isArray(q.answer) ? q.answer : [];
    const c = Array.isArray(q.correct) ? q.correct : [];
    const C = a.filter(function(x){ return c.indexOf(x) >= 0 }).length;
    const W = a.filter(function(x){ return c.indexOf(x) < 0 }).length;
    g = p * Math.max(0, (C - W) / Math.max(c.length, 1));
    r = g >= p ? "正确" : (g > 0 ? "部分正确" : "错误");
  } else if(q.type === "fill"){
    const a = norma(q.answer);
    const arr = Array.isArray(q.correct) ? q.correct : [q.correct];
    const ok = arr.some(function(x){ return norma(x) === a });
    if(ok){ g = p; r = "正确"; }
  } else {
    const want = Array.isArray(q.correct) ? q.correct[0] : q.correct;
    if(norma(q.answer) === norma(want)){ g = p; r = "正确"; }
  }
  return Object.assign({}, q, { g: g, r: r });
}

/* 诊断：聚合一次测评结果 */
function modOf(x, sys){
  if(x.module) return x.module;
  if(KG[x.knowledgePoint] && KG[x.knowledgePoint].m) return KG[x.knowledgePoint].m;
  return sys || "未分类";
}

function diagnose(d){
  const q=(d.questions||[]).map(markQuestion);
  var w=q.filter(function(x){return x.r!=="正确"});
  var total=q.reduce(function(s,x){return s+(+x.score||0);},0);
  var got=q.reduce(function(s,x){return s+x.g;},0);
  const mods={}; q.forEach(function(x){var mk=modOf(x, d.system);(mods[mk]=mods[mk]||[]).push(x);});
  // 掌握度模型更新（指数平滑知识追踪）
  q.forEach(function(x){
    var obs = x.r==="正确" ? 1 : (x.g / Math.max(+x.score||1, 1));
    try{ Mastery.update(x.knowledgePoint, obs); }catch(e){}
  });
  // 知识点错误统计
  const ex={}; w.forEach(function(x){if(!ex[x.knowledgePoint]){ex[x.knowledgePoint]={n:0,t:[]};} ex[x.knowledgePoint].n++; ex[x.knowledgePoint].t.push(x.errorType||"待判定");});
  var E=Object.entries(ex).map(function(pair){var k=pair[0]; var v=pair[1]; return {k:k, n:v.n, t:v.t, state: v.n>1?"完全未掌握":"部分掌握"};});
  // 知识图谱推荐
  const R=[];
  E.forEach(function(x){var arr=(KG[x.k]&&KG[x.k].p)||[]; arr.forEach(function(p){R.push({k:p, for:x.k});});});
  // 错误类型统计
  const T={A:0,B:0,C:0,D:0,"待判定":0}; w.forEach(function(x){T[x.errorType||"待判定"]++;});
  return {q, w, total, got, mods, E, R, T, system: d.system||"", title: d.title||""};
}

/* 本地存储：状态 */
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return { history: [], stats: {answerCount:0, correctCount:0, modules:{}, errorTypes:{A:0,B:0,C:0,D:0}, sessions:0, startAt: nowISO()}, llm: {...DEFAULT_LLM} };
}
function saveState(s){ try{ localStorage.setItem(LS_KEY, JSON.stringify(s)); }catch(e){} }

/* 更新状态（每次测评后） */
function bumpStats(d){
  const s = loadState();
  s.stats.answerCount += d.q.length;
  s.stats.correctCount += d.q.filter(function(x){return x.r==="正确"}).length;
  s.stats.sessions = (s.stats.sessions||0)+1;
  d.q.forEach(x=>{
    var mk = modOf(x, d.system);
    if(x.r!=="正确"){
      s.stats.errorTypes[x.errorType||"待判定"] = (s.stats.errorTypes[x.errorType||"待判定"]||0)+1;
      s.stats.modules[mk] = s.stats.modules[mk]||{total:0, correct:0};
    }
    s.stats.modules[mk] = s.stats.modules[mk]||{total:0, correct:0};
    s.stats.modules[mk].total++;
    if(x.r==="正确") s.stats.modules[mk].correct++;
  });
  // 历史记录
  s.history.unshift({
    ts: nowISO(),
    system: d.system||"",
    title: d.title||"",
    score: d.got, total: d.total,
    correctRate: d.total ? d.got/d.total : 0,
    errors: d.w.length,
    weak: d.E.slice(0,3).map(function(x){return x.k;})
  });
  s.history = s.history.slice(0,10);
  saveState(s);
  // 同步写入统一六维能力档案（测评 → L1/L2/L3，情境题可直接打 L4）
  var u = loadUnified();
  u.quiz.sessions = (u.quiz.sessions||0) + 1;
  u.quiz.answers = (u.quiz.answers||0) + d.q.length;
  u.quiz.correct = (u.quiz.correct||0) + d.q.filter(function(x){return x.r==="正确"}).length;
  d.q.forEach(function(x){
    var mk = modOf(x, d.system);
    u.quiz.modules[mk] = u.quiz.modules[mk] || {total:0, correct:0};
    u.quiz.modules[mk].total++;
    if(x.r==="正确") u.quiz.modules[mk].correct++;
    var ck = compOfQuestion(x);
    var obs = x.r==="正确" ? 1 : ((+x.g||0) / Math.max(+x.score||1, 1)) * 0.5;
    u = compCredit(u, ck, obs, "quiz", d.system||"");
  });
  saveUnified(u);
  return s;
}

/* ==========================================================
   3. 学生端
   ========================================================== */

function setupStudent(){
  const sysSel = document.getElementById("studentSystem");
  document.getElementById("startQuiz").onclick = renderSystemQuiz;
  setStudentScope("motor");
  sysSel.onchange = updateCountHint;
  const layerSel = document.getElementById("quizLayer");
  if(layerSel) layerSel.onchange = updateCountHint;
  document.querySelectorAll("#studentSystem,#assignSingle,#assignMultiple,#assignFill,#assignImage,#assignCount")
    .forEach(function(el){el.addEventListener("input", updateCountHint);});
}

/* 当前生效的层级筛选（仅运动系统主战场模式生效） */
function currentLayer(){
  if(currentScope !== "motor") return "";
  var el = document.getElementById("quizLayer");
  return el ? (el.value || "") : "";
}

function updateCountHint(){
  const name = document.getElementById("studentSystem").value;
  const bank = SYSTEM_BANKS[name]||{questions:[]};
  const allowed = getAllowedTypes();
  const layer = currentLayer();
  var pool = (bank.questions||[]).filter(function(x){return allowed.includes(x.type);});
  if(layer) pool = pool.filter(function(x){ return x.layer === layer; });
  var available = pool.length;
  document.getElementById("countHint").textContent = available;
  document.getElementById("assignCount").max = Math.max(available,1);
  if(+document.getElementById("assignCount").value > available){
    document.getElementById("assignCount").value = Math.max(available,1);
  }
}
function getAllowedTypes(){
  const t=["single","multiple","fill","image"];
  const ids=["assignSingle","assignMultiple","assignFill","assignImage"];
  return t.filter(function(_,i){return document.getElementById(ids[i])&&document.getElementById(ids[i]).checked;});
}

function renderSystemQuiz(){
  const name = document.getElementById("studentSystem").value;
  const bank = SYSTEM_BANKS[name]||{title:name+"·单元测评", questions:[]};
  const allowed = getAllowedTypes();
  var pool = (bank.questions||[]).filter(function(x){return allowed.includes(x.type);});
  if(!pool.length) pool = bank.questions||[];
  const layer = currentLayer();
  if(layer) pool = pool.filter(function(x){ return x.layer === layer; });
  const requested = Math.max(1, +document.getElementById("assignCount").value||pool.length);
  const count = Math.min(requested, pool.length);
  // 自适应选题：优先推送掌握度低（薄弱）的知识点
  var scored = pool.map(function(x){
    return {q:x, m: (Mastery.get(x.knowledgePoint)||{m:.5}).m};
  }).sort(function(a,b){return a.m-b.m;});
  var q = scored.slice(0,count).map(function(x){return x.q;});
  q = q.map(shuffleOptions);

  const typeName={single:"单选题", multiple:"多选题", fill:"填空题", image:"识图选择题"};
  const panel = document.getElementById("quizPanel");
  // 先把每个题目的 HTML 拼出来（避免多层模板字符串嵌套）
  var qHtml = "";
  for (var __qi = 0; __qi < q.length; __qi++) {
    var x = q[__qi];
    var i = __qi;
    var body;
    if(x.type==="fill"){
      body = '<input class="direct-fill" data-i="'+i+'" placeholder="请输入教材规范答案">';
    } else {
      var optHtml = [];
      var opts = x.options || [];
      for (var __oi = 0; __oi < opts.length; __oi++) {
        var o = opts[__oi];
        var j = __oi;
        var l = String.fromCharCode(65+j);
        var t = x.type==="multiple" ? "checkbox" : "radio";
        optHtml.push('<label class="option"><input type="'+t+'" name="direct'+i+'" value="'+l+'">'+l+'. '+esc(o)+'</label>');
      }
      body = optHtml.join("");
    }
    var fig = "";
    if(x.figure && FIGURES[x.figure]){
      fig = '<div class="figure">'+FIGURES[x.figure]+'<div class="muted small" style="text-align:center">原创示意图（依据人卫版教材绘制）</div></div>';
    }
    var sceneHtml = x.scene
      ? '<div class="qscene"><span class="qscene-tag">健康服务场景</span>'+esc(x.scene)+'</div>'
      : "";
    var ck = compOfQuestion(x);
    var compHtml = COMP_BY_KEY[ck]
      ? '<span class="comp-tag tier-'+COMP_BY_KEY[ck].tier+'">'+ck+' '+COMP_BY_KEY[ck].name+'</span>'
      : "";
    var layerHtml = x.layer
      ? '<span class="layer-tag">'+esc(x.layer)+'</span>'
      : "";
    qHtml += '<div class="quiz-q">'+
      '<div class="qtitle"><span class="qno">'+(i+1)+'</span>'+esc(x.prompt)+
      '<span class="qtype-tag">'+(typeName[x.type]||x.type)+'</span></div>'+
      sceneHtml+
      '<div class="qmeta">'+layerHtml+esc(modOf(x, name))+' · '+esc(x.knowledgePoint)+compHtml+'</div>'+
      fig+
      body+
      '</div>';
  }
  const warnNote = count<requested
    ? '<div class="callout">题型所限，已使用现有 '+count+' 题。</div>'
    : "";
  panel.innerHTML =
    '<h1>'+esc(bank.title)+'</h1>'+
    '<p class="muted">本次测试系统：<b>'+esc(name)+'</b> · 共 '+count+' 题 · 已按掌握度优先推送薄弱知识点，选项顺序随机打乱</p>'+
    warnNote+
    qHtml+
    '<div class="actions">'+
      '<button class="primary" id="submitDirect">提交测评</button>'+
      '<button class="ghost" id="resetQuiz">重做</button>'+
    '</div>'+
    '<div id="studentReport" style="margin-top:18px"></div>';
  document.getElementById("resetQuiz").onclick = renderSystemQuiz;
  document.getElementById("submitDirect").onclick = function(){
    var qs = [];
    for (var __qsi = 0; __qsi < q.length; __qsi++) {
      var x = q[__qsi];
      var i = __qsi;
      var a;
      if(x.type==="fill") {
        a = document.querySelector('.direct-fill[data-i="'+i+'"]').value.trim();
      } else {
        var checked = [];
        var __sel = document.querySelectorAll('input[name="direct'+i+'"]:checked');
        for (var __csi = 0; __csi < __sel.length; __csi++) checked.push(__sel[__csi]);
        a = x.type==="multiple" ? checked.map(function(y){return y.value;}) : ((checked[0] && checked[0].value) || "");
      }
      qs.push({type: x.type, module: modOf(x, name), knowledgePoint: x.knowledgePoint, prompt: x.prompt, options: x.options, correct: x.correct, score: x.score, brief: x.brief, explain: x.explain, figure: x.figure, errorType: x.errorType, answer: a});
    }
    var d = diagnose({title:bank.title, system:name, questions:qs});
    bumpStats(d);
    renderStudentReport(d);
    renderDiagnosis();
    document.getElementById("lastUpdate").textContent = "最近刷新："+ts();
  };
}

/* 学生报告 */
function renderStudentReport(d){
  var wrap = document.getElementById("studentReport");
  var goodMods = [];
  var goodArr = Object.entries(d.mods);
  for (var i = 0; i < goodArr.length; i++) {
    var e = goodArr[i];
    var a1 = e[1];
    var cnt = 0;
    for (var j = 0; j < a1.length; j++) { if (a1[j].r === "正确") cnt++; }
    if (a1.length > 0 && cnt / a1.length >= 0.8) goodMods.push(e);
  }
  var rowsArr = Object.entries(d.mods);
  var rowsHtml = "";
  for (var i2 = 0; i2 < rowsArr.length; i2++) {
    var m = rowsArr[i2][0];
    var a2 = rowsArr[i2][1];
    var cnt2 = 0;
    for (var j2 = 0; j2 < a2.length; j2++) { if (a2[j2].r === "正确") cnt2++; }
    var z = a2.length > 0 ? cnt2 / a2.length : 0;
    var tag = z >= 0.8 ? '<span class="good">掌握良好</span>' : '<span class="bad">需要巩固</span>';
    rowsHtml += '<tr><td>' + esc(m) + '</td><td>' + (z * 100).toFixed(1) + '%</td><td>' + tag + '</td></tr>';
  }
  var goodPointsArr = [];
  var goodPts = [];
  for (var g = 0; g < goodMods.length; g++) {
    var inner = goodMods[g][1];
    for (var gi = 0; gi < inner.length; gi++) {
      if (inner[gi].r === "正确") goodPts.push(inner[gi].knowledgePoint);
    }
  }
  var seen = {};
  for (var gk = 0; gk < goodPts.length; gk++) {
    if (!seen[goodPts[gk]]) { goodPointsArr.push(goodPts[gk]); seen[goodPts[gk]] = 1; }
  }
  var goodPoints = goodPointsArr.join("、") || "暂无";
  var topE = d.E.slice(0, 3);
  var weakParts = [];
  for (var wi = 0; wi < topE.length; wi++) {
    var xw = topE[wi];
    var prereq = (KG[xw.k] && KG[xw.k].p) || [];
    var preq = "";
    if (prereq.length) {
      var plist = [];
      for (var pi = 0; pi < prereq.length; pi++) plist.push(esc(prereq[pi]));
      preq = '<p class="muted small">前置知识：' + plist.join("、") + '（先复习这些再回看薄弱点）</p>';
    }
    weakParts.push('<div class="stage"><b>薄弱：' + esc(xw.k) + '</b><span class="muted small"> · ' + esc(xw.state) + ' · ' + xw.t.join("、") + '类错误</span>' + preq + '</div>');
  }
  var weakRec = weakParts.join("");

  var wPtsArr = [];
  for (var wp = 0; wp < d.w.length; wp++) wPtsArr.push(d.w[wp].knowledgePoint);
  var wPtsStr = wPtsArr.join("、");

  var RKeys = [];
  var RSeen = {};
  for (var ri = 0; ri < d.R.length; ri++) {
    if (!RSeen[d.R[ri].k]) { RKeys.push(d.R[ri].k); RSeen[d.R[ri].k] = 1; }
  }
  var RKeysEsc = [];
  for (var rki = 0; rki < RKeys.length; rki++) RKeysEsc.push(esc(RKeys[rki]));
  var RHtml = RKeysEsc.length ? '<span class="muted small">推荐先复习：' + RKeysEsc.join("、") + '</span>' : "";

  var wRows = [];
  for (var wr = 0; wr < d.w.length; wr++) {
    var xwr = d.w[wr];
    wRows.push('<tr><td>' + esc(xwr.knowledgePoint) + '</td><td>' + esc(xwr.errorType || "待判定") + '</td><td>' + esc(xwr.brief) + '</td></tr>');
  }
  var wRowsHtml = wRows.join("");

  var correctPct = d.total ? ((d.got / d.total) * 100).toFixed(1) : "0";

  // 逐题复盘：显示你的答案 vs 正确答案 + 解析 + 识图 + 掌握度
  var reviewParts = [];
  for (var rv = 0; rv < d.q.length; rv++) {
    var xr = d.q[rv];
    var yourAns = Array.isArray(xr.answer) ? xr.answer.join("、") : (xr.answer || "（未作答）");
    var corrTexts;
    if (xr.type === "fill") {
      corrTexts = Array.isArray(xr.correct) ? xr.correct : [xr.correct];
    } else {
      var ctArr = Array.isArray(xr.correct) ? xr.correct : [xr.correct];
      corrTexts = [];
      for (var cti = 0; cti < ctArr.length; cti++) {
        var cLetter = String(ctArr[cti]);
        var cIdx = cLetter.charCodeAt(0) - 65;
        corrTexts.push((xr.options && xr.options[cIdx] !== undefined) ? xr.options[cIdx] : cLetter);
      }
    }
    var rTag = xr.r === "正确" ? '<span class="good">✓ 正确</span>' : (xr.r === "部分正确" ? '<span class="warn">◐ 部分正确</span>' : '<span class="bad">✗ 错误</span>');
    var rFig = (xr.figure && FIGURES[xr.figure]) ? '<div class="figure">' + FIGURES[xr.figure] + '</div>' : "";
    var mObj = {m:.5, n:0};
    try { mObj = Mastery.get(xr.knowledgePoint) || mObj; } catch(e){}
    reviewParts.push('<div class="review-q">' + rTag + ' <b>' + (rv+1) + '．' + esc(xr.prompt) + '</b>' +
      '<div class="muted small">' + esc(xr.knowledgePoint) + ' · 掌握度估计 ' + (mObj.m*100).toFixed(0) + '%（' + Mastery.label(mObj.m) + '，已测 ' + mObj.n + ' 次）</div>' +
      rFig +
      '<div>你的答案：<b>' + esc(yourAns) + '</b>　正确答案：<b style="color:#16794b">' + esc(corrTexts.join(" / ")) + '</b></div>' +
      (xr.explain ? '<p class="small">📖 ' + esc(xr.explain) + '</p>' : '') +
      '</div>');
  }
  var reviewHtml = reviewParts.join("");

  // 融合闭环：测评结果 → 数据驱动的体态实训推荐
  var referHtml = "";
  try{
    var uNow = loadUnified();
    var rp = recommendPostureFromQuiz(uNow);
    var rq = recommendQuizFromPosture(uNow);
    var baseOk = ["L1","L2","L3"].every(function(k){ return compPct(uNow, k) >= 60; });
    var pick = rp.picks.length ? rp.picks[0] : null;
    if(!pick){
      var firstMod = Object.keys(POSTURE_MODULES)[0];
      pick = {module: firstMod, title: POSTURE_MODULES[firstMod].title, reason: "把刚学的结构知识用到真实体态案例上"};
    }
    var compLine = COMPETENCY.map(function(c){
      return '<span class="comp-tag tier-'+c.tier+'">'+c.key+' '+compPct(uNow, c.key)+'</span>';
    }).join("");
    referHtml =
      '<h2>🔗 学以致用 · 下一步去哪</h2>' +
      '<div class="callout info"><b>本次测评已计入统一六维能力档案</b><br>' +
        '当前能力值：' + compLine + '</div>' +
      (baseOk
        ? '<p class="muted small">学科基础三维已达标（≥60），可以把知识用起来了。</p>'
        : '<p class="muted small">学科基础三维尚未全部达标，建议先补齐再进入实训：' +
          (rq.low.map(function(l){ return l.key + " " + l.name + "（" + l.pct + "）"; }).join("、") || "无") + '</p>') +
      '<div class="rec-item">' +
        '<div><b>推荐实训：' + esc(pick.title) + '</b><span class="muted small"> ' + esc(pick.reason) + ' </span></div>' +
        '<button class="primary small" id="reportToPosture" data-goto-posture="' + escAttr(pick.module) + '">去体态实训 →</button>' +
      '</div>';
  }catch(e){}

  wrap.innerHTML =
    '<div class="callout ok"><b>已提交 ' + esc(d.system) + ' 测评。</b>以下为本次系统的学习诊断。</div>' +
    '<h2>模块掌握概况</h2>' +
    '<table class="table"><tr><th>知识模块</th><th>正确率</th><th>掌握概况</th></tr>' + rowsHtml + '</table>' +
    '<div class="metrics">' +
      '<div class="metric"><b>' + d.got.toFixed(1) + '/' + d.total + '</b><span>得分</span></div>' +
      '<div class="metric"><b>' + correctPct + '%</b><span>正确率</span></div>' +
      '<div class="metric"><b>' + d.w.length + '</b><span>错题数</span></div>' +
      '<div class="metric"><b>' + d.E.length + '</b><span>薄弱知识点</span></div>' +
    '</div>' +
    '<h2>📊 学情诊断</h2>' +
    '<p class="muted small">掌握良好的三级知识点：' + esc(goodPoints) + '</p>' +
    '<p>需要巩固：<b>' + esc(wPtsStr || "本次未发现错题") + '</b></p>' +
    weakRec +
    '<h2>🚀 个性化学习路径（基于知识图谱）</h2>' +
    '<div class="stage"><strong>阶段 1 · 基础补学</strong> <span class="muted small">建议 18 分钟</span>' +
      '<p>先核对相关前置知识点的定义、结构定位。' + RHtml + '</p>' +
    '</div>' +
    '<div class="stage"><strong>阶段 2 · 针对性强化训练</strong> <span class="muted small">建议 18 分钟</span>' +
      '<p>完成错题知识点的识图、毗邻关系、案例变式练习。</p>' +
    '</div>' +
    '<div class="stage"><strong>阶段 3 · 复盘校验测评</strong> <span class="muted small">建议 9 分钟</span>' +
      '<p>完成下方 ' + esc(d.system) + ' 自测，正确率达 80% 后再次复测。</p>' +
    '</div>' +
    referHtml +
    '<h2>🧾 逐题复盘（含正确答案与解析）</h2>' +
    reviewHtml +
    '<h2>📌 错题摘要</h2>' +
    '<table class="table"><tr><th>知识点</th><th>错误类型</th><th>摘要</th></tr>' + wRowsHtml + '</table>' +
    '<h2>🤖 AI 智能解析</h2>' +
    '<div id="aiExplain">AI 解析生成中…</div>' +
    '<h2>🧪 阶段 3 · ' + esc(d.system) + ' 自测校验（仅本次错题）</h2>' +
    '<div id="selfQuestions"></div>' +
    '<div class="actions"><button class="primary" id="submitSelf">提交自测</button><span class="muted small">正确率达 80% 才算通过</span></div>' +
    '<div id="selfResult"></div>';

  bindSelfTest(d);
  aiExplainErrors(d);
  var toP = document.getElementById("reportToPosture");
  if(toP) toP.onclick = function(){ gotoPostureModule(toP.getAttribute("data-goto-posture")); };
}

/* 阶段 3 自测：仅本次错题，完整题目界面 */
function bindSelfTest(d){
  const sys = d.system || "本次测评";
  // 仅错题（无错题则隐藏自测区）
  const qs = d.w.map(function(x){ return clone(x); });
  const target = document.getElementById("selfQuestions");
  if(!qs.length){
    target.innerHTML = '<p class="muted">本次无错题，无需自测，可直接切换到下一系统学习。</p>';
    var btnHide = document.getElementById("submitSelf");
    if(btnHide) btnHide.style.display = "none";
    return;
  }
  const typeName={single:"单选", multiple:"多选", fill:"填空", image:"识图"};
  target.innerHTML = qs.map((q,i)=>{
    var fig = "";
    if(q.figure && FIGURES[q.figure]){
      fig = '<div class="figure">' + FIGURES[q.figure] + '</div>';
    }
    var body;
    if(q.type==="fill"){
      body = '<input class="self-answer" data-i="'+i+'" placeholder="请输入答案">';
    } else {
      var optHtml = [];
      var opts = q.options || [];
      for(var oi = 0; oi < opts.length; oi++){
        var l = String.fromCharCode(65+oi);
        var t = q.type==="multiple" ? "checkbox" : "radio";
        optHtml.push('<label class="option"><input type="'+t+'" name="self'+i+'" value="'+l+'">'+l+'. '+esc(opts[oi])+'</label>');
      }
      body = optHtml.join("");
    }
    return `<div class="quiz-q">
      <div class="qtitle"><span class="qno">${i+1}</span>${esc(q.prompt)}<span class="qtype-tag">${typeName[q.type]||q.type}</span></div>
      <div class="muted small">${esc(sys)} · ${esc(q.knowledgePoint)}</div>
      ${fig}
      ${body}
    </div>`;
  }).join("");
  document.getElementById("submitSelf").onclick = ()=>{
    let pass = 0;
    qs.forEach((q,i)=>{
      var a;
      if(q.type==="fill"){
        var v = document.querySelector(`.self-answer[data-i="${i}"]`).value.trim();
        a = v;
      } else {
        var sel = document.querySelectorAll('input[name="self'+i+'"]:checked');
        var vals = [];
        for(var si = 0; si < sel.length; si++) vals.push(sel[si].value);
        a = q.type==="multiple" ? vals : (vals[0]||"");
      }
      if(markQuestion({...q, answer:a}).r==="正确") pass++;
    });
    const rate = pass/Math.max(qs.length,1);
    document.getElementById("selfResult").innerHTML =
      `<div class="callout ${rate>=.8?'ok':''}">自测结果：${pass}/${qs.length}，正确率 ${(rate*100).toFixed(1)}%。${rate>=.8?"已达到 80% 通过标准，可以再次进行同一系统形成性测评。":"尚未达到 80%，请继续复习本系统后再测。"}</div>`;
  };
}

/* ==========================================================
   4. 数据看板（ECharts）
   ========================================================== */

let radarChart, barChart, errorPie;

function setupDashboard(){
  renderDashMetrics();
  setTimeout(renderRadar, 60);
  setTimeout(renderBar, 80);
  setTimeout(renderErrorPie, 100);
  renderHistory();
  document.getElementById("exportData").onclick = exportData;
}

function renderDashMetrics(){
  const s = loadState();
  const st = s.stats;
  const total = st.answerCount||0, correct = st.correctCount||0;
  const rate = total ? (correct/total*100).toFixed(1) : 0;
  const sessions = st.sessions||0;
  const modules = Object.keys(st.modules||{}).length;
  let pmCases = 0, pmReferrals = 0, riskFlags = 0;
  let avgAll = 0, avgPro = 0;
  try{
    const u = loadUnified();
    pmCases = u.posture.cases || 0;
    pmReferrals = u.posture.redFlags || 0;
    riskFlags = u.posture.riskFlags || 0;
    var sumAll = 0, sumPro = 0, nPro = 0;
    COMPETENCY.forEach(function(c){
      var p = compPct(u, c.key);
      sumAll += p;
      if(c.tier === "pro"){ sumPro += p; nPro++; }
    });
    avgAll = Math.round(sumAll / COMPETENCY.length);
    avgPro = nPro ? Math.round(sumPro / nPro) : 0;
  }catch(e){}
  document.getElementById("dashMetrics").innerHTML = `
    <div class="metric"><b>${sessions}</b><span>测评次数</span></div>
    <div class="metric"><b>${total}</b><span>累计答题</span></div>
    <div class="metric"><b>${rate}%</b><span>总体正确率</span></div>
    <div class="metric"><b>${modules}</b><span>已覆盖系统</span></div>
    <div class="metric"><b>${pmCases}</b><span>体态实训案例</span></div>
    <div class="metric"><b>${riskFlags}</b><span>风险识别（≥二级）</span></div>
    <div class="metric"><b>${pmReferrals}</b><span>红旗转介识别</span></div>
    <div class="metric"><b>${avgAll}</b><span>六维能力均值</span></div>
    <div class="metric"><b>${avgPro}</b><span>专业三维均值 L4—L6</span></div>
    <div class="metric"><b>${correct}</b><span>累计正确</span></div>
  `;
}

/* 能力档案：统一六维画像（测评 + 实训 共同打点） */
function renderRadar(){
  const u = loadUnified();
  const el = document.getElementById("radarChart");
  if(!el) return;
  var any = false;
  COMPETENCY.forEach(function(c){ if(u.comp[c.key] && u.comp[c.key].n > 0) any = true; });
  if(!any){
    el.innerHTML = '<div class="empty"><p>暂无数据，完成一次单元测评或体态实训后，将自动生成统一六维能力画像。</p></div>';
    if(radarChart){ radarChart.dispose(); radarChart = null; }
    return;
  }
  const values = COMPETENCY.map(function(c){ return compPct(u, c.key); });
  if(!radarChart) radarChart = echarts.init(el);
  radarChart.setOption({
    tooltip: {},
    legend: { data: ["当前能力", "达标线"], bottom: 0, textStyle: { fontSize: 12 } },
    radar: {
      indicator: COMPETENCY.map(function(c){ return {name: c.key + " " + c.name, max: 100}; }),
      radius: "65%", splitNumber: 4,
      axisName: { color: "#33465c", fontSize: 12 },
      splitLine: { lineStyle: { color: "#e3e9ef" } },
      splitArea: { areaStyle: { color: ["#fbfdff", "#f4f8fc"] } },
      axisLine: { lineStyle: { color: "#e3e9ef" } }
    },
    series: [{
      type: "radar",
      data: [
        { value: values, name: "当前能力",
          areaStyle:{ color:"rgba(23,105,209,.18)" },
          lineStyle:{ color:"#1769d1", width:2 },
          itemStyle:{ color:"#1769d1" } },
        { value: COMPETENCY.map(function(){ return 60; }), name: "达标线",
          lineStyle:{ color:"#e0a300", width:1.5, type:"dashed" },
          itemStyle:{ color:"#e0a300" }, symbol:"none" }
      ]
    }]
  }, true);
}

function renderBar(){
  const s = loadState();
  const mods = s.stats.modules||{};
  const names = Object.keys(mods);
  if(!names.length){
    document.getElementById("barChart").innerHTML = `<div class="empty"><p>暂无数据</p></div>`;
    return;
  }
  const correct = names.map(n=>mods[n].correct);
  const wrong = names.map(n=>mods[n].total - mods[n].correct);
  const el = document.getElementById("barChart");
  if(!barChart) barChart = echarts.init(el);
  barChart.setOption({
    tooltip:{ trigger:"axis", axisPointer:{type:"shadow"} },
    legend:{ data:["正确","错误"], top:0 },
    grid:{ left:50, right:20, top:30, bottom:60 },
    xAxis:{ type:"category", data:names, axisLabel:{ rotate:30 } },
    yAxis:{ type:"value" },
    series:[
      { name:"正确", type:"bar", stack:"a", data:correct, itemStyle:{color:"#5cb85c"} },
      { name:"错误", type:"bar", stack:"a", data:wrong, itemStyle:{color:"#d9534f"} }
    ]
  });
}

function renderErrorPie(){
  const s = loadState();
  const T = s.stats.errorTypes||{};
  const data = Object.entries(T).filter(([,v])=>v).map(([k,v])=>({name:k, value:v}));
  if(!data.length){
    document.getElementById("errorPie").innerHTML = `<div class="empty"><p>暂无错误数据</p></div>`;
    return;
  }
  const el = document.getElementById("errorPie");
  if(!errorPie) errorPie = echarts.init(el);
  errorPie.setOption({
    tooltip:{ trigger:"item" },
    legend:{ orient:"vertical", left:0, top:"middle" },
    series:[{
      type:"pie", radius:["45%","70%"], center:["65%","50%"],
      data, label:{ formatter:"{b}: {c} ({d}%)" },
      color:["#1769d1","#00b3a4","#f0ad4e","#d9534f","#9aa6b2"]
    }]
  });
}

function renderHistory(){
  const s = loadState();
  const wrap = document.getElementById("historyTable");
  if(!s.history.length){
    wrap.innerHTML = `<div class="empty"><p>暂无训练记录</p></div>`;
    return;
  }
  wrap.innerHTML = `<table class="table">
    <tr><th>时间</th><th>系统</th><th>得分</th><th>正确率</th><th>错题</th><th>薄弱知识点</th></tr>
    ${s.history.map(h=>`<tr>
      <td class="muted small">${new Date(h.ts).toLocaleString("zh-CN")}</td>
      <td>${esc(h.system)}</td>
      <td>${h.score.toFixed(1)}/${h.total}</td>
      <td>${(h.correctRate*100).toFixed(1)}%</td>
      <td>${h.errors}</td>
      <td class="muted small">${esc((h.weak||[]).join("、"))}</td>
    </tr>`).join("")}
  </table>`;
}

function exportData(){
  const blob = new Blob([JSON.stringify(loadState(), null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "anatomy-learning-data-"+Date.now()+".json";
  a.click();
}

/* ==========================================================
   5. 知识图谱（ECharts graph）
   ========================================================== */

let kgChart;

function setupKG(){
  const sysSel = document.getElementById("kgSystem");
  sysSel.innerHTML = ["<all>",...Object.keys(SYSTEM_BANKS)].map(x=>`<option>${x}</option>`).join("");
  sysSel.onchange = renderKG;
  document.getElementById("kgOnlyWeak").onchange = renderKG;
  setTimeout(renderKG, 100);
}

function renderKG(){
  const sys = document.getElementById("kgSystem").value;
  const onlyWeak = document.getElementById("kgOnlyWeak").checked;
  const s = loadState();
  // 知识点 → 掌握度（基于历史正确率）
  const mastery = {}; // key: knowledgePoint, value: 0..2 (0未学 1部分 2掌握)
  Object.entries(s.stats.modules||{}).forEach(([m,v])=>{
    const r = v.correct/Math.max(v.total,1);
    // 收集该模块下的知识点
    (SYSTEM_BANKS[m]?.questions||[]).forEach(q=>{
      mastery[q.knowledgePoint] = r>=.8 ? 2 : r>=.5 ? 1 : 0;
    });
  });
  // 节点
  const nodes = Object.entries(KG).map(([k,v])=>{
    if(sys!=="<all>" && v.m!==sys) return null;
    const m = mastery[k];
    const weak = m===1 || m===0;
    if(onlyWeak && !weak && m!==undefined) return null;
    const color = m===undefined ? "#9aa6b2" : m===2 ? "#5cb85c" : m===1 ? "#f0ad4e" : "#d9534f";
    return {
      id: k, name: k, category: v.m,
      symbolSize: 22 + (KG[k].p?.length||0)*4,
      itemStyle:{ color }, value: m===undefined?"未学":m===2?"已掌握":m===1?"部分":"未掌握"
    };
  }).filter(Boolean);
  // 边
  const links = [];
  Object.entries(KG).forEach(([k,v])=>{
    (v.p||[]).forEach(p=>{
      if(sys!=="<all>" && (KG[k].m!==sys || KG[p]?.m!==sys)) return;
      links.push({ source: p, target: k });
    });
  });
  const categories = Array.from(new Set(nodes.map(n=>n.category)));
  const el = document.getElementById("kgChart");
  if(!kgChart) kgChart = echarts.init(el);
  kgChart.setOption({
    tooltip:{ formatter: p => p.dataType==="edge" ? `${p.data.source} → ${p.data.target}` : `<b>${p.data.name}</b><br/>系统：${p.data.category}<br/>状态：${p.data.value}<br/>前置：${(KG[p.data.name]?.p||[]).join("、")||"无"}` },
    legend:[{ data:categories, top:0, type:"scroll" }],
    series:[{
      type:"graph", layout:"force",
      categories: categories.map(c=>({name:c})),
      nodes, links,
      roam:true, draggable:true,
      label:{ show:true, position:"right", fontSize:11 },
      force:{ repulsion:160, edgeLength:80, gravity:0.05 },
      lineStyle:{ color:"#aab7c4", curveness:0.1 },
      edgeSymbol:["none","arrow"],
      edgeLabel:{ show:false }
    }]
  });
}

/* ==========================================================
   6. AI 智能伴学
   ========================================================== */

let chatHistory = [];
const SYSTEM_PROMPT = `你是「人体解剖学智评学径智能体」内置的 AI 伴学助手，面向健康服务与管理专业大一学生。你的职责：
1. 用通俗语言解释解剖学知识点（结构、毗邻、功能、术语）。
2. 解析学生错题：给出正确思路、易错点、记忆口诀（如有）。
3. 根据知识图谱给出循序渐进的学习建议。
4. 始终保持「非医疗」边界，不做诊断/治疗推荐。
5. 回答简洁、结构清晰（用编号或要点），避免冗长。`;

async function callLLM(prompt, history=[]){
  const cfg = (loadState().llm || DEFAULT_LLM);
  if(!cfg || cfg.provider==="mock" || !cfg.apiKey){
    return mockLLM(prompt, history);
  }
  // 真实大模型
  const presets = {
    zhipu: { url:"https://open.bigmodel.cn/api/paas/v4/chat/completions", model:"glm-4-flash" },
    dashscope: { url:"https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", model:"qwen-turbo" },
    kimi: { url:"https://api.moonshot.cn/v1/chat/completions", model:"moonshot-v1-8k" },
    openai_compat: { url: cfg.baseURL || "https://api.openai.com/v1/chat/completions", model: cfg.model||"gpt-3.5-turbo" }
  };
  const p = presets[cfg.provider];
  if(!p){ return mockLLM(prompt, history); }
  const url = cfg.baseURL && cfg.provider==="openai_compat" ? cfg.baseURL : p.url;
  const model = cfg.model || p.model;
  const messages = [
    {role:"system", content: SYSTEM_PROMPT},
    ...history.map(h=>({role:h.role, content:h.content})),
    {role:"user", content: prompt}
  ];
  try{
    const resp = await fetch(url, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer "+cfg.apiKey
      },
      body: JSON.stringify({ model, messages, temperature:0.5 })
    });
    if(!resp.ok){
      const txt = await resp.text();
      return `⚠ 调用大模型失败（${resp.status}）。${txt.slice(0,200)}\n\n已自动切换为本地模拟回复模式。\n\n` + mockLLM(prompt, history);
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || mockLLM(prompt, history);
  }catch(e){
    return `⚠ 网络异常：${e.message}\n\n` + mockLLM(prompt, history);
  }
}

/* 本地模拟回复（基于知识图谱的检索） */
function mockLLM(prompt){
  const lower = prompt.toLowerCase();
  // 命中知识点
  const hit = Object.keys(KG).find(k=>prompt.includes(k));
  if(hit){
    const node = KG[hit];
    return `📍 **${hit}**\n\n• 系统：${node.m}\n• 简释：${node.f}\n• 前置知识：${(node.p||[]).join("、")||"无"}\n• 后置关联：${Object.entries(KG).filter(([,v])=>(v.p||[]).includes(hit)).map(([k])=>k).join("、")||"无"}\n\n💡 学习建议：先掌握「${(node.p||[])[0]||hit}」的结构定位，再回到「${hit}」本身。`;
  }
  // 常见问句
  if(/错|错题|错了|怎么记|易错/.test(prompt)){
    return `🔍 **错题解析思路**\n\n1. 先回归题干：圈出关键词（解剖学术语、方位词、动作词）。\n2. 找到对应三级知识点：在知识图谱中确认归属系统。\n3. 检查错误类型：A=名词概念 / B=结构毗邻 / C=识图辨认 / D=功能机制。\n4. 重做一遍 + 复述给同伴（费曼学习法）。\n\n💡 你可以告诉我具体哪道题，我帮你定位到对应知识点。`;
  }
  if(/路径|下一步|接下来|怎么学|推荐/.test(prompt)){
    const s = loadState();
    const weak = Object.entries(s.stats.modules||{}).filter(([,v])=>v.correct/v.total<.7).map(([k])=>k);
    return `🚀 **个性化下一步建议**\n\n${weak.length?`你目前在以下模块正确率偏低：${weak.join("、")}。建议按这个顺序：\n1. 先复习这些模块的基础概念（每天 20 分钟）\n2. 完成本系统的阶段 3 自测（达到 80% 通过）\n3. 切换到下一模块前，先看薄弱模块的知识图谱`:"你目前的模块正确率都在 70% 以上。建议进入「知识图谱」视图，找到红色（未掌握）或橙色（部分掌握）的节点针对性突破。"}\n\n📌 别忘了所有内容仅作教学辅助，疑难以任课教师授课为准。`;
  }
  if(/你好|hi|hello|你是|什么/.test(lower)){
    return `你好！我是「人体解剖学智评学径智能体」内置的 AI 伴学助手 🤖\n\n我能帮你：\n• 解释任何解剖学知识点\n• 解析错题思路\n• 推荐下一步学习路径\n• 整理知识图谱关联\n\n试试问我：「解释肱肌」、「肝的分叶怎么记」、「我下一步该学什么」`;
  }
  // 默认
  return `收到你的问题：「${prompt.slice(0,60)}」\n\n当前为本地模拟模式（未配置大模型 API Key）。我可以基于内置知识图谱帮你：\n• 解释某个解剖学术语\n• 解析最近错题\n• 推荐学习顺序\n\n💡 在「教师端 → 大模型与多模态配置」中填入 API Key 即可启用真实大模型（智谱 GLM-4-Flash 免费层够用）。`;
}

async function aiExplainErrors(d){
  const el = document.getElementById("aiExplain");
  if(!el) return;
  if(!d.w.length){
    el.innerHTML = `<div class="callout ok">本次无错题，AI 暂无需解析。继续保持！</div>`;
    return;
  }
  el.innerHTML = `<div class="callout">AI 正在为你解析 ${d.w.length} 道错题…</div>`;
  const prompt = `请帮我解析以下错题，每题给出：1）正确答案与思路 2）易错点 3）相关知识点记忆口诀（如有）。\n\n`+
    d.w.map((q,i)=>`${i+1}. [${q.module}/${q.knowledgePoint}] ${q.prompt}\n   学生答案：${Array.isArray(q.answer)?q.answer.join("、"):q.answer}\n   正确答案：${Array.isArray(q.correct)?q.correct.join("、"):q.correct}`).join("\n");
  const reply = await callLLM(prompt, chatHistory);
  el.innerHTML = `<div class="callout info" style="white-space:pre-wrap">${esc(reply)}</div>`;
}

function setupAssistant(){
  document.getElementById("chatSend").onclick = sendChat;
  document.getElementById("chatInput").addEventListener("keydown", e=>{
    if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendChat(); }
  });
  document.getElementById("chatClear").onclick = ()=>{
    document.getElementById("chatStream").innerHTML = "";
    chatHistory = [];
    document.getElementById("chatHistory").innerHTML = "";
  };
  document.getElementById("chatVoice").onclick = toggleVoice;
  document.querySelectorAll("#quickPrompts .chip").forEach(c=>{
    c.onclick = ()=>{ document.getElementById("chatInput").value = c.textContent; sendChat(); };
  });
  // 浮窗
  document.getElementById("fabAssistant").onclick = ()=>{
    document.getElementById("fabPop").classList.toggle("hidden");
  };
  document.getElementById("fabClose").onclick = ()=>{
    document.getElementById("fabPop").classList.add("hidden");
  };
  document.getElementById("fabSend").onclick = sendFabChat;
  document.getElementById("fabInput").addEventListener("keydown", e=>{
    if(e.key==="Enter"){ e.preventDefault(); sendFabChat(); }
  });
}

async function sendChat(){
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if(!msg) return;
  input.value = "";
  const stream = document.getElementById("chatStream");
  appendMsg(stream, "user", msg);
  chatHistory.push({role:"user", content:msg});
  if(chatHistory.length>10) chatHistory = chatHistory.slice(-10);
  const reply = await callLLM(msg, chatHistory.slice(0,-1));
  chatHistory.push({role:"assistant", content:reply});
  appendMsg(stream, "ai", reply);
  pushChatLocal(msg);
}

async function sendFabChat(){
  const input = document.getElementById("fabInput");
  const msg = input.value.trim();
  if(!msg) return;
  input.value = "";
  const stream = document.getElementById("fabChat");
  appendMsg(stream, "user", msg);
  const reply = await callLLM(msg);
  appendMsg(stream, "ai", reply);
}

function appendMsg(stream, role, text){
  const div = document.createElement("div");
  div.className = "msg "+role;
  div.innerHTML = `<div class="bubble">${esc(text)}</div>`;
  stream.appendChild(div);
  stream.scrollTop = stream.scrollHeight;
}

/* 语音输入（Web Speech API） */
let recognition = null;
function toggleVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){
    alert("当前浏览器不支持语音识别（建议使用 Chrome / Edge）");
    return;
  }
  if(recognition){
    recognition.stop();
    recognition = null;
    document.getElementById("chatVoice").textContent = "🎙 语音";
    return;
  }
  recognition = new SR();
  recognition.lang = "zh-CN";
  recognition.onresult = (e)=>{
    const text = e.results[0][0].transcript;
    document.getElementById("chatInput").value = text;
    sendChat();
  };
  recognition.onend = ()=>{
    recognition = null;
    document.getElementById("chatVoice").textContent = "🎙 语音";
  };
  recognition.start();
  document.getElementById("chatVoice").textContent = "⏹ 停止";
}

/* 本地历史（最近 10 条） */
function pushChatLocal(q){
  let arr = JSON.parse(localStorage.getItem("anatomy_chat_local")||"[]");
  arr.unshift({ts:Date.now(), q});
  arr = arr.slice(0,10);
  localStorage.setItem("anatomy_chat_local", JSON.stringify(arr));
  renderChatLocal();
}
function renderChatLocal(){
  const arr = JSON.parse(localStorage.getItem("anatomy_chat_local")||"[]");
  const ul = document.getElementById("chatHistory");
  ul.innerHTML = arr.map(x=>`<li onclick="document.getElementById('chatInput').value='${escAttr(x.q)}'"><span>${esc(x.q)}</span><span class="ts">${new Date(x.ts).toLocaleTimeString("zh-CN",{hour12:false})}</span></li>`).join("");
}

/* ==========================================================
   7. 教师端
   ========================================================== */

function setupTeacher(){
  // PIN 登录
  const gate = document.getElementById("teacherGate");
  const ws = document.getElementById("teacherWorkspace");
  const rep = document.getElementById("teacherReport");
  const pin = document.getElementById("teacherPin");
  const login = document.getElementById("teacherLogin");
  const msg = document.getElementById("teacherLoginMsg");
  if(sessionStorage.getItem("anatomyTeacherUnlocked")==="1"){
    gate.classList.add("hidden");
    ws.classList.remove("hidden");
    rep.classList.remove("hidden");
  }
  const unlock = ()=>{
    if(pin.value===TEACHER_PIN){
      gate.classList.add("hidden");
      ws.classList.remove("hidden");
      rep.classList.remove("hidden");
      sessionStorage.setItem("anatomyTeacherUnlocked","1");
      msg.textContent = "教师端已解锁。";
      initTeacher();
    } else msg.textContent = "口令不正确，请联系课程教师。";
  };
  login.onclick = unlock;
  pin.onkeydown = e=>{ if(e.key==="Enter") unlock(); };

  // 大模型配置
  const cfg = loadState().llm||{};
  document.getElementById("llmKey").value = cfg.apiKey||"";
  document.getElementById("llmBase").value = cfg.baseURL||"";
  document.getElementById("llmModel").value = cfg.model||"";
  document.getElementById("llmProvider").value = cfg.provider||"mock";
  document.getElementById("saveLlm").onclick = ()=>{
    const s = loadState();
    s.llm = {
      provider: document.getElementById("llmProvider").value,
      apiKey: document.getElementById("llmKey").value.trim(),
      baseURL: document.getElementById("llmBase").value.trim(),
      model: document.getElementById("llmModel").value.trim()
    };
    saveState(s);
    document.getElementById("aiStatusText").textContent =
      s.llm.provider==="mock" ? "AI 大脑 · 本地模式" : `AI 大脑 · ${s.llm.provider}`;
    document.getElementById("aiStatus").classList.toggle("ok", s.llm.provider!=="mock");
    document.getElementById("aiStatus").querySelector(".dot").classList.toggle("off", s.llm.provider==="mock");
    alert("已保存大模型配置。");
  };
  document.getElementById("testLlm").onclick = async ()=>{
    document.getElementById("llmTestResult").textContent = "测试中…";
    const r = await callLLM("你好，请用一句话介绍你自己。");
    document.getElementById("llmTestResult").innerHTML = `<pre style="white-space:pre-wrap;margin-top:8px">${esc(r.slice(0,400))}</pre>`;
  };

  // 试点成效
  document.getElementById("pilotTable").innerHTML = `
    <tr><th>班级</th><th>前测均分</th><th>后测均分</th><th>提升</th><th>样本</th><th>备注</th></tr>
    ${PILOT_DATA.map(p=>`<tr>
      <td>${esc(p.cohort)}</td>
      <td>${p.pre}</td>
      <td>${p.post}</td>
      <td><b class="good">+${p.gain}</b></td>
      <td>${p.n}</td>
      <td class="muted small">${esc(p.note)}</td>
    </tr>`).join("")}
  `;
  document.getElementById("downloadSummary").onclick = downloadSummary;
}

function initTeacher(){
  const sysSel = document.getElementById("teacherSystem");
  sysSel.innerHTML = Object.keys(SYSTEM_BANKS).map(function(x){return '<option>'+x+'</option>';}).join("");
  setupQuestionEditor();
  document.getElementById("loadSampleCohort").onclick = loadSampleCohort;
  document.getElementById("runReport").onclick = runCohortReport;
}

let draft = [];
function setupQuestionEditor(){
  const list = document.getElementById("questionList");
  const add = document.getElementById("addQuestion");
  const msg = document.getElementById("teacherMsg");
  const publishBtn = document.getElementById("publishQuiz");
  const box = document.getElementById("quizEditor");
  if(!list||!add||!msg||!publishBtn) return;
  const system = ()=>document.getElementById("teacherSystem")?.value||"运动系统";

  const readCard = (i)=>{
    const c = list.querySelector(`.q-card[data-i="${i}"]`); if(!c) return;
    const q = draft[i];
    q.type = c.querySelector('[data-field="type"]').value;
    q.prompt = c.querySelector('[data-field="prompt"]').value;
    q.score = +c.querySelector('[data-field="score"]').value || 0;
    q.correct = q.type==="multiple" ? split(c.querySelector('[data-field="correct"]').value)
      : q.type==="fill" ? split(c.querySelector('[data-field="correct"]').value)
      : c.querySelector('[data-field="correct"]').value.trim();
    q.errorType = c.querySelector('[data-field="errorType"]').value;
    q.knowledgePoint = c.querySelector('[data-field="knowledgePoint"]').value.trim();
    q.brief = c.querySelector('[data-field="brief"]').value.trim();
    q.module = system();
    q.options = [...c.querySelectorAll("[data-option]")].map(x=>x.value.trim()).filter(Boolean);
  };
  const sync = ()=>{ if(box) box.value = JSON.stringify(draft,null,2); };
  const render = ()=>{
    list.innerHTML = draft.map((q,i)=>{
      return `<div class="q-card" data-i="${i}">
        <div class="q-card-head"><span>第 ${i+1} 题</span><button type="button" data-remove="${i}">删除</button></div>
        <div class="q-card-grid">
          <label>题型<select data-field="type">
            <option value="single" ${q.type==="single"?"selected":""}>单选题</option>
            <option value="multiple" ${q.type==="multiple"?"selected":""}>多选题</option>
            <option value="image">识图选择题</option>
            <option value="fill" ${q.type==="fill"?"selected":""}>填空题</option>
          </select></label>
          <label>分值<input data-field="score" type="number" min="0" value="${escAttr(q.score||20)}"></label>
          <label style="grid-column:1/-1">题干<input data-field="prompt" value="${escAttr(q.prompt)}"></label>
          <label>选项 A<input data-option value="${escAttr((q.options||[])[0]||"")}"></label>
          <label>选项 B<input data-option value="${escAttr((q.options||[])[1]||"")}"></label>
          <label>选项 C<input data-option value="${escAttr((q.options||[])[2]||"")}"></label>
          <label>选项 D<input data-option value="${escAttr((q.options||[])[3]||"")}"></label>
          <label>正确答案<input data-field="correct" value="${escAttr(Array.isArray(q.correct)?q.correct.join(","):q.correct||"")}"></label>
          <label>错误类型<select data-field="errorType">${["A","B","C","D","待判定"].map(x=>`<option ${x===(q.errorType||"待判定")?"selected":""}>${x}</option>`).join("")}</select></label>
          <label>三级知识点<input data-field="knowledgePoint" value="${escAttr(q.knowledgePoint||"")}"></label>
          <label>题目简述<input data-field="brief" value="${escAttr(q.brief||"")}"></label>
        </div>
      </div>`;
    }).join("");
    list.querySelectorAll("[data-field=\"type\"]").forEach((el,i)=>el.value=draft[i].type||"single");
    list.querySelectorAll("input,select").forEach(el=>el.addEventListener("input",()=>{const i=+el.closest(".q-card").dataset.i; readCard(i); sync();}));
    list.querySelectorAll("[data-remove]").forEach(btn=>btn.onclick=()=>{draft.splice(+btn.dataset.remove,1); render(); sync();});
    sync();
  };
  const load = ()=>{
    const m = system();
    const bank = SYSTEM_BANKS[m]||{questions:[]};
    draft = (bank.questions||[]).map(clone);
    document.getElementById("quizTitle").value = bank.title||(m+"·单元测评");
    document.getElementById("assignCount").value = (bank.questions||[]).length;
    render();
    msg.textContent = "已载入"+m+"题库，可直接修改题目。";
  };
  window.loadTeacherBank = load;
  document.getElementById("teacherSystem").onchange = load;
  add.onclick = ()=>{
    const type = document.getElementById("tqType").value;
    const raw = document.getElementById("tqCorrect").value.trim();
    const q = {
      id: Date.now(), type, module: system(),
      knowledgePoint: document.getElementById("tqKnowledge").value.trim(),
      prompt: document.getElementById("tqPrompt").value.trim(),
      options: ["tqOptA","tqOptB","tqOptC","tqOptD"].map(id=>document.getElementById(id).value.trim()).filter(Boolean),
      correct: type==="multiple"||type==="fill" ? split(raw) : raw,
      score: +document.getElementById("tqScore").value || 0,
      errorType: document.getElementById("tqError").value,
      brief: document.getElementById("tqBrief").value.trim()
    };
    draft.push(q);
    render();
    ["tqPrompt","tqOptA","tqOptB","tqOptC","tqOptD","tqCorrect","tqKnowledge","tqBrief"].forEach(id=>document.getElementById(id).value="");
    msg.textContent = "已加入一题，请在下方列表中检查后发布。";
  };
  publishBtn.onclick = ()=>{
    draft.forEach((_,i)=>readCard(i));
    const m = system();
    if(!draft.length){ msg.textContent="题库至少需要1道题。"; return; }
    if(draft.some(q=>!q.prompt||!q.knowledgePoint||!q.correct||q.score<=0)){
      msg.textContent="请补齐每题题干、三级知识点、正确答案和正分值。";
      return;
    }
    SYSTEM_BANKS[m] = {
      title: document.getElementById("quizTitle").value || (m+"·单元测评"),
      questions: draft.map((q,i)=>({...q, id:q.id||i+1, module:m}))
    };
    msg.textContent = "已发布"+m+"题库，共"+draft.length+"题；学生端将按本次题量出题。";
  };
  load();
}

/* 班级汇总报告 */
function loadSampleCohort(){
  // 生成 10 名学生的模拟数据
  const samples = [];
  for(let i=0;i<10;i++){
    const qs = SYSTEM_BANKS["运动系统"].questions.map(q=>{
      // 模拟：60% 概率正确
      const correct = Math.random()<0.6;
      let ans;
      if(q.type==="multiple"){
        ans = correct ? q.correct.slice() : [q.correct[0]];
      } else if(q.type==="fill"){
        ans = correct ? q.correct[0] : "填错";
      } else {
        ans = correct ? q.correct : (q.options||[]).filter(o=>o!==q.correct)[0];
      }
      return {...q, answer: ans};
    });
    samples.push({title:"运动系统·单元测评", system:"运动系统", questions:qs});
  }
  document.getElementById("cohort").value = JSON.stringify(samples, null, 2);
}

function runCohortReport(){
  const raw = document.getElementById("cohort").value.trim();
  if(!raw){ alert("请先粘贴或载入示例数据。"); return; }
  let arr;
  try{ arr = JSON.parse(raw); }catch(e){ alert("JSON 解析失败："+e.message); return; }
  if(!Array.isArray(arr)){ alert("数据应为 JSON 数组。"); return; }

  const all = arr.flatMap(r=>(r.questions||[]).map(markQuestion));
  const wrong = all.filter(x=>x.r!=="正确");
  const total = all.length;
  const correct = all.filter(x=>x.r==="正确").length;
  const rate = total ? (correct/total*100).toFixed(1) : 0;
  const mods = {}; all.forEach(x=>(mods[x.module]??={c:0,v:0}).v++, x.r==="正确"&&mods[x.module].c++);
  const T = {A:0,B:0,C:0,D:0,"待判定":0}; wrong.forEach(x=>T[x.errorType||"待判定"]++);
  const ex = {}; wrong.forEach(x=>(ex[x.knowledgePoint]??={n:0,t:[]}, ex[x.knowledgePoint].n++, ex[x.knowledgePoint].t.push(x.errorType||"待判定")));
  const top = Object.entries(ex).sort((a,b)=>b[1].n-a[1].n).slice(0,8);
  const small = arr.length<10;

  document.getElementById("teacherReportOut").innerHTML = `
    <h2>1. 班级整体测评概况</h2>
    <div class="metrics">
      <div class="metric"><b>${arr.length}</b><span>脱敏样本数</span></div>
      <div class="metric"><b>${rate}%</b><span>总体正确率</span></div>
      <div class="metric"><b>${total}</b><span>有效题数</span></div>
      <div class="metric"><b>${wrong.length}</b><span>错题数</span></div>
    </div>
    ${small?'<div class="callout">样本量较少（少于 10 人），涉及人数的统计已隐藏。</div>':""}
    <h2>2. 各知识模块正确率</h2>
    <table class="table"><tr><th>模块</th><th>正确题数</th><th>有效题数</th><th>正确率</th></tr>
      ${Object.entries(mods).map(([m,v])=>`<tr><td>${esc(m)}</td><td>${v.c}</td><td>${v.v}</td><td>${(v.c/v.v*100).toFixed(1)}%</td></tr>`).join("")}
    </table>
    <h2>3. 高频薄弱知识点 Top ${top.length}</h2>
    <table class="table"><tr><th>排名</th><th>知识点</th><th>错题数</th><th>主要错误类型</th></tr>
      ${top.map(([k,v],i)=>`<tr><td>${i+1}</td><td>${esc(k)}</td><td>${v.n}</td><td>${[...new Set(v.t)].join("、")}</td></tr>`).join("")}
    </table>
    <h2>4. 主要错误类型分布</h2>
    <table class="table"><tr><th>类型</th><th>错题数</th><th>占比</th></tr>
      ${Object.entries(T).filter(([,v])=>v).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td><td>${(v/Math.max(wrong.length,1)*100).toFixed(1)}%</td></tr>`).join("")}
    </table>
    <h2>5. 教学优化建议</h2>
    ${Object.entries(T).filter(([,v])=>v).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v],i)=>`
      <div class="stage"><strong>${i===0?"立即调整":i===1?"下一单元调整":"持续巩固"}</strong>
        <p>${k} 类错误占 ${(v/Math.max(wrong.length,1)*100).toFixed(1)}%。${
          k==="A"?"开展名词术语专题复习，配图谱强化记忆。":
          k==="B"?"增加毗邻关系识图练习，结合断层解剖图。":
          k==="C"?"补充结构辨认图与对比图，组织识图小测。":
          k==="D"?"梳理结构-功能对应表，结合临床案例加深理解。":
          "继续观察，做好分类标注。"
        }</p>
      </div>
    `).join("")}
  `;
  // ECharts 图表
  setTimeout(()=>{
    if(!window.tBar) window.tBar = echarts.init(document.getElementById("tBar"));
    window.tBar.setOption({
      tooltip:{trigger:"axis"}, grid:{left:50,right:20,top:30,bottom:60},
      xAxis:{type:"category", data:Object.keys(mods), axisLabel:{rotate:30}},
      yAxis:{type:"value"},
      series:[{type:"bar", data:Object.values(mods).map(v=>(v.c/v.v*100).toFixed(1)), itemStyle:{color:"#1769d1"}}]
    });
    if(!window.tPie) window.tPie = echarts.init(document.getElementById("tPie"));
    const pieData = Object.entries(T).filter(([,v])=>v);
    window.tPie.setOption({
      tooltip:{trigger:"item"}, legend:{top:0},
      series:[{type:"pie", radius:["45%","70%"],
        data: pieData,
        label:{formatter:"{b}: {c}"},
        color:["#1769d1","#00b3a4","#f0ad4e","#d9534f","#9aa6b2"]
      }]
    });
    if(!window.tTopBar) window.tTopBar = echarts.init(document.getElementById("tTopBar"));
    window.tTopBar.setOption({
      tooltip:{}, grid:{left:120,right:30,top:10,bottom:30},
      xAxis:{type:"value"}, yAxis:{type:"category", data:top.map(x=>x[0]).reverse()},
      series:[{type:"bar", data:top.map(x=>x[1].n).reverse(), itemStyle:{color:"#d9534f"}}]
    });
  }, 100);
}

/* 导出建设说明书摘要 */
function downloadSummary(){
  const md = `# 人体解剖学智评学径智能体 · 建设说明书摘要

## 一、智能体概述
- **名称**：人体解剖学智评学径智能体（v2 · AI 增强版）
- **目标用户**：健康服务与管理专业大一学生
- **核心场景**：人体解剖学形成性测评 + 个性化学习路径 + AI 智能伴学
- **所属课程**：人体解剖学（含运动、消化、呼吸、泌尿、生殖、内分泌、循环、感觉器、神经、绪论 10 大系统）

## 二、拟解决的问题
1. 传统终结性测评滞后反馈，学生无法精准定位薄弱知识点；
2. 学习路径千篇一律，无法实现"以学生为中心"的个性化；
3. 教师难以从班级数据中快速识别高频错误与教学切入点；
4. 学生提问 / 错题解答缺乏 24h 可用的 AI 伴学。

## 三、核心功能
1. **形成性测评**：10 大系统题库，单选/多选/填空/识图四类题型，按教师配置自动出题。
2. **智能诊断**：错误类型 A/B/C/D 自动分类（概念/毗邻/识图/功能），精准定位薄弱。
3. **个性化学习路径**：基于内置 50+ 节点知识图谱（KG），按前置依赖推荐补学顺序。
4. **阶段 3 复盘自测**：薄弱知识点再测，达到 80% 通过方可进入下一轮。
5. **个人数据看板**：能力雷达图、模块对比柱状图、错误类型饼图、本地历史 10 条。
6. **知识图谱可视化**：ECharts 强制布局图谱，按掌握度着色，可拖拽。
7. **AI 智能伴学**：基于大模型的自由问答 + 错题解析 + 路径推荐，支持本地模式 / 真实 API 接入。
8. **浮窗 AI**：随时可呼出的伴学对话。
9. **教师端**：口令登录、题库编辑、班级汇总报告（含 3 张可视化图表）、大模型与多模态配置、试点成效展示。

## 四、技术路线
- 前端：原生 ES6 + HTML5 + CSS3（无构建依赖，可直接静态部署）
- 可视化：ECharts 5.4（CDN 加载）
- 大模型：兼容 OpenAI 接口规范（支持智谱 GLM-4-Flash、Qwen、Kimi、自定义）
- 数据持久化：localStorage（脱敏、本机优先）
- 部署：Netlify / 任何静态托管

## 五、应用成效（示例）
${PILOT_DATA.map(p=>`- ${p.cohort}：前测 ${p.pre} → 后测 ${p.post}（提升 ${p.gain} 分，n=${p.n}）`).join("\n")}

> *实际参赛时，请用真实试点数据替换上述示例。*

## 六、推广价值
- 题库结构松耦合，可扩展到任何系统解剖学/局部解剖学课程；
- 错误类型分类与知识图谱可复用到其他医学基础课（组胚、生理、生化）；
- 教师端可单独抽离为通用班级学情分析工具；
- 大模型接入层支持任意 OpenAI 兼容服务，便于学校私有化部署。
`;
  const blob = new Blob([md], {type:"text/markdown;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "建设说明书摘要.md";
  a.click();
}

/* ==========================================================
   8. 路由 / Tab 切换 / 角色模式
   ========================================================== */

function setupTabs(){
  document.querySelectorAll(".tab").forEach(t=>{
    t.onclick = ()=>{
      document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
      t.classList.add("active");
      const v = t.dataset.v;
      const target = (v === "extra") ? "student" : v;
      document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));
      const pane = document.querySelector('.view[data-view="'+target+'"]');
      if(pane) pane.classList.remove("hidden");
      if(v==="diagnosis") setTimeout(setupDiagnosis, 60);
      if(v==="student") setStudentScope("motor");
      if(v==="extra") setStudentScope("extra");
      if(v==="dashboard") setupDashboard();
      if(v==="graph") setTimeout(renderKG, 80);
    };
  });
}

/* 学生端两种范围：运动系统（主战场，四层深学）/ 全课程拓展学练 */
let currentScope = "motor";
const MOTOR_LAYERS = ["骨学", "关节学", "肌学", "体态生物力学"];

function setStudentScope(mode){
  currentScope = mode;
  var sel = document.getElementById("studentSystem");
  var layerField = document.getElementById("layerField");
  var title = document.getElementById("scopeTitle");
  var tip = document.getElementById("scopeTip");
  if(!sel) return;
  if(mode === "extra"){
    sel.innerHTML = Object.keys(SYSTEM_BANKS)
      .filter(function(k){ return k !== "运动系统"; })
      .map(function(x){ return "<option>"+x+"</option>"; }).join("");
    if(layerField) layerField.style.display = "none";
    if(title) title.textContent = "① 选择拓展单元";
    if(tip) tip.textContent = "拓展学练覆盖课程其余单元，用于知识完整性与期末复习。深度训练请回到「运动系统」主战场。";
  } else {
    sel.innerHTML = "<option>运动系统</option>";
    if(layerField) layerField.style.display = "";
    if(title) title.textContent = "① 运动系统深度学习";
    if(tip) tip.textContent = "主战场：按骨学 / 关节学 / 肌学 / 体态生物力学四层组织，全部绑定健康服务场景，与体态实训共用同一套能力坐标。";
  }
  updateCountHint();
}

function applyRoleMode(){
  const mode = new URLSearchParams(location.search).get("role");
  if(mode==="student"){
    const t = document.querySelector('.tab[data-v="teacher"]'); if(t) t.style.display="none";
    const t2 = document.querySelector('.tab[data-v="assistant"]'); if(t2) t2.click();
  }
  if(mode==="teacher"){
    document.querySelector('.tab[data-v="teacher"]')?.click();
  }
}

/* ==========================================================
   9. 启动
   ========================================================== */

window.addEventListener("DOMContentLoaded", ()=>{
  setupTabs();
  setupDiagnosis();
  setupPosture();
  setupStudent();
  setupAssistant();
  renderChatLocal();
  applyRoleMode();

  // resize 图表
  window.addEventListener("resize", ()=>{
    radarChart?.resize(); barChart?.resize(); errorPie?.resize();
    kgChart?.resize();
    window.tBar?.resize(); window.tPie?.resize(); window.tTopBar?.resize();
  });

  // 状态显示
  const s = loadState();
  if(s.llm && s.llm.provider && s.llm.provider!=="mock" && s.llm.apiKey){
    document.getElementById("aiStatusText").textContent = `AI 大脑 · ${s.llm.provider}`;
    document.getElementById("aiStatus").classList.add("ok");
    document.getElementById("aiStatus").querySelector(".dot").classList.remove("off");
  }
});
/* ==========================================================
   10. 体态解码工作台（融合自「体态解码师」）
   真实体态案例 → 五维解码报告 → 针对性解剖测评引流
   教学法：脚手架递减 · 学习证据自评 · 红旗转介识别
   ========================================================== */

const POSTURE_MODULES = {
  "spine": {
    title: "脊柱区",
    structures: "颈椎、胸椎、腰椎、椎间关节、竖脊肌、多裂肌、腹横肌",
    postures: "圆肩含胸、头前伸、脊柱侧弯外观、久坐后腰部不适",
    tags: ["圆肩含胸", "头前伸", "脊柱侧弯外观", "久坐后腰部不适"],
    image: "assets/atlas/spine.png",
    caption: "课程图谱：脊柱",
    systems: ["运动系统"]
  },
  "shoulder": {
    title: "肩带区",
    structures: "锁骨、肩胛骨、肩锁关节、盂肱关节、胸大肌、前锯肌、斜方肌",
    postures: "肩胛内侧缘突出、举臂时肩部不适、肩关节活动范围减少",
    tags: ["肩胛内侧缘突出", "举臂时肩部不适", "肩关节活动范围减少"],
    image: "assets/atlas/shoulder.png",
    caption: "课程图谱：肩关节",
    systems: ["运动系统"]
  },
  "pelvis": {
    title: "骨盆区",
    structures: "髋骨、骶骨、骶髂关节、髋关节、髂腰肌、臀大肌、腹壁肌",
    postures: "骨盆前倾、骨盆后倾、骨盆区不适或左右不对称",
    tags: ["骨盆前倾", "骨盆后倾", "骨盆区不适或左右不对称"],
    image: "assets/atlas/pelvis.png",
    caption: "课程图谱：髋骨",
    systems: ["运动系统", "泌尿系统", "生殖系统"]
  },
  "lower-limb": {
    title: "下肢区",
    structures: "股骨、膝关节、胫腓骨、踝关节、足弓、臀中肌、股四头肌",
    postures: "膝超伸、膝关节内翻/外翻外观、足弓降低",
    tags: ["膝超伸", "膝关节内翻/外翻外观", "足弓降低"],
    image: "assets/atlas/lower-limb.png",
    caption: "课程图谱：膝关节",
    systems: ["运动系统", "循环系统"]
  },
  "upper-limb": {
    title: "上肢区",
    structures: "肱骨、尺桡骨、腕骨、上肢肌群、臂丛及主要周围神经",
    postures: "长时间用鼠标后前臂不适、腕部或手指麻木、上肢重复操作不适",
    tags: ["长时间用鼠标后前臂不适", "腕部或手指麻木", "上肢重复操作不适"],
    image: "assets/atlas/upper-limb.png",
    caption: "课程图谱：上肢肌浅层",
    systems: ["运动系统", "神经系统"]
  }
};

const POSTURE_KEY = "posture-decoder-training-v1";
const POSTURE_SKILLS = [
  ["structure", "结构定位"], ["mechanism", "机制推演"], ["risk", "风险沟通"],
  ["intervention", "管理干预"], ["ethics", "职业边界"]
];
let postureActiveModule = "spine";

function pmReadStore(){
  try{
    const saved = JSON.parse(localStorage.getItem(POSTURE_KEY) || "{}");
    return {
      records: Array.isArray(saved.records) ? saved.records.slice(0, 8) : [],
      skills: saved.skills && typeof saved.skills === "object" ? saved.skills : {},
      completed: Number(saved.completed) || 0
    };
  }catch(e){ return { records: [], skills: {}, completed: 0 }; }
}
function pmWriteStore(store){
  try{ localStorage.setItem(POSTURE_KEY, JSON.stringify(store)); }catch(e){}
}

function pmEscapeLine(text){
  return String(text || "").replace(/^#{1,6}\s*/, "").trim();
}
function pmRenderText(container, text){
  if(!container) return;
  container.innerHTML = "";
  const lines = String(text || "未生成该板块。").split("\n").map(pmEscapeLine).filter(Boolean);
  for(const line of lines){
    const item = document.createElement("p");
    item.textContent = line;
    if(/^[-•]/.test(line)) item.className = "bullet";
    container.appendChild(item);
  }
}
function pmExtractSection(text, startEmoji, endEmoji){
  const start = text.indexOf(startEmoji);
  if(start === -1) return "未生成该板块。";
  const end = endEmoji ? text.indexOf(endEmoji, start + 1) : text.length;
  const section = text.slice(start, end === -1 ? text.length : end).trim();
  return section.split("\n").slice(1).join("\n").trim() || "未生成该板块。";
}

function pmFallbackReport(query){
  const input = query || "当前案例";
  const isRed = /进行性麻木|进行性无力|大小便|步态明显改变|近期外伤|剧烈疼痛|夜间痛|发热|晕厥|胸痛|明显畸形/.test(input);
  const risk = isRed ? "三级" : /疼|酸|麻|疲劳|受限|不稳|无力/.test(input) ? "二级" : "一级";
  const module = POSTURE_MODULES[postureActiveModule];
  const transfer = risk === "三级" ? "\n🚨 建议转介：该表现可能涉及结构性病变，请建议客户至骨科/康复科就诊，健康管理师可协助记录症状变化。" : "";
  return "📍 结构定位\n【骨骼/关节】：" + module.structures +
    "\n【肌肉】：结合观察紧张肌群与控制能力不足肌群；不依据单一体态作确定性判断。" +
    "\n【神经】：如有麻木、无力或放射性不适，记录其分布并优先排查红旗。" +
    "\n【体表标志】：选择耳屏、肩峰、髂前上棘、髌骨或第二脚趾等与当前区域相关的体表点。\n\n" +
    "🔍 机制推演\n【类比教学】：身体的节段像一组相连的铰链，一个区域长期偏离中立位，邻近区域常会用代偿维持任务。" +
    "\n【因果链】：姿势排列或肌肉控制改变 → 关节受力与运动轨迹改变 → 活动耐受下降或代偿表现。\n\n" +
    "⚠️ 健康风险\n风险等级：" + risk +
    "\n风险描述：用于健康教育与活动风险观察，不构成疾病判断。" +
    "\n职业场景：办公室健康促进、体检后生活方式教育、康养机构活动筛查。" + transfer + "\n\n" +
    "💡 管理干预\n【运动处方】\n• 松解动作：在无疼痛加重前提下进行相关区域温和活动与拉伸，每次 20-30 秒，2-3 组。" +
    "\n• 强化动作：从低负荷的姿势控制和稳定训练开始，每周 2-3 次，以动作质量为先。" +
    "\n• 禁忌：出现剧烈疼痛、进行性麻木、无力、头晕或外伤后不适时停止并转介。" +
    "\n【行为管理】：每 30-50 分钟中断久坐；让工作台面、屏幕和座椅高度与任务相适应。" +
    "\n【随访指标】：记录连续久坐时间、动作舒适度 0-10 分、体表标志变化和红旗是否出现。\n\n" +
    "🎓 延伸思考\n如果只关注不适部位，而不观察相邻关节和整体力线，可能遗漏哪一段结构-功能联系？";
}

function pmPracticeCount(){
  return pmReadStore().records.filter(function(item){ return item.module === postureActiveModule; }).length;
}
function pmUpdateScaffold(){
  const count = pmPracticeCount();
  const note = document.getElementById("scaffold-note");
  if(!note) return;
  if(count === 0) note.textContent = "首次案例：完整示范模式";
  else if(count === 1) note.textContent = "第 2 次：先尝试补全肌肉与风险";
  else note.textContent = "第 3 次起：先独立定位，再核对报告";
}

function pmRenderQuickTags(){
  const module = POSTURE_MODULES[postureActiveModule];
  const container = document.getElementById("quick-tags");
  if(!container) return;
  container.innerHTML = "";
  module.tags.forEach(function(tag){
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-tag";
    button.textContent = tag;
    button.onclick = function(){
      const input = document.getElementById("posture-input");
      input.value = tag;
      input.focus();
    };
    container.appendChild(button);
  });
  const ctx = document.getElementById("quick-tag-context");
  if(ctx) ctx.textContent = module.title + "快捷标签";
}

function pmSelectModule(id){
  postureActiveModule = id;
  const module = POSTURE_MODULES[id];
  document.querySelectorAll("#pmTabs .pm-tab").forEach(function(tab){
    const isSelected = tab.dataset.module === id;
    tab.classList.toggle("active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
  });
  const s = document.getElementById("pmStructures");
  const p = document.getElementById("pmPostures");
  if(s) s.textContent = "当前模块：" + module.title + " · 包含：" + module.structures;
  if(p) p.textContent = "关联体态：" + module.postures;
  const img = document.getElementById("pmAtlasImg");
  if(img){ img.src = module.image; img.alt = module.title + "解剖图谱"; }
  const cap = document.getElementById("pmAtlasCap");
  if(cap) cap.textContent = module.caption;
  pmRenderQuickTags();
  pmUpdateScaffold();
}

function pmRenderDimensions(reply, query){
  const sections = {
    structure: pmExtractSection(reply, "📍", "🔍"),
    mechanism: pmExtractSection(reply, "🔍", "⚠️"),
    risk: pmExtractSection(reply, "⚠️", "💡"),
    intervention: pmExtractSection(reply, "💡", "🎓"),
    thinking: pmExtractSection(reply, "🎓", null)
  };
  const targets = {
    structure: "dim-structure", mechanism: "dim-mechanism", risk: "dim-risk",
    intervention: "dim-intervention", thinking: "dim-thinking"
  };
  Object.keys(targets).forEach(function(key){
    const host = document.querySelector("#" + targets[key] + " .content");
    pmRenderText(host, sections[key]);
  });
  const title = document.getElementById("analysis-title");
  if(title) title.textContent = "五维体态解码报告：" + (query.length > 24 ? query.slice(0, 24) + "…" : query);
  const level = /风险等级：三级/.test(sections.risk) ? 3 : /风险等级：二级/.test(sections.risk) ? 2 : 1;
  const chip = document.getElementById("risk-chip");
  if(chip){
    chip.className = "risk-chip level-" + level;
    chip.textContent = "风险等级：" + ["", "一级", "二级", "三级"][level];
  }
  const out = document.getElementById("analysis-output");
  if(out){
    out.classList.remove("hidden");
  }
  return level;
}

function pmLoadingDimensions(){
  ["dim-structure", "dim-mechanism", "dim-risk", "dim-intervention", "dim-thinking"].forEach(function(id){
    const host = document.querySelector("#" + id + " .content");
    pmRenderText(host, "正在依据结构-功能-风险-管理链进行教学分析…");
  });
  const chip = document.getElementById("risk-chip");
  if(chip){ chip.className = "risk-chip"; chip.textContent = "正在解码"; }
  const title = document.getElementById("analysis-title");
  if(title) title.textContent = "正在生成五维体态解码报告";
  const out = document.getElementById("analysis-output");
  if(out) out.classList.remove("hidden");
}

function pmRecordAnalysis(query, level){
  const store = pmReadStore();
  const record = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    module: postureActiveModule,
    query: query.replace(/\s+/g, " ").slice(0, 50),
    level: level,
    time: new Date().toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
  };
  store.records.unshift(record);
  store.records = store.records.slice(0, 8);
  store.completed += 1;
  pmWriteStore(store);
  // 同步写入统一六维能力档案（实训 → 主要产出 L4/L5/L6）
  var uu = loadUnified();
  uu.posture.cases = (uu.posture.cases||0) + 1;
  uu.posture.byModule[postureActiveModule] = (uu.posture.byModule[postureActiveModule]||0) + 1;
  if(level >= 2) uu.posture.riskFlags = (uu.posture.riskFlags||0) + 1;
  if(level === 3) uu.posture.redFlags = (uu.posture.redFlags||0) + 1;
  var riskObs = level >= 2 ? 1 : (level === 1 ? 0.65 : 0.4);
  uu = compCredit(uu, "L4", riskObs, "posture", record.query);
  uu = compCredit(uu, "L5", level >= 2 ? 0.9 : 0.6, "posture", record.query);
  uu = compCredit(uu, "L6", 0.8, "posture", record.query);
  saveUnified(uu);
  pmRenderArchive();
  pmUpdateScaffold();
  // 同步刷新数据看板（若已渲染）
  renderDashMetrics();
  renderDiagnosis();
}

function pmRenderArchive(){
  const store = pmReadStore();
  const total = document.getElementById("analysis-total");
  const risk = document.getElementById("risk-total");
  if(total) total.textContent = String(store.completed);
  if(risk) risk.textContent = String(store.records.filter(function(item){ return item.level === 3; }).length);
  const history = document.getElementById("session-history");
  if(history){
    history.innerHTML = "";
    if(!store.records.length){
      const empty = document.createElement("p");
      empty.className = "muted small";
      empty.textContent = "尚无记录。完成一次解码后会显示在这里。";
      history.appendChild(empty);
    } else {
      store.records.forEach(function(record){
        const item = document.createElement("div");
        item.className = "history-item level-" + record.level;
        const t = document.createElement("strong");
        const m = document.createElement("span");
        t.textContent = record.query;
        const mod = POSTURE_MODULES[record.module];
        m.textContent = (mod ? mod.title : "运动系统") + " · " + record.time + " · " + ["", "一级", "二级", "三级"][record.level] + "风险";
        item.appendChild(t);
        item.appendChild(m);
        history.appendChild(item);
      });
    }
  }
  pmDrawRadar(store);
}

function pmDrawRadar(store){
  const canvas = document.getElementById("radar-chart");
  if(!canvas || !canvas.getContext) return;
  const context = canvas.getContext("2d");
  const width = canvas.width, height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2 - 3;
  const radius = 75;
  const values = POSTURE_SKILLS.map(function(pair){
    return Math.min(5, 1 + Number(store.skills[pair[0]] || 0) * 0.5 + store.completed * 0.08);
  });
  context.clearRect(0, 0, width, height);
  context.font = '11px "Microsoft YaHei", sans-serif';
  context.textAlign = "center";
  for(let level = 1; level <= 5; level += 1){
    context.beginPath();
    POSTURE_SKILLS.forEach(function(_, index){
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / POSTURE_SKILLS.length;
      const x = centerX + Math.cos(angle) * radius * level / 5;
      const y = centerY + Math.sin(angle) * radius * level / 5;
      if(index) context.lineTo(x, y); else context.moveTo(x, y);
    });
    context.closePath();
    context.strokeStyle = "#d5dce8";
    context.lineWidth = 1;
    context.stroke();
  }
  POSTURE_SKILLS.forEach(function(pair, index){
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / POSTURE_SKILLS.length;
    const x = centerX + Math.cos(angle) * (radius + 25);
    const y = centerY + Math.sin(angle) * (radius + 25) + 4;
    context.fillStyle = "#5a6b84";
    context.fillText(pair[1], x, y);
  });
  context.beginPath();
  values.forEach(function(value, index){
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
    const x = centerX + Math.cos(angle) * radius * value / 5;
    const y = centerY + Math.sin(angle) * radius * value / 5;
    if(index) context.lineTo(x, y); else context.moveTo(x, y);
  });
  context.closePath();
  context.fillStyle = "rgba(23,105,209,.18)";
  context.fill();
  context.strokeStyle = "#1769d1";
  context.lineWidth = 2;
  context.stroke();
}

async function analyzePosture(){
  const inputEl = document.getElementById("posture-input");
  const input = (inputEl && inputEl.value || "").trim();
  if(!input){
    alert("请输入体态描述，或点击上方快捷标签");
    if(inputEl) inputEl.focus();
    return;
  }
  pmLoadingDimensions();
  const module = POSTURE_MODULES[postureActiveModule];
  const stage = pmPracticeCount() + 1;
  const prompt =
    "【体态案例解码任务】\n" +
    "分析区域：" + module.title + "\n" +
    "涉及结构：" + module.structures + "\n" +
    "学习阶段：第 " + stage + " 次案例练习\n" +
    "学生描述的案例：" + input + "\n\n" +
    "请严格按以下五维格式输出（保留每个 emoji 标题行）：\n" +
    "📍 结构定位（骨骼/关节、肌肉、神经、体表标志）\n" +
    "🔍 机制推演（类比教学 + 因果链）\n" +
    "⚠️ 健康风险（给出风险等级：一级/二级/三级 + 职业场景；如有红旗表现须给出转介建议）\n" +
    "💡 管理干预（运动处方：松解/强化/禁忌 + 行为管理 + 随访指标）\n" +
    "🎓 延伸思考（一个引导性问题）\n" +
    "要求：面向健康服务与管理专业大一学生的非医疗性教学分析，保留职业边界，不构成医疗诊断。";
  let reply;
  try{
    reply = await callLLM(prompt, []);
    if(!reply || reply.indexOf("📍") === -1){
      reply = pmFallbackReport(input);
    }
  }catch(e){
    reply = pmFallbackReport(input);
  }
  // 更新测评引流按钮（数据驱动：按统一能力档案中的薄弱维度推荐系统）
  var uNow = loadUnified();
  var rqNow = recommendQuizFromPosture(uNow);
  var targetSys = (rqNow.systems[0] && rqNow.systems[0].system) || module.systems[0] || "运动系统";
  const refBtn = document.getElementById("referralQuizBtn");
  if(refBtn){
    refBtn.textContent = "去完成「" + targetSys + "」测评 →";
    refBtn.dataset.system = targetSys;
  }
  const refBox = document.getElementById("quizReferral");
  if(refBox){
    const hint = refBox.querySelector(".muted.small");
    if(hint) hint.textContent = rqNow.low.length
      ? "依据你的能力档案，" + rqNow.low.map(function(l){ return l.key + " " + l.name; }).join("、") + " 低于 60 分达标线，建议先补「" + targetSys + "」。"
      : "学科基础三维已达标，可继续挑战更高阶的实训案例，重点打磨 L4—L6 专业能力。";
  }
  const level = pmRenderDimensions(reply, input);
  pmRecordAnalysis(input, level);
  const out = document.getElementById("analysis-output");
  if(out && out.scrollIntoView) out.scrollIntoView({ behavior: "smooth", block: "start" });
}
window.analyzePosture = analyzePosture;

function pmRegisterEvidence(skill){
  const store = pmReadStore();
  store.skills[skill] = Number(store.skills[skill] || 0) + 1;
  pmWriteStore(store);
  // 同步写入统一六维能力档案
  var ue = loadUnified();
  ue.posture.skills[skill] = Number(ue.posture.skills[skill] || 0) + 1;
  var ks = POSTURE_TO_COMP[skill] || [];
  ks.forEach(function(k){ ue = compCredit(ue, k, 0.9, "posture", skill); });
  saveUnified(ue);
  const btn = document.querySelector('[data-skill="' + skill + '"]');
  if(btn) btn.classList.add("recorded");
  pmRenderArchive();
  renderDiagnosis();
}


function setupPosture(){
  // 渲染区域 Tab
  const tabsHost = document.getElementById("pmTabs");
  if(tabsHost){
    tabsHost.innerHTML = "";
    Object.keys(POSTURE_MODULES).forEach(function(id){
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pm-tab";
      b.dataset.module = id;
      b.textContent = POSTURE_MODULES[id].title;
      b.onclick = function(){ pmSelectModule(id); };
      tabsHost.appendChild(b);
    });
  }
  // 事件绑定
  const analyzeBtn = document.getElementById("postureAnalyze");
  if(analyzeBtn) analyzeBtn.onclick = analyzePosture;
  const clearBtn = document.getElementById("postureClear");
  if(clearBtn) clearBtn.onclick = function(){
    const input = document.getElementById("posture-input");
    input.value = "";
    input.focus();
  };
  const checks = document.getElementById("competency-checks");
  if(checks){
    checks.addEventListener("click", function(event){
      const button = event.target.closest ? event.target.closest("button[data-skill]") : null;
      if(button) pmRegisterEvidence(button.dataset.skill);
    });
  }
  const resetBtn = document.getElementById("reset-records");
  if(resetBtn){
    resetBtn.onclick = function(){
      if(!confirm("将清除这台设备上的体态训练记录和自评数据，是否继续？")) return;
      try{ localStorage.removeItem(POSTURE_KEY); }catch(e){}
      document.querySelectorAll(".competency-checks button").forEach(function(button){
        button.classList.remove("recorded");
      });
      pmRenderArchive();
      pmUpdateScaffold();
      renderDashMetrics();
    };
  }
  const refBtn = document.getElementById("referralQuizBtn");
  if(refBtn){
    refBtn.onclick = function(){
      var uq = loadUnified();
      var rq = recommendQuizFromPosture(uq);
      var target = (rq.systems[0] && rq.systems[0].system)
        || (systemsForPostureModule(postureActiveModule)[0])
        || "运动系统";
      gotoQuizSystem(target);
    };
  }
  // 默认选中脊柱区
  pmSelectModule("spine");
  pmRenderArchive();
}

/* ==========================================================
   10. 学情诊断 · 双向数据驱动推荐（融合闭环）
   测评引擎与体态实训引擎共用统一六维能力档案，
   推荐由数据实时计算，不再硬编码跳转。
   ========================================================== */

/* 系统 → 关联的体态实训区域（数据源：POSTURE_MODULES.systems） */
function postureModulesForSystem(system){
  var out = [];
  Object.keys(POSTURE_MODULES).forEach(function(id){
    if((POSTURE_MODULES[id].systems || []).indexOf(system) !== -1) out.push(id);
  });
  return out;
}
function systemsForPostureModule(id){
  return (POSTURE_MODULES[id] && POSTURE_MODULES[id].systems) || ["运动系统"];
}
/* 系统 → 主导培养的能力维度 */
const SYSTEM_PRIMARY_COMP = {
  "运动系统":["L1","L2","L3"], "神经系统":["L3","L4"], "循环系统":["L3","L4"],
  "呼吸系统":["L3","L4"], "消化系统":["L2","L1"], "泌尿系统":["L2","L1"],
  "生殖系统":["L2","L1"], "内分泌系统":["L3","L1"], "感觉器":["L1","L4"], "绪论":["L1","L2"]
};

/* 方向一：测评结果 → 推荐体态实训区域 */
function recommendPostureFromQuiz(u){
  var mods = (u.quiz && u.quiz.modules) || {};
  var weak = [];
  Object.keys(mods).forEach(function(m){
    var o = mods[m];
    if(o && o.total >= 2){
      var rate = o.correct / o.total;
      if(rate < 0.7) weak.push({name:m, rate:rate});
    }
  });
  weak.sort(function(a,b){ return a.rate - b.rate; });
  var picks = [];
  weak.forEach(function(w){
    postureModulesForSystem(w.name).forEach(function(id){
      if(!POSTURE_MODULES[id]) return;
      picks.push({
        module: id,
        title: POSTURE_MODULES[id].title,
        reason: "「" + w.name + "」正确率 " + Math.round(w.rate * 100) + "%，建议在此区域把结构知识用起来"
      });
    });
  });
  return {weak: weak, picks: picks.slice(0,3)};
}

/* 方向二：能力档案 → 推荐系统测评 */
function recommendQuizFromPosture(u){
  var low = [];
  COMPETENCY.forEach(function(c){
    if(c.tier !== "base") return;
    var pct = compPct(u, c.key);
    if(pct < 60) low.push({key:c.key, name:c.name, pct:pct});
  });
  low.sort(function(a,b){ return a.pct - b.pct; });
  var sys = [];
  Object.keys(SYSTEM_PRIMARY_COMP).forEach(function(s){
    if(!SYSTEM_BANKS[s]) return;
    var cover = [];
    SYSTEM_PRIMARY_COMP[s].forEach(function(k){
      low.forEach(function(l){ if(l.key === k) cover.push(l.name); });
    });
    if(cover.length) sys.push({system: s, cover: cover, weight: cover.length});
  });
  sys.sort(function(a,b){ return b.weight - a.weight; });
  return {low: low, systems: sys.slice(0,3)};
}

function gotoQuizSystem(system){
  // 先切到正确的范围（运动系统走主战场，其余走拓展学练）
  var isMotor = (system === "运动系统");
  var tab = document.querySelector('.tab[data-v="' + (isMotor ? "student" : "extra") + '"]');
  if(tab) tab.click();
  var select = document.getElementById("studentSystem");
  if(select){
    var opts = Array.from(select.options).map(function(o){ return o.value; });
    if(opts.indexOf(system) === -1) system = opts[0] || system;
    select.value = system;
    select.dispatchEvent(new Event("change"));
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function gotoPostureModule(id){
  var tab = document.querySelector('.tab[data-v="posture"]');
  if(tab) tab.click();
  if(id) pmSelectModule(id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

var diagRadar = null;
var diagTrend = null;

function renderDiagnosis(){
  var u = loadUnified();
  renderDiagRadar(u);
  renderCompBars(u);
  renderDiagRecommend(u);
  renderDiagProgress(u);
  renderDiagTrend(u);
}

function renderDiagRadar(u){
  var el = document.getElementById("diagRadar");
  if(!el || typeof echarts === "undefined") return;
  var vals = COMPETENCY.map(function(c){ return compPct(u, c.key); });
  if(!diagRadar) diagRadar = echarts.init(el);
  diagRadar.setOption({
    tooltip: {},
    radar: {
      indicator: COMPETENCY.map(function(c){ return {name: c.key + " " + c.name, max: 100}; }),
      radius: "65%",
      splitNumber: 4,
      axisName: { color: "#33465c", fontSize: 12 },
      splitLine: { lineStyle: { color: "#e3e9ef" } },
      splitArea: { areaStyle: { color: ["#fbfdff", "#f4f8fc"] } },
      axisLine: { lineStyle: { color: "#e3e9ef" } }
    },
    legend: { data: ["当前能力", "达标线"], bottom: 0, textStyle: { fontSize: 12 } },
    series: [{
      type: "radar",
      data: [
        {
          value: vals, name: "当前能力",
          areaStyle: { color: "rgba(23,105,209,.18)" },
          lineStyle: { color: "#1769d1", width: 2 },
          itemStyle: { color: "#1769d1" }
        },
        {
          value: COMPETENCY.map(function(){ return 60; }), name: "达标线",
          lineStyle: { color: "#e0a300", width: 1.5, type: "dashed" },
          itemStyle: { color: "#e0a300" }, symbol: "none"
        }
      ]
    }]
  }, true);
  if(diagRadar && diagRadar.resize) diagRadar.resize();
}

function renderCompBars(u){
  var host = document.getElementById("compBars");
  if(!host) return;
  var html = "";
  COMPETENCY.forEach(function(c){
    var pct = compPct(u, c.key);
    var lv = compLevel(pct);
    var cls = pct >= 80 ? "good" : pct >= 60 ? "ok" : pct >= 35 ? "warn" : "bad";
    html += '<div class="comp-row ' + cls + '">' +
      '<div class="comp-row-head"><b>' + c.key + ' ' + c.name + '</b><span>' + lv + ' · ' + pct + ' 分</span></div>' +
      '<div class="comp-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="comp-desc">' + esc(c.desc) + (c.tier === "pro" ? '　<span class="comp-flag">专业特色</span>' : '') + '</div>' +
      '</div>';
  });
  host.innerHTML = html;
}

function renderDiagRecommend(u){
  var host = document.getElementById("diagRecommend");
  if(!host) return;
  var hasAny = (u.quiz.sessions || 0) > 0 || (u.posture.cases || 0) > 0;
  var q2p = recommendPostureFromQuiz(u);
  var p2q = recommendQuizFromPosture(u);
  var html = "";
  if(!hasAny){
    html += '<div class="callout info"><b>还没有学习记录</b><br>先做一次单元测评，系统会依据你的作答数据，自动推荐该练哪个体态区域。</div>';
    html += '<div class="actions"><button class="primary" id="diagStartQuiz">开始首次测评 →</button></div>';
  } else {
    if(p2q.low.length){
      html += '<div class="rec-block"><h4>① 补齐学科基础（L1—L3）</h4>';
      p2q.low.forEach(function(l){
        html += '<p class="muted small">' + l.key + ' ' + l.name + ' 当前 ' + l.pct + ' 分，低于 60 分达标线。</p>';
      });
      p2q.systems.forEach(function(s){
        html += '<div class="rec-item"><div><b>' + esc(s.system) + '</b>' +
          '<span class="muted small"> 覆盖 ' + s.cover.join("、") + ' </span></div>' +
          '<button class="primary small" data-goto-quiz="' + escAttr(s.system) + '">去练习 →</button></div>';
      });
      html += '</div>';
    } else {
      html += '<div class="callout ok"><b>学科基础三维已达标</b><br>L1 结构定位、L2 毗邻关系、L3 功能机制均达到 60 分以上。</div>';
    }
    html += '<div class="rec-block"><h4>② 把知识用起来（L4—L6 专业能力）</h4>';
    if(q2p.picks.length){
      q2p.picks.forEach(function(p){
        html += '<div class="rec-item"><div><b>' + esc(p.title) + '</b>' +
          '<span class="muted small"> ' + esc(p.reason) + ' </span></div>' +
          '<button class="primary small" data-goto-posture="' + escAttr(p.module) + '">去实训 →</button></div>';
      });
    } else {
      html += '<div class="rec-item"><div><b>脊柱区</b>' +
        '<span class="muted small"> 从最典型的圆肩含胸、头前伸开始，产出异常识别与风险沟通能力 </span></div>' +
        '<button class="primary small" data-goto-posture="spine">去实训 →</button></div>';
    }
    html += '</div>';
  }
  host.innerHTML = html;
  host.querySelectorAll("[data-goto-quiz]").forEach(function(b){
    b.onclick = function(){ gotoQuizSystem(b.getAttribute("data-goto-quiz")); };
  });
  host.querySelectorAll("[data-goto-posture]").forEach(function(b){
    b.onclick = function(){ gotoPostureModule(b.getAttribute("data-goto-posture")); };
  });
  var sq = document.getElementById("diagStartQuiz");
  if(sq) sq.onclick = function(){ gotoQuizSystem("运动系统"); };
}

function renderDiagProgress(u){
  var host = document.getElementById("diagProgressBody");
  var tag = document.getElementById("diagProgress");
  if(!host) return;
  var mastered = 0, partial = 0, total = 0;
  try{
    var all = Mastery.all();
    var keys = Object.keys(all);
    total = keys.length;
    keys.forEach(function(k){
      var m = (all[k] && all[k].m) || 0;
      if(m >= 0.8) mastered++; else if(m >= 0.5) partial++;
    });
  }catch(e){}
  if(tag) tag.textContent = mastered + " 掌握 / " + total + " 已接触";
  host.innerHTML =
    '<div class="metric"><b>' + mastered + '</b><span>掌握良好</span></div>' +
    '<div class="metric"><b>' + partial + '</b><span>部分掌握</span></div>' +
    '<div class="metric"><b>' + (u.quiz.sessions || 0) + '</b><span>测评次数</span></div>' +
    '<div class="metric"><b>' + (u.posture.cases || 0) + '</b><span>实训案例</span></div>';
}

function renderDiagTrend(u){
  var el = document.getElementById("diagTrend");
  if(!el) return;
  var tl = (u.timeline || []).slice().reverse();
  if(!tl.length || typeof echarts === "undefined"){
    el.innerHTML = '<div class="empty"><p>完成测评或实训后，这里会显示能力成长曲线。</p></div>';
    if(diagTrend){ diagTrend.dispose(); diagTrend = null; }
    return;
  }
  var baseKeys = COMPETENCY.filter(function(c){ return c.tier === "base"; }).map(function(c){ return c.key; });
  var proKeys = COMPETENCY.filter(function(c){ return c.tier === "pro"; }).map(function(c){ return c.key; });
  var state = {};
  COMPETENCY.forEach(function(c){ state[c.key] = 0; });
  var xs = [], ys = [], bs = [], ps = [];
  tl.forEach(function(t, i){
    state[t.k] = t.v;
    var avg = function(keys){
      var s = 0;
      keys.forEach(function(k){ s += state[k]; });
      return Math.round(s / keys.length);
    };
    xs.push(String(i + 1));
    ys.push(avg(COMPETENCY.map(function(c){ return c.key; })));
    bs.push(avg(baseKeys));
    ps.push(avg(proKeys));
  });
  if(!diagTrend) diagTrend = echarts.init(el);
  diagTrend.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["综合指数", "学科基础 L1—L3", "专业能力 L4—L6"], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 40, right: 18, top: 18, bottom: 54 },
    xAxis: { type: "category", data: xs, name: "观测次数", nameTextStyle: { fontSize: 11 }, axisLabel: { fontSize: 11 } },
    yAxis: { type: "value", min: 0, max: 100, axisLabel: { fontSize: 11 } },
    series: [
      { name: "综合指数", type: "line", smooth: true, symbol: "none", data: ys, lineStyle: { width: 2.5, color: "#1769d1" }, itemStyle: { color: "#1769d1" } },
      { name: "学科基础 L1—L3", type: "line", smooth: true, symbol: "none", data: bs, lineStyle: { width: 2, color: "#00b3a4" }, itemStyle: { color: "#00b3a4" } },
      { name: "专业能力 L4—L6", type: "line", smooth: true, symbol: "none", data: ps, lineStyle: { width: 2, color: "#7f77dd" }, itemStyle: { color: "#7f77dd" } }
    ]
  }, true);
  if(diagTrend && diagTrend.resize) diagTrend.resize();
}

function setupDiagnosis(){ renderDiagnosis(); }
