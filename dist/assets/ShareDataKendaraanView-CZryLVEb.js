import{a6 as _e,a7 as ye,c as r,o as l,a8 as j,d as s,_ as be,a as we,u as $e,h as Ce,s as Se,g as De,i as g,T as xe,D as T,y as Re,U as Ie,b as i,f as o,I as u,t as d,H as Q,e as Te,F,A as K,m as S,n as X,C as Ve,k as Pe,M as Ue,p as Fe,q as Z}from"./index-CZIgWyh-.js";import{s as ee}from"./index-D1F1gN01.js";import{N as Le}from"./NavHeaderView-Cn3iEKbd.js";var Be=function(R){var _=R.dt;return`
.p-progressspinner {
    position: relative;
    margin: 0 auto;
    width: 100px;
    height: 100px;
    display: inline-block;
}

.p-progressspinner::before {
    content: "";
    display: block;
    padding-top: 100%;
}

.p-progressspinner-spin {
    height: 100%;
    transform-origin: center center;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    animation: p-progressspinner-rotate 2s linear infinite;
}

.p-progressspinner-circle {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: 0;
    stroke: `.concat(_("progressspinner.color.1"),`;
    animation: p-progressspinner-dash 1.5s ease-in-out infinite, p-progressspinner-color 6s ease-in-out infinite;
    stroke-linecap: round;
}

@keyframes p-progressspinner-rotate {
    100% {
        transform: rotate(360deg);
    }
}
@keyframes p-progressspinner-dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124px;
    }
}
@keyframes p-progressspinner-color {
    100%,
    0% {
        stroke: `).concat(_("progressspinner.color.1"),`;
    }
    40% {
        stroke: `).concat(_("progressspinner.color.2"),`;
    }
    66% {
        stroke: `).concat(_("progressspinner.color.3"),`;
    }
    80%,
    90% {
        stroke: `).concat(_("progressspinner.color.4"),`;
    }
}
`)},Ae={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},Ee=_e.extend({name:"progressspinner",theme:Be,classes:Ae}),je={name:"BaseProgressSpinner",extends:ye,props:{strokeWidth:{type:String,default:"2"},fill:{type:String,default:"none"},animationDuration:{type:String,default:"2s"}},style:Ee,provide:function(){return{$pcProgressSpinner:this,$parentInstance:this}}},te={name:"ProgressSpinner",extends:je,inheritAttrs:!1,computed:{svgStyle:function(){return{"animation-duration":this.animationDuration}}}},Ke=["fill","stroke-width"];function Me(m,R,_,$,M,h){return l(),r("div",j({class:m.cx("root"),role:"progressbar"},m.ptmi("root")),[(l(),r("svg",j({class:m.cx("spin"),viewBox:"25 25 50 50",style:h.svgStyle},m.ptm("spin")),[s("circle",j({class:m.cx("circle"),cx:"50",cy:"50",r:"20",fill:m.fill,"stroke-width":m.strokeWidth,strokeMiterlimit:"10"},m.ptm("circle")),null,16,Ke)],16))],16)}te.render=Me;const Ne={class:"rental-container"},We={class:"hero-section"},He={class:"hero-content"},Oe={class:"hero-actions"},qe={class:"stats-grid"},ze={class:"stat-item"},Ye={class:"stat-number"},Ge={class:"stat-item"},Je={class:"stat-number"},Qe={class:"stat-item"},Xe={class:"stat-number"},Ze={class:"stat-item"},et={class:"stat-number"},tt={class:"filter-section"},st={class:"filter-grid"},at={class:"filter-item"},nt={class:"filter-item"},it={class:"filter-item"},ot={class:"filter-actions"},rt={class:"vehicles-section"},lt={class:"section-header"},ct={class:"section-title"},dt={class:"vehicle-count"},ut={class:"header-actions"},pt={key:0,class:"loading-state"},mt={key:1,class:"vehicle-grid"},vt={class:"vehicle-image-container"},gt=["src","alt"],ht={key:1,class:"no-image"},ft={key:2,class:"image-nav"},kt={key:3,class:"image-indicators"},_t=["onClick"],yt={class:"vehicle-info"},bt={class:"vehicle-header"},wt={class:"vehicle-plate"},$t={class:"vehicle-year"},Ct={class:"vehicle-type"},St={class:"vehicle-specs"},Dt={key:0,class:"spec-item"},xt={key:1,class:"spec-item"},Rt={key:2,class:"spec-item"},It={key:0,class:"price-packages"},Tt={class:"price-grid"},Vt=["onClick"],Pt={class:"package-name"},Ut={class:"package-price"},Ft={class:"card-actions"},Lt={class:"action-group"},Bt={class:"contact-info"},At={key:2,class:"empty-state"},Et={class:"share-content"},jt={class:"share-url-section"},Kt={class:"p-inputgroup"},Mt={key:0,class:"share-preview"},Nt={class:"share-preview-title"},Wt={class:"share-preview-desc"},Ht={class:"social-share-grid"},Ot={__name:"ShareDataKendaraanView",setup(m){const R=we(),_=$e(),$=Ce(),{id_client:M}=Se(_);De();const h=g([]),I=g(!1),f=g(""),y=g(new Date),b=g(new Date),L=g({}),N=xe(),B=g(!1),k=g(""),v=g({title:"",description:"",type:"page"}),se=t=>{var a,c;const e=`Halo, Saya tertarik untuk merental ${(a=t.value)==null?void 0:a.desc} (ID: ${(c=t.value)==null?void 0:c.id})`,n=`https://wa.me/${W.value.kontak_person}?text=${encodeURIComponent(e)}`;window.open(n,"_blank")},D=T(()=>{let t=h.value;if(f.value){const e=f.value.toLowerCase();t=t.filter(n=>{var a,c,x,p;return((a=n.no_pol)==null?void 0:a.toLowerCase().includes(e))||((c=n.desc)==null?void 0:c.toLowerCase().includes(e))||((x=n.jenis)==null?void 0:x.toLowerCase().includes(e))||((p=n.status)==null?void 0:p.toLowerCase().includes(e))})}return t}),W=g(null),ae=async()=>{try{const t=R.apiBaseUrl,e={mode:1,id_client:N.query.client_id},n=await Z.post(`${t}/v1/get_profile_company`,e);W.value=n.data.response}catch(t){console.error("Error fetching data:",t)}},V=T(()=>h.value.length),A=T(()=>D.value.filter(t=>t.status==="Tersedia").length),H=T(()=>D.value.filter(t=>t.status==="Sedang Rental").length),ne=T(()=>V.value?Math.round(H.value/V.value*100):0),w=t=>{var e;return(e=t.reff_pic)!=null&&e.original&&Array.isArray(t.reff_pic.original)?t.reff_pic.original:[]},P=t=>L.value[t]||0,E=(t,e)=>{L.value[t]=e},ie=t=>{const e=h.value.find(c=>c.id===t),n=w(e);if(n.length<=1)return;const a=P(t);E(t,(a+1)%n.length)},oe=t=>{const e=h.value.find(c=>c.id===t),n=w(e);if(n.length<=1)return;const a=P(t);E(t,a===0?n.length-1:a-1)},re=t=>{t.target.src="/placeholder-car.jpg"},le=t=>{switch(t){case"Tersedia":return"status-available";case"Sedang Rental":return"status-rented";case"Maintenance":return"status-maintenance";default:return"status-available"}},O=t=>{if(!t)return"Rp 0";const e=typeof t=="string"?parseInt(t.replace(/[^\d]/g,"")):t;return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(e)},q=(t={})=>{const e=window.location.origin+window.location.pathname,n=new URLSearchParams(window.location.search);return f.value&&n.set("search",f.value),y.value&&n.set("start_date",U(y.value)),b.value&&n.set("end_date",U(b.value)),n.set("client_id",M.value),Object.entries(t).forEach(([a,c])=>{c&&n.set(a,c)}),n.toString()?`${e}?${n.toString()}`:e},ce=async()=>{const t=q(),e="Rental Kendaraan Premium",n=`Temukan ${V.value} kendaraan berkualitas dengan ${A.value} unit tersedia. Sewa sekarang dengan harga terjangkau!`;await z({url:t,title:e,description:n,type:"page"})},de=async()=>{const t=q(),e=`${D.value.length} Kendaraan Rental Tersedia`;let n="Lihat pilihan kendaraan rental kami";f.value&&(n+=` untuk "${f.value}"`),y.value&&b.value&&(n+=` dari ${G(y.value)} - ${G(b.value)}`),n+=`. ${A.value} unit siap disewa!`,await z({url:t,title:e,description:n,type:"results"})},z=async t=>{if(v.value=t,k.value=t.url,navigator.share&&t.type!=="page")try{await navigator.share({title:t.title,text:t.description,url:t.url});return}catch(e){if(e.name==="AbortError")return}B.value=!0},ue=async()=>{try{await navigator.clipboard.writeText(k.value),$.add({severity:"success",summary:"Berhasil!",detail:"Link berhasil disalin ke clipboard",life:3e3})}catch{const e=document.createElement("textarea");e.value=k.value,document.body.appendChild(e),e.select(),document.execCommand("copy"),document.body.removeChild(e),$.add({severity:"success",summary:"Berhasil!",detail:"Link berhasil disalin",life:3e3})}},pe=()=>{const t=encodeURIComponent(`${v.value.title}

${v.value.description}

${k.value}`);window.open(`https://wa.me/?text=${t}`,"_blank")},me=()=>{const t=encodeURIComponent(`${v.value.title}

${v.value.description}`),e=encodeURIComponent(k.value);window.open(`https://t.me/share/url?url=${e}&text=${t}`,"_blank")},ve=()=>{const t=encodeURIComponent(k.value);window.open(`https://www.facebook.com/sharer/sharer.php?u=${t}`,"_blank")},ge=()=>{const t=encodeURIComponent(`${v.value.title}

${v.value.description}`),e=encodeURIComponent(k.value);window.open(`https://twitter.com/intent/tweet?text=${t}&url=${e}`,"_blank")},he=()=>{const t=encodeURIComponent(v.value.title),e=encodeURIComponent(`${v.value.description}

Kunjungi: ${k.value}`);window.location.href=`mailto:?subject=${t}&body=${e}`},fe=(t,e)=>{$.add({severity:"info",summary:"Package Selected",detail:`${e.nama_paket} - ${O(e.harga)}`,life:2e3})},Y=()=>{f.value="",y.value=new Date,b.value=new Date,$.add({severity:"info",summary:"Filters Reset",detail:"All filters have been reset",life:2e3})},U=t=>{if(!t)return null;const e=new Date(t);return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`},G=t=>t?new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(new Date(t)):"",J=async()=>{if(!I.value){I.value=!0;try{const t=N.params.id_client,e=R.apiBaseUrl,n={start_date:U(y.value),end_date:U(b.value),id_client:t};console.log("data",n);const a=await Z.post(`${e}/utilitas/dashboard_available`,n);h.value=a.data.data||[],h.value.forEach(c=>{const p=w(c).findIndex(C=>C.is_cover===1);L.value[c.id]=p>=0?p:0}),$.add({severity:"success",summary:"Data Loaded",detail:`${h.value.length} vehicles loaded successfully`,life:3e3})}catch(t){console.error("Error:",t),$.add({severity:"error",summary:"Loading Failed",detail:"Failed to load vehicle data",life:5e3})}finally{I.value=!1}}};return Re(()=>{J(),ae()}),(t,e)=>{const n=Ie("tooltip");return l(),r(F,null,[i(Le),s("div",Ne,[s("div",We,[s("div",He,[e[4]||(e[4]=s("h1",{class:"hero-title"},"Rental Kendaraan Premium",-1)),e[5]||(e[5]=s("p",{class:"hero-description"}," Pilih kendaraan terbaik untuk perjalanan Anda dengan harga terjangkau ",-1)),s("div",Oe,[i(o(u),{label:"Bagikan Halaman",icon:"pi pi-share-alt",onClick:ce,severity:"secondary",outlined:"",class:"share-hero-btn"})])]),s("div",qe,[s("div",ze,[s("span",Ye,d(V.value),1),e[6]||(e[6]=s("span",{class:"stat-label"},"Total Kendaraan",-1))]),s("div",Ge,[s("span",Je,d(A.value),1),e[7]||(e[7]=s("span",{class:"stat-label"},"Tersedia",-1))]),s("div",Qe,[s("span",Xe,d(H.value),1),e[8]||(e[8]=s("span",{class:"stat-label"},"Disewa",-1))]),s("div",Ze,[s("span",et,d(ne.value)+"%",1),e[9]||(e[9]=s("span",{class:"stat-label"},"Okupansi",-1))])])]),s("div",tt,[s("div",st,[s("div",at,[e[10]||(e[10]=s("label",{class:"filter-label"},"Cari Kendaraan",-1)),i(o(Q),{modelValue:f.value,"onUpdate:modelValue":e[0]||(e[0]=a=>f.value=a),placeholder:"Cari nomor polisi, jenis, atau merek...",class:"search-input"},null,8,["modelValue"])]),s("div",nt,[e[11]||(e[11]=s("label",{class:"filter-label"},"Tanggal Mulai",-1)),i(o(ee),{modelValue:y.value,"onUpdate:modelValue":e[1]||(e[1]=a=>y.value=a),dateFormat:"dd/mm/yy",placeholder:"Pilih tanggal",showIcon:"",class:"date-input"},null,8,["modelValue"])]),s("div",it,[e[12]||(e[12]=s("label",{class:"filter-label"},"Tanggal Selesai",-1)),i(o(ee),{modelValue:b.value,"onUpdate:modelValue":e[2]||(e[2]=a=>b.value=a),dateFormat:"dd/mm/yy",placeholder:"Pilih tanggal",showIcon:"",class:"date-input"},null,8,["modelValue"])]),s("div",ot,[i(o(u),{label:"Reset",icon:"pi pi-refresh",onClick:Y,severity:"secondary",outlined:""})])])]),s("div",rt,[s("div",lt,[s("h2",ct,[e[13]||(e[13]=Te(" Daftar Kendaraan ")),s("span",dt,"("+d(D.value.length)+")",1)]),s("div",ut,[i(o(u),{label:"Bagikan Hasil",icon:"pi pi-share-alt",onClick:de,severity:"info",outlined:"",class:"share-results-btn"}),i(o(u),{label:"Refresh",icon:"pi pi-refresh",onClick:J,loading:I.value,severity:"info",outlined:""},null,8,["loading"])])]),I.value?(l(),r("div",pt,[i(o(te),{class:"loading-spinner"}),e[14]||(e[14]=s("p",{class:"loading-text"},"Memuat data kendaraan...",-1))])):D.value.length>0?(l(),r("div",mt,[(l(!0),r(F,null,K(D.value,a=>{var c,x;return l(),r("div",{key:a.id,class:"vehicle-card"},[s("div",vt,[w(a).length>0?(l(),r("img",{key:0,src:(c=w(a)[P(a.id)])==null?void 0:c.url,alt:a.desc,class:"vehicle-image",onError:re},null,40,gt)):(l(),r("div",ht,e[15]||(e[15]=[s("i",{class:"pi pi-image"},null,-1),s("span",null,"No Image",-1)]))),s("div",{class:X(["status-badge",le(a.status)])},d(a.status||"Tersedia"),3),w(a).length>1?(l(),r("div",ft,[i(o(u),{icon:"pi pi-chevron-left",onClick:p=>oe(a.id),class:"nav-btn",text:"",rounded:""},null,8,["onClick"]),i(o(u),{icon:"pi pi-chevron-right",onClick:p=>ie(a.id),class:"nav-btn",text:"",rounded:""},null,8,["onClick"])])):S("",!0),w(a).length>1?(l(),r("div",kt,[(l(!0),r(F,null,K(w(a),(p,C)=>(l(),r("span",{key:C,class:X(["indicator",{active:C===P(a.id)}]),onClick:ke=>E(a.id,C)},null,10,_t))),128))])):S("",!0)]),s("div",yt,[s("div",bt,[s("h3",wt,d(a.deskripsi),1),s("span",$t,d(a.tahun_pembuatan),1)]),s("div",Ct,[e[16]||(e[16]=s("i",{class:"pi pi-car"},null,-1)),s("span",null,d(a.no_pol||"Mobil"),1)]),s("div",St,[a.type_transamisi?(l(),r("div",Dt,[e[17]||(e[17]=s("i",{class:"pi pi-cog"},null,-1)),s("span",null,d(a.type_transamisi),1)])):S("",!0),a.kapasitas?(l(),r("div",xt,[e[18]||(e[18]=s("i",{class:"pi pi-users"},null,-1)),s("span",null,d(a.kapasitas)+" seat",1)])):S("",!0),a.bahan_bakar?(l(),r("div",Rt,[e[19]||(e[19]=s("i",{class:"pi pi-bolt"},null,-1)),s("span",null,d(a.bahan_bakar),1)])):S("",!0)]),(x=a.paket_harga)!=null&&x.length?(l(),r("div",It,[e[20]||(e[20]=s("h4",{class:"price-title"},"Paket Sewa",-1)),s("div",Tt,[(l(!0),r(F,null,K(a.paket_harga,(p,C)=>(l(),r("div",{key:C,class:"price-tag",onClick:ke=>fe(a.id,p)},[s("div",Pt,d(p.nama_paket),1),s("div",Ut,d(O(p.harga)),1)],8,Vt))),128))])])):S("",!0),s("div",Ft,[s("div",Lt,[s("div",Bt,[i(o(u),{icon:"pi pi-whatsapp",class:"p-button-success whatsapp-btn",onClick:p=>se(a)},null,8,["onClick"]),s("p",null,"ID: "+d(a.id),1)])])])])])}),128))])):(l(),r("div",At,[e[21]||(e[21]=s("i",{class:"pi pi-car empty-icon"},null,-1)),e[22]||(e[22]=s("h3",{class:"empty-title"},"Tidak ada kendaraan tersedia",-1)),e[23]||(e[23]=s("p",{class:"empty-description"},"Coba ubah filter pencarian atau pilih tanggal lain.",-1)),i(o(u),{label:"Reset Filter",icon:"pi pi-refresh",onClick:Y,class:"reset-btn"})]))]),i(o(Ue),{visible:B.value,"onUpdate:visible":e[3]||(e[3]=a=>B.value=a),header:"Bagikan",modal:!0,style:{width:"450px"},class:"share-dialog"},{default:Ve(()=>[s("div",Et,[s("div",jt,[e[24]||(e[24]=s("label",{class:"share-label"},"Link untuk dibagikan",-1)),s("div",Kt,[i(o(Q),{value:k.value,readonly:"",class:"share-url-input"},null,8,["value"]),Pe(i(o(u),{icon:"pi pi-copy",onClick:ue,severity:"secondary"},null,512),[[n,"Salin Link",void 0,{top:!0}]])])]),v.value.title?(l(),r("div",Mt,[s("h4",Nt,d(v.value.title),1),s("p",Wt,d(v.value.description),1)])):S("",!0),s("div",Ht,[i(o(u),{label:"WhatsApp",icon:"pi pi-whatsapp",onClick:pe,class:"social-btn whatsapp-btn"}),i(o(u),{label:"Telegram",icon:"pi pi-send",onClick:me,class:"social-btn telegram-btn"}),i(o(u),{label:"Facebook",icon:"pi pi-facebook",onClick:ve,class:"social-btn facebook-btn"}),i(o(u),{label:"Twitter",icon:"pi pi-twitter",onClick:ge,class:"social-btn twitter-btn"}),i(o(u),{label:"Email",icon:"pi pi-envelope",onClick:he,class:"social-btn email-btn"})])])]),_:1},8,["visible"]),i(o(Fe))])],64)}}},Gt=be(Ot,[["__scopeId","data-v-c3e0629e"]]);export{Gt as default};
