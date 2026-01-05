import{_ as T,i as y,c as p,o as i,b as a,C as c,d as t,Q as u,m as _,F as v,A as f,f as n,aG as U,t as w,Y as B,I as k,aH as z}from"./index-CZIgWyh-.js";const G={class:"min-h-screen bg-gray-50 p-4"},M={class:"flex flex-col lg:flex-row gap-8 justify-center items-start"},E={class:"flex-1 overflow-x-auto"},L={class:"inline-block min-w-max"},R={class:"mb-2"},j={class:"flex items-center gap-1"},A={class:"mb-4"},K={class:"flex items-center gap-1"},V={class:"mb-2"},X={class:"flex items-center gap-1"},H={class:"mb-6"},I={class:"flex items-center gap-1"},Q={class:"text-center"},W={class:"font-semibold"},Y={class:"w-full lg:w-80 flex-shrink-0"},q={class:"mb-6"},J={class:"grid grid-cols-2 gap-2"},Z={class:"text-xl font-bold mb-1"},ee={class:"text-[10px]"},te={class:"mb-4"},se={class:"flex flex-col gap-2"},le={__name:"OdontogramComponent",setup(ie){const x={props:{number:Number,position:String,isDeciduous:Boolean,selected:Boolean,condition:Object,symbol:String},emits:["click"],setup(o,{emit:e}){const s=()=>{var N,$;return((N=o.condition)==null?void 0:N.fill)==="full"?"#4CAF50":(($=o.condition)==null?void 0:$.fill)==="stripe"?"url(#stripe-pattern)":"white"},b=o.isDeciduous?40:50;return{getFillColor:s,size:b,handleClick:()=>e("click")}},template:`
    <div class="flex flex-col items-center relative cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" @click="handleClick" :style="{width: size + 'px'}">
      <!-- Label atas untuk gigi atas -->
      <div v-if="position === 'top'" class="text-[10px] font-bold mb-0.5">{{ number }}</div>
      
      <!-- Symbol di atas gigi -->
      <div v-if="symbol && position === 'top'" class="absolute -top-7 text-lg font-bold">{{ symbol }}</div>

      <svg 
        :width="size" 
        :height="size" 
        viewBox="0 0 60 60"
        :class="['transition-all', selected ? 'ring-2 ring-yellow-400 rounded' : '']"
        :style="{ filter: selected ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))' : 'none' }"
      >
        <defs>
          <pattern id="stripe-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="white"/>
            <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#FF9800" stroke-width="2"/>
          </pattern>
        </defs>

        <!-- Main tooth shape -->
        <rect 
          x="5" y="5" 
          width="50" height="50" 
          :fill="getFillColor()"
          stroke="#333" 
          stroke-width="2"
        />

        <!-- Top surface -->
        <polygon
          points="5,5 15,15 45,15 55,5"
          :fill="condition?.top || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Right surface -->
        <polygon
          points="55,5 45,15 45,45 55,55"
          :fill="condition?.right || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Bottom surface -->
        <polygon
          points="5,55 15,45 45,45 55,55"
          :fill="condition?.bottom || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Left surface -->
        <polygon
          points="5,5 15,15 15,45 5,55"
          :fill="condition?.left || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Center -->
        <rect
          x="15" y="15" 
          width="30" height="30"
          :fill="condition?.center || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Draw X if marked -->
        <g v-if="symbol === 'X'">
          <line x1="10" y1="10" x2="50" y2="50" stroke="#000" stroke-width="3"/>
          <line x1="50" y1="10" x2="10" y2="50" stroke="#000" stroke-width="3"/>
        </g>

        <!-- Draw / if marked -->
        <line v-if="symbol === '/'" x1="50" y1="10" x2="10" y2="50" stroke="#000" stroke-width="3"/>

        <!-- Draw ■ if marked -->
        <rect v-if="symbol === '■'" x="20" y="20" width="20" height="20" fill="#000"/>
        
        <!-- Draw ▲ if marked -->
        <polygon v-if="symbol === '▲'" points="30,20 40,40 20,40" fill="#000"/>
        
        <!-- Draw ▼ if marked -->
        <polygon v-if="symbol === '▼'" points="30,40 20,20 40,20" fill="#000"/>
        
        <!-- Draw □ if marked -->
        <rect v-if="symbol === '□'" x="20" y="20" width="20" height="20" fill="none" stroke="#000" stroke-width="3"/>
        
        <!-- Draw # if marked -->
        <g v-if="symbol === '#'">
          <line x1="20" y1="25" x2="40" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="20" y1="35" x2="40" y2="35" stroke="#000" stroke-width="2"/>
          <line x1="25" y1="20" x2="25" y2="40" stroke="#000" stroke-width="2"/>
          <line x1="35" y1="20" x2="35" y2="40" stroke="#000" stroke-width="2"/>
        </g>
      </svg>

      <!-- Symbol di bawah gigi -->
      <div v-if="symbol && position === 'bottom'" class="absolute -bottom-7 text-lg font-bold">{{ symbol }}</div>

      <!-- Label bawah untuk gigi bawah -->
      <div v-if="position === 'bottom'" class="text-[10px] font-bold mt-0.5">{{ number }}</div>
    </div>
  `},l=y(null),d=y({}),r=y({}),g=[[18,17,16,15,14,13,12,11],[21,22,23,24,25,26,27,28]],h=[[55,54,53,52,51],[61,62,63,64,65]],C=[[85,84,83,82,81],[71,72,73,74,75]],D=[[48,47,46,45,44,43,42,41],[31,32,33,34,35,36,37,38]],P=[{code:"X",label:"Hilang"},{code:"/",label:"Dicabut"},{code:"■",label:"Tambal"},{code:"▲",label:"Akan Cabut"},{code:"▼",label:"Turun"},{code:"□",label:"Mahkota"},{code:"#",label:"Rusak"},{code:"PRD",label:"Protesa"},{code:"UNE",label:"Unerupted"}],m=o=>{l.value=o},F=o=>{l.value&&(r.value[l.value]=o)},S=o=>{l.value&&(d.value[l.value]={...d.value[l.value],fill:o})},O=()=>{l.value&&(delete d.value[l.value],delete r.value[l.value])};return(o,e)=>(i(),p("div",G,[a(n(B),{class:"max-w-full mx-auto"},{title:c(()=>e[2]||(e[2]=[t("div",{class:"text-center"},"Odontogram Profesional",-1)])),content:c(()=>[t("div",M,[t("div",E,[t("div",L,[t("div",R,[t("div",j,[e[3]||(e[3]=t("span",{class:"text-xs font-bold mr-2 whitespace-nowrap"},"NON 18",-1)),(i(!0),p(v,null,f([...g[0],...g[1]],s=>(i(),u(x,{key:s,number:s,position:"top",selected:l.value===s,condition:d.value[s],symbol:r.value[s],onClick:b=>m(s)},null,8,["number","selected","condition","symbol","onClick"]))),128)),e[4]||(e[4]=t("span",{class:"text-xs font-bold ml-2 whitespace-nowrap"},"28 NON",-1))])]),t("div",A,[t("div",K,[e[5]||(e[5]=t("span",{class:"invisible text-xs font-bold mr-2 whitespace-nowrap"},"------",-1)),e[6]||(e[6]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),e[7]||(e[7]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),e[8]||(e[8]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),(i(!0),p(v,null,f([...h[0],...h[1]],s=>(i(),u(x,{key:s,number:s,position:"top","is-deciduous":"",selected:l.value===s,condition:d.value[s],symbol:r.value[s],onClick:b=>m(s)},null,8,["number","selected","condition","symbol","onClick"]))),128)),e[9]||(e[9]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),e[10]||(e[10]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),e[11]||(e[11]=t("span",{class:"invisible text-xs font-bold ml-2 whitespace-nowrap"},"------",-1))])]),e[21]||(e[21]=t("div",{class:"my-4 border-t-2 border-gray-800"},null,-1)),t("div",V,[t("div",X,[e[12]||(e[12]=t("span",{class:"invisible text-xs font-bold mr-2 whitespace-nowrap"},"------",-1)),e[13]||(e[13]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),e[14]||(e[14]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),e[15]||(e[15]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),(i(!0),p(v,null,f([...C[0],...C[1]],s=>(i(),u(x,{key:s,number:s,position:"bottom","is-deciduous":"",selected:l.value===s,condition:d.value[s],symbol:r.value[s],onClick:b=>m(s)},null,8,["number","selected","condition","symbol","onClick"]))),128)),e[16]||(e[16]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),e[17]||(e[17]=t("span",{class:"invisible flex-shrink-0",style:{width:"50px"}},null,-1)),e[18]||(e[18]=t("span",{class:"invisible text-xs font-bold ml-2 whitespace-nowrap"},"------",-1))])]),t("div",H,[t("div",I,[e[19]||(e[19]=t("span",{class:"text-xs font-bold mr-2 whitespace-nowrap"},"UNE 48",-1)),(i(!0),p(v,null,f([...D[0],...D[1]],s=>(i(),u(x,{key:s,number:s,position:"bottom",selected:l.value===s,condition:d.value[s],symbol:r.value[s],onClick:b=>m(s)},null,8,["number","selected","condition","symbol","onClick"]))),128)),e[20]||(e[20]=t("span",{class:"text-xs font-bold ml-2 whitespace-nowrap"},"38 UNE",-1))])])]),l.value?(i(),u(n(U),{key:0,severity:"warn",closable:!1,class:"mb-4"},{default:c(()=>[t("div",Q,[t("p",W,"Gigi terpilih: "+w(l.value),1),e[22]||(e[22]=t("p",{class:"text-sm"},"Klik simbol atau kondisi di samping untuk menandai gigi",-1))])]),_:1})):_("",!0)]),t("div",Y,[a(n(B),{class:"bg-gray-50"},{content:c(()=>[t("div",q,[e[23]||(e[23]=t("h3",{class:"font-bold text-base mb-3"},"Simbol:",-1)),t("div",J,[(i(),p(v,null,f(P,s=>a(n(k),{key:s.code,disabled:!l.value,onClick:b=>F(s.code),class:"flex-col h-auto py-2 text-center",outlined:"",size:"small"},{default:c(()=>[t("div",Z,w(s.code),1),t("div",ee,w(s.label),1)]),_:2},1032,["disabled","onClick"])),64))])]),a(n(z)),t("div",te,[e[24]||(e[24]=t("h3",{class:"font-bold text-base mb-3"},"Kondisi:",-1)),t("div",se,[a(n(k),{label:"Gigi Penuh",icon:"pi pi-circle-fill",disabled:!l.value,onClick:e[0]||(e[0]=s=>S("full")),severity:"success",size:"small"},null,8,["disabled"]),a(n(k),{label:"Gigi Bergaris",icon:"pi pi-bars",disabled:!l.value,onClick:e[1]||(e[1]=s=>S("stripe")),severity:"warning",size:"small"},null,8,["disabled"]),a(n(k),{label:"Reset Gigi",icon:"pi pi-refresh",disabled:!l.value,onClick:O,severity:"danger",size:"small"},null,8,["disabled"])])]),a(n(z)),e[25]||(e[25]=t("div",null,[t("h3",{class:"font-bold text-base mb-2"},"Petunjuk:"),t("ol",{class:"text-xs space-y-1 list-decimal list-inside text-gray-700"},[t("li",null,"Klik gigi yang ingin ditandai"),t("li",null,"Pilih simbol atau kondisi"),t("li",null,"Simbol muncul di atas/bawah gigi"),t("li",null,"Warna mengisi seluruh gigi")])],-1))]),_:1})])])]),_:1})]))}},ne=T(le,[["__scopeId","data-v-26bedbb4"]]);export{ne as default};
