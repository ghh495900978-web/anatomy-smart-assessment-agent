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
const SYSTEM_BANKS = {
  "运动系统": {title:"运动系统·单元测评", questions:[
    {id:1,type:"single",module:"运动系统",knowledgePoint:"肱肌",prompt:"肱肌的主要作用是？",options:["屈肘关节","伸肘关节","外展肩关节","旋前前臂"],correct:"A",score:10,errorType:"D",brief:"肱肌的起止与作用"},
    {id:2,type:"single",module:"运动系统",knowledgePoint:"肱骨骨性结构",prompt:"肱骨近端的骨性标志是？",options:["大结节","冠突","尺骨鹰嘴","桡骨头"],correct:"A",score:10,errorType:"C",brief:"肱骨标志辨认"},
    {id:3,type:"multiple",module:"运动系统",knowledgePoint:"肩关节",prompt:"肩关节的组成结构包括？",options:["肱骨头","肩胛骨关节盂","尺骨滑车","关节囊"],correct:["A","B","D"],score:10,errorType:"B",brief:"肩关节组成"},
    {id:4,type:"fill",module:"运动系统",knowledgePoint:"骨连接",prompt:"骨与骨之间借纤维结缔组织、软骨或骨相连，统称为___。",options:[],correct:["骨连接"],score:10,errorType:"A",brief:"骨连接的定义"},
    {id:5,type:"single",module:"运动系统",knowledgePoint:"肌的起止和作用",prompt:"肌肉中固定的一端通常称为？",options:["起点","止点","肌腹","腱膜"],correct:"A",score:10,errorType:"A",brief:"肌的起止概念"},
    {id:6,type:"image",module:"运动系统",knowledgePoint:"肩关节",prompt:"识图判断：肩关节属于哪种关节？",options:["球窝关节","平面关节","车轴关节","椭圆关节"],correct:"A",score:10,errorType:"C",brief:"关节类型"},
    {id:7,type:"multiple",module:"运动系统",knowledgePoint:"膝关节",prompt:"膝关节的主要韧带包括？",options:["前交叉韧带","后交叉韧带","髌韧带","桡骨环状韧带"],correct:["A","B","C"],score:10,errorType:"B",brief:"膝关节韧带"},
    {id:8,type:"single",module:"运动系统",knowledgePoint:"前臂骨",prompt:"前臂位于外侧的骨是？",options:["桡骨","尺骨","肱骨","肩胛骨"],correct:"A",score:10,errorType:"C",brief:"前臂骨位置"}
  ]},
  "消化系统": {title:"消化系统·单元测评", questions:[
    {id:1,type:"single",module:"消化系统",knowledgePoint:"胃的位置和形态",prompt:"胃大部分位于？",options:["左季肋区和腹上区","右季肋区","脐区","盆腔"],correct:"A",score:10,errorType:"B",brief:"胃的位置"},
    {id:2,type:"multiple",module:"消化系统",knowledgePoint:"肝的毗邻",prompt:"肝脏的主要毗邻结构包括？",options:["胃","右肾","胆囊","脾"],correct:["A","B","C"],score:10,errorType:"B",brief:"肝的毗邻关系"},
    {id:3,type:"fill",module:"消化系统",knowledgePoint:"肝的形态与分叶",prompt:"肝脏膈面以镰状韧带分为肝___和肝右叶。",options:[],correct:["左叶","肝左叶"],score:10,errorType:"A",brief:"肝的分叶术语"},
    {id:4,type:"single",module:"消化系统",knowledgePoint:"食管",prompt:"食管的第二个生理性狭窄位于？",options:["主动脉弓跨越处","咽与食管交界处","膈食管裂孔处","胃食管连接处"],correct:"A",score:10,errorType:"B",brief:"食管狭窄位置"},
    {id:5,type:"image",module:"消化系统",knowledgePoint:"胰的位置和形态",prompt:"识图判断：胰通常位于？",options:["腹膜后，胃后方","胸腔内","盆腔","腹腔右侧"],correct:"A",score:10,errorType:"C",brief:"胰的图谱辨认"},
    {id:6,type:"multiple",module:"消化系统",knowledgePoint:"胆囊",prompt:"胆囊可分为哪些部分？",options:["底","体","颈","峡"],correct:["A","B","C"],score:10,errorType:"A",brief:"胆囊分部"},
    {id:7,type:"single",module:"消化系统",knowledgePoint:"小肠",prompt:"小肠包括十二指肠、空肠和？",options:["回肠","盲肠","结肠","直肠"],correct:"A",score:10,errorType:"A",brief:"小肠分部"},
    {id:8,type:"fill",module:"消化系统",knowledgePoint:"大肠",prompt:"大肠的起始部是___。",options:[],correct:["盲肠"],score:10,errorType:"A",brief:"大肠起始部"}
  ]},
  "呼吸系统": {title:"呼吸系统·单元测评", questions:[
    {id:1,type:"single",module:"呼吸系统",knowledgePoint:"肺的位置和形态",prompt:"肺尖可高出锁骨内侧端上方约？",options:["1—2 cm","5 cm","10 cm","不超过锁骨"],correct:"A",score:10,errorType:"B",brief:"肺尖位置"},
    {id:2,type:"single",module:"呼吸系统",knowledgePoint:"气管",prompt:"气管在何处分为左、右主支气管？",options:["胸骨角平面","剑突平面","颈静脉切迹","膈肌平面"],correct:"A",score:10,errorType:"A",brief:"气管分叉平面"},
    {id:3,type:"multiple",module:"呼吸系统",knowledgePoint:"肺段",prompt:"右肺通常分为几个肺叶？",options:["上叶","中叶","下叶","前叶"],correct:["A","B","C"],score:10,errorType:"A",brief:"肺叶划分"},
    {id:4,type:"single",module:"呼吸系统",knowledgePoint:"鼻腔",prompt:"鼻腔向后经哪个结构通向咽？",options:["鼻后孔","喉口","咽鼓管","梨状孔"],correct:"A",score:10,errorType:"B",brief:"鼻腔后部通道"},
    {id:5,type:"image",module:"呼吸系统",knowledgePoint:"肺的形态",prompt:"识图判断：肺的下缘与哪一结构相邻？",options:["膈","肝","胃","心包"],correct:"A",score:10,errorType:"C",brief:"肺与膈的毗邻识图"},
    {id:6,type:"multiple",module:"呼吸系统",knowledgePoint:"胸膜",prompt:"胸膜包括哪些部分？",options:["脏胸膜","壁胸膜","胸膜腔","心包膜"],correct:["A","B","C"],score:10,errorType:"B",brief:"胸膜组成"},
    {id:7,type:"fill",module:"呼吸系统",knowledgePoint:"支气管树",prompt:"气管在胸骨角平面分为左、右___。",options:[],correct:["主支气管"],score:10,errorType:"A",brief:"支气管分支"},
    {id:8,type:"single",module:"呼吸系统",knowledgePoint:"呼吸肌",prompt:"平静吸气时最主要的呼吸肌是？",options:["膈","腹直肌","胸大肌","肋间内肌"],correct:"A",score:10,errorType:"D",brief:"呼吸肌功能"}
  ]},
  "绪论": {title:"绪论·单元测评", questions:[
    {id:1,type:"single",module:"绪论",knowledgePoint:"解剖学姿势",prompt:"标准解剖学姿势中，人体应？",options:["身体直立、两眼平视、上肢下垂、掌心向前","身体俯卧、掌心向后","身体坐位、掌心向内","身体屈曲、掌心向下"],correct:"A",score:10,errorType:"A",brief:"标准解剖学姿势"},
    {id:2,type:"multiple",module:"绪论",knowledgePoint:"解剖学方位术语",prompt:"描述人体结构相互位置关系的术语包括？",options:["上和下","前和后","内侧和外侧","快和慢"],correct:["A","B","C"],score:10,errorType:"A",brief:"方位术语"},
    {id:3,type:"fill",module:"绪论",knowledgePoint:"解剖学切面",prompt:"沿人体长轴与左右径所作的切面称为___面。",options:[],correct:["冠状面","额状面"],score:10,errorType:"A",brief:"人体切面"},
    {id:4,type:"single",module:"绪论",knowledgePoint:"人体器官系统",prompt:"人体结构和功能的基本单位是？",options:["细胞","组织","器官","系统"],correct:"A",score:10,errorType:"A",brief:"人体结构层次"},
    {id:5,type:"image",module:"绪论",knowledgePoint:"解剖学切面",prompt:"识图判断：将人体分为左右对称两部分的切面是？",options:["矢状面","冠状面","水平面","斜切面"],correct:"A",score:10,errorType:"C",brief:"切面识图"},
    {id:6,type:"single",module:"绪论",knowledgePoint:"结构与功能",prompt:"人体结构与功能之间的关系通常是？",options:["结构决定并适应功能","结构与功能无关","功能先于结构形成","二者完全相同"],correct:"A",score:10,errorType:"D",brief:"结构功能关系"}
  ]},
  "泌尿系统": {title:"泌尿系统·单元测评", questions:[
    {id:1,type:"single",module:"泌尿系统",knowledgePoint:"肾的位置和形态",prompt:"肾位于腹膜后，通常？",options:["左肾高于右肾","右肾高于左肾","两肾等高","位于盆腔"],correct:"A",score:10,errorType:"B",brief:"肾的位置"},
    {id:2,type:"multiple",module:"泌尿系统",knowledgePoint:"肾的结构",prompt:"肾的主要结构包括？",options:["肾皮质","肾髓质","肾窦","肾小球囊"],correct:["A","B","C"],score:10,errorType:"C",brief:"肾的结构"},
    {id:3,type:"fill",module:"泌尿系统",knowledgePoint:"泌尿小管",prompt:"肾单位的功能单位是___。",options:[],correct:["肾单位"],score:10,errorType:"A",brief:"肾单位"},
    {id:4,type:"single",module:"泌尿系统",knowledgePoint:"输尿管",prompt:"输尿管的第二处狭窄位于？",options:["跨越髂血管处","肾盂输尿管连接处","膀胱壁内段","尿道外口"],correct:"A",score:10,errorType:"B",brief:"输尿管狭窄"},
    {id:5,type:"image",module:"泌尿系统",knowledgePoint:"肾门",prompt:"识图判断：肾门通常位于肾的哪一侧？",options:["内侧缘","外侧缘","上极","下极"],correct:"A",score:10,errorType:"C",brief:"肾门识图"},
    {id:6,type:"single",module:"泌尿系统",knowledgePoint:"膀胱",prompt:"膀胱三角位于？",options:["膀胱底内面","膀胱尖外面","膀胱颈外面","膀胱顶部"],correct:"A",score:10,errorType:"B",brief:"膀胱三角"}
  ]},
  "生殖系统": {title:"生殖系统·单元测评", questions:[
    {id:1,type:"single",module:"生殖系统",knowledgePoint:"睾丸",prompt:"睾丸的主要功能是？",options:["产生精子和分泌雄激素","储存尿液","产生胆汁","分泌胰液"],correct:"A",score:10,errorType:"D",brief:"睾丸功能"},
    {id:2,type:"multiple",module:"生殖系统",knowledgePoint:"男性生殖管道",prompt:"男性生殖管道包括？",options:["附睾","输精管","射精管","输尿管"],correct:["A","B","C"],score:10,errorType:"A",brief:"男性生殖管道"},
    {id:3,type:"fill",module:"生殖系统",knowledgePoint:"子宫",prompt:"子宫位于骨盆腔中央，在膀胱与___之间。",options:[],correct:["直肠"],score:10,errorType:"B",brief:"子宫毗邻"},
    {id:4,type:"single",module:"生殖系统",knowledgePoint:"女性生殖器",prompt:"输卵管通常分为漏斗、壶腹、峡和？",options:["子宫部","阴道部","宫颈部","卵巢部"],correct:"A",score:10,errorType:"A",brief:"输卵管分部"},
    {id:5,type:"image",module:"生殖系统",knowledgePoint:"女性生殖器",prompt:"识图判断：呈梨形、位于膀胱与直肠之间的器官是？",options:["子宫","卵巢","阴道","输卵管"],correct:"A",score:10,errorType:"C",brief:"子宫识图"},
    {id:6,type:"single",module:"生殖系统",knowledgePoint:"会阴",prompt:"会阴通常指？",options:["盆膈以下封闭骨盆下口的软组织","腹腔顶部","胸腔底部","颅底软组织"],correct:"A",score:10,errorType:"B",brief:"会阴范围"}
  ]},
  "内分泌系统": {title:"内分泌系统·单元测评", questions:[
    {id:1,type:"single",module:"内分泌系统",knowledgePoint:"垂体",prompt:"垂体位于？",options:["蝶骨垂体窝内","颞骨乳突内","筛骨筛窦内","下颌窝内"],correct:"A",score:10,errorType:"B",brief:"垂体位置"},
    {id:2,type:"multiple",module:"内分泌系统",knowledgePoint:"甲状腺",prompt:"甲状腺通常包括？",options:["左叶","右叶","峡","锥状叶"],correct:["A","B","C"],score:10,errorType:"A",brief:"甲状腺形态"},
    {id:3,type:"fill",module:"内分泌系统",knowledgePoint:"肾上腺",prompt:"肾上腺位于肾的___方。",options:[],correct:["上"],score:10,errorType:"A",brief:"肾上腺位置"},
    {id:4,type:"single",module:"内分泌系统",knowledgePoint:"胰岛",prompt:"胰岛主要分泌调节血糖的？",options:["胰岛素和胰高血糖素","胆汁和胃液","甲状腺素和降钙素","肾上腺素和去甲肾上腺素"],correct:"A",score:10,errorType:"D",brief:"胰岛功能"},
    {id:5,type:"image",module:"内分泌系统",knowledgePoint:"甲状腺",prompt:"识图判断：位于喉和气管前外侧的内分泌腺是？",options:["甲状腺","垂体","胸腺","肾上腺"],correct:"A",score:10,errorType:"C",brief:"甲状腺识图"},
    {id:6,type:"single",module:"内分泌系统",knowledgePoint:"甲状旁腺",prompt:"甲状旁腺主要参与调节？",options:["血钙水平","血氧水平","胆汁分泌","尿液浓缩"],correct:"A",score:10,errorType:"D",brief:"甲状旁腺功能"}
  ]},
  "循环系统": {title:"循环系统·单元测评", questions:[
    {id:1,type:"single",module:"循环系统",knowledgePoint:"心脏的位置和形态",prompt:"心脏位于？",options:["中纵隔内","后纵隔内","腹膜后间隙","颅腔内"],correct:"A",score:10,errorType:"B",brief:"心脏位置"},
    {id:2,type:"multiple",module:"循环系统",knowledgePoint:"心脏的结构",prompt:"心脏的四个腔包括？",options:["右心房","右心室","左心房","左心室"],correct:["A","B","C","D"],score:10,errorType:"C",brief:"心脏四腔"},
    {id:3,type:"fill",module:"循环系统",knowledgePoint:"心脏瓣膜",prompt:"左心房与左心室之间的瓣膜是___瓣。",options:[],correct:["二尖瓣","僧帽瓣"],score:10,errorType:"A",brief:"房室瓣"},
    {id:4,type:"single",module:"循环系统",knowledgePoint:"冠状动脉",prompt:"冠状动脉起自？",options:["升主动脉","肺动脉干","上腔静脉","主动脉弓"],correct:"A",score:10,errorType:"B",brief:"冠状动脉起点"},
    {id:5,type:"image",module:"循环系统",knowledgePoint:"心脏传导系",prompt:"识图判断：心脏传导系的起搏点通常是？",options:["窦房结","房室结","房室束","浦肯野纤维"],correct:"A",score:10,errorType:"C",brief:"传导系识图"},
    {id:6,type:"single",module:"循环系统",knowledgePoint:"体循环和肺循环",prompt:"肺循环的起点是？",options:["右心室","左心室","右心房","左心房"],correct:"A",score:10,errorType:"D",brief:"肺循环路径"}
  ]},
  "感觉器": {title:"感觉器·单元测评", questions:[
    {id:1,type:"single",module:"感觉器",knowledgePoint:"眼球壁",prompt:"眼球壁由外向内依次为？",options:["纤维膜、血管膜、视网膜","视网膜、血管膜、纤维膜","血管膜、纤维膜、视网膜","纤维膜、视网膜、血管膜"],correct:"A",score:10,errorType:"A",brief:"眼球壁层次"},
    {id:2,type:"multiple",module:"感觉器",knowledgePoint:"眼球内容物",prompt:"眼球内容物包括？",options:["房水","晶状体","玻璃体","角膜"],correct:["A","B","C"],score:10,errorType:"C",brief:"眼球内容物"},
    {id:3,type:"fill",module:"感觉器",knowledgePoint:"耳",prompt:"位于中耳鼓室内、连接鼓膜与内耳的听小骨有锤骨、砧骨和___。",options:[],correct:["镫骨"],score:10,errorType:"A",brief:"听小骨"},
    {id:4,type:"single",module:"感觉器",knowledgePoint:"视网膜",prompt:"感光细胞主要位于？",options:["视网膜","巩膜","脉络膜","虹膜"],correct:"A",score:10,errorType:"C",brief:"视网膜功能"},
    {id:5,type:"image",module:"感觉器",knowledgePoint:"眼球结构",prompt:"识图判断：调节晶状体曲度的结构是？",options:["睫状体","虹膜","巩膜","视神经"],correct:"A",score:10,errorType:"C",brief:"眼球结构识图"},
    {id:6,type:"single",module:"感觉器",knowledgePoint:"前庭蜗器",prompt:"维持身体平衡的感受器主要位于？",options:["前庭器","耳蜗","鼓膜","外耳道"],correct:"A",score:10,errorType:"B",brief:"平衡觉"}
  ]},
  "神经系统": {title:"神经系统·单元测评", questions:[
    {id:1,type:"single",module:"神经系统",knowledgePoint:"中枢神经系统",prompt:"中枢神经系统包括？",options:["脑和脊髓","脑神经和脊神经","交感神经和副交感神经","神经节和神经丛"],correct:"A",score:10,errorType:"A",brief:"中枢神经系统"},
    {id:2,type:"multiple",module:"神经系统",knowledgePoint:"脑膜",prompt:"脑和脊髓的被膜包括？",options:["硬膜","蛛网膜","软膜","胸膜"],correct:["A","B","C"],score:10,errorType:"A",brief:"脑脊髓被膜"},
    {id:3,type:"fill",module:"神经系统",knowledgePoint:"脊髓",prompt:"脊髓下端在成人平第___腰椎下缘。",options:[],correct:["1","一","L1"],score:10,errorType:"A",brief:"脊髓位置"},
    {id:4,type:"single",module:"神经系统",knowledgePoint:"反射弧",prompt:"完成反射活动的结构基础是？",options:["反射弧","突触小体","神经核","灰质"],correct:"A",score:10,errorType:"D",brief:"反射弧"},
    {id:5,type:"image",module:"神经系统",knowledgePoint:"脑的结构",prompt:"识图判断：大脑半球外侧沟下方的脑叶是？",options:["颞叶","额叶","顶叶","枕叶"],correct:"A",score:10,errorType:"C",brief:"脑叶识图"},
    {id:6,type:"single",module:"神经系统",knowledgePoint:"自主神经",prompt:"支配心肌、平滑肌和腺体的神经属于？",options:["自主神经","躯体运动神经","感觉神经","视神经"],correct:"A",score:10,errorType:"D",brief:"自主神经功能"}
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
function diagnose(d){
  const q=(d.questions||[]).map(markQuestion);
  var w=q.filter(function(x){return x.r!=="正确"});
  var total=q.reduce(function(s,x){return s+(+x.score||0);},0);
  var got=q.reduce(function(s,x){return s+x.g;},0);
  const mods={}; q.forEach(function(x){(mods[x.module]=mods[x.module]||[]).push(x);});
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
    if(x.r!=="正确"){
      s.stats.errorTypes[x.errorType||"待判定"] = (s.stats.errorTypes[x.errorType||"待判定"]||0)+1;
      s.stats.modules[x.module] = s.stats.modules[x.module]||{total:0, correct:0};
    }
    s.stats.modules[x.module] = s.stats.modules[x.module]||{total:0, correct:0};
    s.stats.modules[x.module].total++;
    if(x.r==="正确") s.stats.modules[x.module].correct++;
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
  return s;
}

/* ==========================================================
   3. 学生端
   ========================================================== */

function setupStudent(){
  const sysSel = document.getElementById("studentSystem");
  sysSel.innerHTML = Object.keys(SYSTEM_BANKS).map(function(x){return '<option>'+x+'</option>';}).join("");
  document.getElementById("startQuiz").onclick = renderSystemQuiz;
  updateCountHint();
  sysSel.onchange = updateCountHint;
  document.querySelectorAll("#studentSystem,#assignSingle,#assignMultiple,#assignFill,#assignImage,#assignCount")
    .forEach(function(el){el.addEventListener("input", updateCountHint);});
}

function updateCountHint(){
  const name = document.getElementById("studentSystem").value;
  const bank = SYSTEM_BANKS[name]||{questions:[]};
  const allowed = getAllowedTypes();
  var available = (bank.questions||[]).filter(function(x){return allowed.includes(x.type)}).length;
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
  var q = (bank.questions||[]).filter(function(x){return allowed.includes(x.type);});
  if(!q.length) q = bank.questions||[];
  const requested = Math.max(1, +document.getElementById("assignCount").value||q.length);
  const count = Math.min(requested, q.length);
  q = q.slice(0,count);
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
    qHtml += '<div class="quiz-q">'+
      '<div class="qtitle"><span class="qno">'+(i+1)+'</span>'+esc(x.prompt)+
      '<span class="qtype-tag">'+(typeName[x.type]||x.type)+'</span></div>'+
      '<div class="muted small">'+esc(x.module)+' · '+esc(x.knowledgePoint)+'</div>'+
      body+
      '</div>';
  }
  const warnNote = count<requested
    ? '<div class="callout">题型所限，已使用现有 '+count+' 题。</div>'
    : "";
  panel.innerHTML =
    '<h1>'+esc(bank.title)+'</h1>'+
    '<p class="muted">本次测试系统：<b>'+esc(name)+'</b> · 教师配置题量：'+count+'题</p>'+
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
      qs.push({type: x.type, module: x.module, knowledgePoint: x.knowledgePoint, prompt: x.prompt, options: x.options, correct: x.correct, score: x.score, answer: a});
    }
    var d = diagnose({title:bank.title, system:name, questions:qs});
    renderStudentReport(d);
    bumpStats(d);
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
    '<h2>📌 错题摘要</h2>' +
    '<table class="table"><tr><th>知识点</th><th>错误类型</th><th>摘要</th></tr>' + wRowsHtml + '</table>' +
    '<h2>🤖 AI 智能解析</h2>' +
    '<div id="aiExplain">AI 解析生成中…</div>' +
    '<h2>🧪 阶段 3 · ' + esc(d.system) + ' 自测校验</h2>' +
    '<div id="selfQuestions"></div>' +
    '<div class="actions"><button class="primary" id="submitSelf">提交自测</button><span class="muted small">正确率达 80% 才算通过</span></div>' +
    '<div id="selfResult"></div>';

  bindSelfTest(d);
  aiExplainErrors(d);
}

/* 阶段 3 自测 */
function bindSelfTest(d){
  const sys = d.system || "本次测评";
  const qs = d.q.filter(q => !d.system || q.module===d.system);
  const target = document.getElementById("selfQuestions");
  const typeName={single:"单选", multiple:"多选", fill:"填空", image:"识图"};
  target.innerHTML = qs.map((q,i)=>{
    return `<div class="quiz-q">
      <div class="qtitle"><span class="qno">${i+1}</span>${esc(q.brief||q.knowledgePoint)}<span class="qtype-tag">${typeName[q.type]||q.type}</span></div>
      <div class="muted small">${esc(sys)} · ${esc(q.knowledgePoint)}</div>
      <input class="self-answer" data-i="${i}" placeholder="${q.type==="multiple"?"多选请填写 A,B,C":"请输入答案"}">
    </div>`;
  }).join("");
  document.getElementById("submitSelf").onclick = ()=>{
    let pass = 0;
    qs.forEach((q,i)=>{
      const v = document.querySelector(`.self-answer[data-i="${i}"]`).value.trim();
      const a = q.type==="multiple" ? v.split(/[,，、\s]+/).filter(Boolean) : v;
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
  document.getElementById("dashMetrics").innerHTML = `
    <div class="metric"><b>${sessions}</b><span>测评次数</span></div>
    <div class="metric"><b>${total}</b><span>累计答题</span></div>
    <div class="metric"><b>${correct}</b><span>累计正确</span></div>
    <div class="metric"><b>${rate}%</b><span>总体正确率</span></div>
    <div class="metric"><b>${modules}</b><span>已覆盖系统</span></div>
  `;
}

function renderRadar(){
  const s = loadState();
  const mods = s.stats.modules||{};
  const names = Object.keys(mods);
  if(!names.length){
    document.getElementById("radarChart").innerHTML = `<div class="empty"><p>暂无数据，完成一次测评后将自动生成能力画像。</p></div>`;
    return;
  }
  const values = names.map(n => Math.round((mods[n].correct/Math.max(mods[n].total,1))*100));
  const el = document.getElementById("radarChart");
  if(!radarChart) radarChart = echarts.init(el);
  radarChart.setOption({
    tooltip: {},
    radar: { indicator: names.map(n=>({name:n, max:100})), radius:"65%", splitNumber:5 },
    series: [{
      type: "radar",
      data:[{ value: values, name:"正确率(%)",
        areaStyle:{ color:"rgba(23,105,209,.18)" },
        lineStyle:{ color:"#1769d1" },
        itemStyle:{ color:"#1769d1" }
      }]
    }]
  });
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
      document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));
      document.querySelector(`.view[data-view="${v}"]`)?.classList.remove("hidden");
      if(v==="dashboard") setupDashboard();
      if(v==="graph") setTimeout(renderKG, 80);
    };
  });
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