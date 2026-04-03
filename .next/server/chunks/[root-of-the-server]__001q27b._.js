module.exports=[70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14397,e=>e.a(async(t,a)=>{try{let t=await e.y("@vercel/postgres-dea0214ad3ea438d");e.n(t),a()}catch(e){a(e)}},!0),90612,e=>e.a(async(t,a)=>{try{var r=e.i(14397),i=t([r]);async function n(e,t){if("POST"!==e.method)return t.status(405).end();let{date:a,calories:i,protein:n,carbs:s,fat:o,meal_log:l,weight:d,active_calories:u}=e.body;if(!a)return t.status(400).json({error:"date required"});let p=null!=d&&""!==d?Number(d):null,c=null!=u&&""!==u?parseInt(u,10):null;try{await r.sql`
      INSERT INTO entries (date, calories, protein, carbs, fat, meal_log, weight, active_calories)
      VALUES (
        ${a}::date,
        ${Math.round(Number(i)||0)},
        ${Math.round(Number(n)||0)},
        ${Math.round(Number(s)||0)},
        ${Math.round(Number(o)||0)},
        ${l??""},
        ${p},
        ${c}
      )
      ON CONFLICT (date) DO UPDATE SET
        calories = EXCLUDED.calories,
        protein = EXCLUDED.protein,
        carbs = EXCLUDED.carbs,
        fat = EXCLUDED.fat,
        meal_log = EXCLUDED.meal_log,
        weight = COALESCE(EXCLUDED.weight, entries.weight),
        active_calories = COALESCE(EXCLUDED.active_calories, entries.active_calories),
        updated_at = NOW()
    `,t.json({ok:!0})}catch(e){t.status(500).json({error:e.message})}}[r]=i.then?(await i)():i,e.s(["default",0,n]),a()}catch(e){a(e)}},!1),65972,e=>e.a(async(t,a)=>{try{var r=e.i(97025),i=e.i(12080),n=e.i(50816),s=e.i(84383),o=e.i(90612),l=e.i(72057),d=e.i(18905),u=e.i(82114),p=t([o]);[o]=p.then?(await p)():p;let h=(0,s.hoist)(o,"default"),E=(0,s.hoist)(o,"config"),m=new n.PagesAPIRouteModule({definition:{kind:i.RouteKind.PAGES_API,page:"/api/sync",pathname:"/api/sync",bundlePath:"",filename:""},userland:o,distDir:".next",relativeProjectDir:""});async function c(e,t,a){a.requestMeta&&(0,u.setRequestMeta)(e,a.requestMeta),m.isDev&&(0,u.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let i="/api/sync";i=i.replace(/\/index$/,"")||"/";let n=await m.prepare(e,t,{srcPage:i});if(!n){t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve());return}let{query:s,params:o,prerenderManifest:p,routerServerContext:c}=n;try{let a,r=e.method||"GET",n=(0,l.getTracer)(),u=n.getActiveScopeSpan(),h=!!(null==c?void 0:c.isWrappedByNextServer),E=m.instrumentationOnRequestError.bind(m),v=async l=>m.render(e,t,{query:{...s,...o},params:o,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:p.preview,propagateError:!1,dev:m.isDev,page:"/api/sync",internalRevalidate:null==c?void 0:c.revalidate,onError:(...t)=>E(e,...t)}).finally(()=>{if(!l)return;l.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let e=n.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=e.get("next.route");if(s){let e=`${r} ${s}`;l.setAttributes({"next.route":s,"http.route":s,"next.span_name":e}),l.updateName(e),a&&a!==l&&(a.setAttribute("http.route",s),a.updateName(e))}else l.updateName(`${r} ${i}`)});h&&u?await v(u):(a=n.getActiveScopeSpan(),await n.withPropagatedContext(e.headers,()=>n.trace(d.BaseServerSpan.handleRequest,{spanName:`${r} ${i}`,kind:l.SpanKind.SERVER,attributes:{"http.method":r,"http.target":e.url}},v),void 0,!h))}catch(e){if(m.isDev)throw e;(0,r.sendError)(t,500,"Internal Server Error")}finally{null==a.waitUntil||a.waitUntil.call(a,Promise.resolve())}}e.s(["config",0,E,"default",0,h,"handler",0,c]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__001q27b._.js.map