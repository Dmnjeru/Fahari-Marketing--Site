module.exports=[25432,a=>{a.v({className:"inter_5972bc34-module__OU16Qa__className"})},10179,a=>{"use strict";a.s(["default",()=>k],10179);var b=a.i(87924),c=a.i(72131),d=a.i(83490),e=a.i(50944),f=a.i(25432);let g={className:f.default.className,style:{fontFamily:"'Inter', 'Inter Fallback'",fontStyle:"normal"}};null!=f.default.variable&&(g.variable=f.default.variable);var h=a.i(40293),i=a.i(1453);function j({children:a}){let c=`
    :root {
      --brand-primary: #1d60a6;
      --brand-pink: #ff6fa6;
    }

    .nav-link {
      transition: box-shadow 0.18s ease, transform 0.12s ease;
      border-radius: 9999px;
      padding: 0.25rem 0.6rem;
    }

    .nav-link:hover {
      box-shadow: 0 6px 20px rgba(29, 96, 166, 0.12);
      transform: translateY(-1px);
    }

    .nav-link.active {
      box-shadow: 0 0 18px rgba(29, 96, 166, 0.25);
      background: rgba(29, 96, 166, 0.06);
      color: var(--brand-primary);
    }

    .footer-link {
      color: inherit;
    }

    .nav-link:focus,
    .footer-link:focus {
      outline: 3px solid rgba(29, 96, 166, 0.14);
      outline-offset: 2px;
    }
  `;return(0,b.jsxs)("html",{lang:"en",suppressHydrationWarning:!0,children:[(0,b.jsxs)("head",{children:[(0,b.jsx)("link",{rel:"canonical",href:"https://fahariyoghurt.co.ke"}),(0,b.jsx)("link",{rel:"icon",href:"/favicon.ico"}),(0,b.jsx)("meta",{name:"keywords",content:"Fahari, Yoghurt, Kenya, Fresh yoghurt, Dairy, Vanilla yoghurt"}),(0,b.jsx)("style",{dangerouslySetInnerHTML:{__html:c}}),(0,b.jsx)("script",{type:"application/ld+json",dangerouslySetInnerHTML:{__html:JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness",name:"Fahari Yoghurt",url:"https://fahariyoghurt.co.ke",logo:"https://fahariyoghurt.co.ke/preview.png",description:"Pure, healthy and delicious yoghurt made in Kenya."})}})]}),(0,b.jsxs)("body",{className:g.className,style:{backgroundColor:"#f8fafc"},children:[(0,b.jsx)(h.default,{}),(0,b.jsx)("main",{className:"min-h-screen",children:a}),(0,b.jsx)(i.default,{})]})]})}let k=()=>{let a=(0,e.useRouter)(),[f,g]=(0,c.useState)(!0),[h,i]=(0,c.useState)(null),[k,l]=(0,c.useState)(null);return((0,c.useEffect)(()=>{(async()=>{try{g(!0);let b=await d.default.get("/api/admin/me",{withCredentials:!0});if(!b.data?.success)return void a.push("/admin/login");let[c,e]=await Promise.all([d.default.get("/api/admin/jobs/count",{withCredentials:!0}),d.default.get("/api/admin/applications/count",{withCredentials:!0})]);i({totalJobs:c.data?.count||0,totalApplications:e.data?.count||0})}catch(a){d.default.isAxiosError(a)?console.error(a.response?.data?.message||a.message):a instanceof Error?console.error(a.message):console.error("Unexpected error:",a),l("Failed to load dashboard. Try again.")}finally{g(!1)}})()},[a]),f)?(0,b.jsx)(j,{children:(0,b.jsx)("div",{className:"flex items-center justify-center h-[70vh] text-gray-500",children:"Loading dashboard..."})}):k?(0,b.jsx)(j,{children:(0,b.jsx)("div",{className:"flex items-center justify-center h-[70vh] text-red-500",children:k})}):(0,b.jsx)(j,{children:(0,b.jsxs)("div",{className:"p-6",children:[(0,b.jsx)("h1",{className:"text-3xl font-bold mb-6",children:"Admin Dashboard"}),(0,b.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",children:[(0,b.jsxs)("div",{className:"bg-white shadow rounded-lg p-6 flex flex-col items-start",children:[(0,b.jsx)("h2",{className:"text-lg font-semibold text-gray-600 mb-2",children:"Total Jobs"}),(0,b.jsx)("span",{className:"text-3xl font-bold text-blue-600",children:h?.totalJobs})]}),(0,b.jsxs)("div",{className:"bg-white shadow rounded-lg p-6 flex flex-col items-start",children:[(0,b.jsx)("h2",{className:"text-lg font-semibold text-gray-600 mb-2",children:"Total Applications"}),(0,b.jsx)("span",{className:"text-3xl font-bold text-green-600",children:h?.totalApplications})]}),(0,b.jsxs)("div",{className:"bg-white shadow rounded-lg p-6 flex flex-col items-start",children:[(0,b.jsx)("h2",{className:"text-lg font-semibold text-gray-600 mb-2",children:"Quick Actions"}),(0,b.jsxs)("ul",{className:"text-gray-700 list-disc list-inside",children:[(0,b.jsx)("li",{children:"Create Job"}),(0,b.jsx)("li",{children:"Manage Applications"}),(0,b.jsx)("li",{children:"Edit Pages"})]})]})]})]})})}}];

//# sourceMappingURL=%5Broot-of-the-server%5D__328afacc._.js.map