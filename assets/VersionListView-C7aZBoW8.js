import{G as x,d as A,g,h as N,l as R,p as S,r as f,o as n,c as i,a as c,e as s,w as u,F as w,A as V,f as y,t as L,m as D,_ as F}from"./index-B7-MSkhf.js";import{i as B}from"./index-CFFsEcQF.js";const z={getVersionApiRoute:"/api/version/list",getVersionList:async()=>await x.get(z.getVersionApiRoute).then(_=>_.data)},M={class:"version-container"},O={class:"header"},U={class:"view-switch"},W={key:0,class:"trees-container"},$={class:"floor-title"},I={key:1,class:"tables-container"},G={class:"floor-title"},H=A({__name:"VersionListView",setup(_){const r=g("tree"),m=g([]),l=new Map,E=(t,e)=>{if(t&&t instanceof HTMLElement){const o=B(t);l.set(e,o)}},C=t=>({tooltip:{trigger:"item",triggerOn:"mousemove"},series:[{type:"tree",data:[{name:`${t.floor}樓版本管理`,children:t.fieldVersions.map(e=>({name:e.name,value:e.version,children:e.vehiclesVersions.map(o=>({name:o.name,value:o.version}))}))}],layout:"orthogonal",orient:"LR",label:{position:"center",verticalAlign:"middle",align:"center",fontSize:16,fontWeight:"bold",offset:[0,-20],color:"white",formatter:e=>e.value?`${e.name} : ${e.value}`:e.name},leaves:{label:{position:"center",verticalAlign:"middle",align:"center",fontSize:16,color:"white",fontWeight:"bold",offset:[60,5]},itemStyle:{color:"#409eff",borderColor:"#409eff",borderWidth:2},lineStyle:{width:2}},emphasis:{focus:"descendant"},expandAndCollapse:!0,initialTreeDepth:2,animationDuration:250,animationDurationUpdate:250}]}),h=()=>{m.value.forEach(t=>{const e=l.get(t.floor);e&&e.setOption(C(t))})},d=()=>{l.forEach(t=>{t.resize()})},T=t=>t.fieldVersions.map(e=>({fieldName:e.name,fieldVersion:e.version,vehicles:e.vehiclesVersions.map(o=>({name:o.name,version:o.version}))}));return N(async()=>{const t=await z.getVersionList();m.value=t,r.value==="tree"&&(setTimeout(h,200),setTimeout(d,200),window.addEventListener("resize",d))}),R(r,t=>{t==="tree"?D(()=>{h(),d(),window.addEventListener("resize",d)}):(window.removeEventListener("resize",d),l.forEach(e=>{e.dispose()}),l.clear())}),S(()=>{r.value==="tree"&&(window.removeEventListener("resize",d),l.forEach(t=>{t.dispose()}))}),(t,e)=>{const o=f("el-radio-button"),k=f("el-radio-group"),p=f("el-table-column"),b=f("el-table");return n(),i("div",M,[c("div",O,[e[3]||(e[3]=c("h1",{class:"title"},"版本管理",-1)),c("div",U,[s(k,{modelValue:r.value,"onUpdate:modelValue":e[0]||(e[0]=a=>r.value=a),size:"large"},{default:u(()=>[s(o,{label:"tree"},{default:u(()=>e[1]||(e[1]=[y("樹狀圖")])),_:1}),s(o,{label:"table"},{default:u(()=>e[2]||(e[2]=[y("表格")])),_:1})]),_:1},8,["modelValue"])])]),r.value==="tree"?(n(),i("div",W,[(n(!0),i(w,null,V(m.value,a=>(n(),i("div",{key:a.floor,class:"tree-wrapper"},[c("h2",$,L(a.floor)+" F",1),c("div",{ref_for:!0,ref:v=>E(v,a.floor),class:"tree-chart"},null,512)]))),128))])):(n(),i("div",I,[(n(!0),i(w,null,V(m.value,a=>(n(),i("div",{key:a.floor,class:"table-wrapper"},[c("h2",G,L(a.floor)+" F",1),s(b,{data:T(a),border:""},{default:u(()=>[s(p,{prop:"fieldName",label:"場域名稱"}),s(p,{prop:"fieldVersion",label:"派車系統版本"}),s(p,{label:"車輛版本"},{default:u(({row:v})=>[s(b,{data:v.vehicles,border:"",size:"small"},{default:u(()=>[s(p,{prop:"name",label:"名稱"}),s(p,{prop:"version",label:"版本"})]),_:2},1032,["data"])]),_:1})]),_:2},1032,["data"])]))),128))]))])}}}),J=F(H,[["__scopeId","data-v-621af382"]]);export{J as default};
