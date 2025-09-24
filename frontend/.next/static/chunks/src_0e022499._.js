(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/axios.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/src/lib/axios.js
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
// -----------------------------------------------------------------------------
// Base URL (from env) - remove trailing slash if present
// -----------------------------------------------------------------------------
const API_BASE = (("TURBOPACK compile-time value", "http://localhost:5000") || "").replace(/\/$/, "");
// -----------------------------------------------------------------------------
// Token helpers
// -----------------------------------------------------------------------------
const ACCESS_TOKEN_KEY = "fahari_access_token";
function getStoredToken() {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (e) {
        return null;
    }
}
function storeToken(token) {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        if (token) {
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
        } else {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
    } catch (e) {
    // ignore storage errors
    }
}
// -----------------------------------------------------------------------------
// Axios instance
// -----------------------------------------------------------------------------
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: API_BASE || undefined,
    withCredentials: true
});
// -----------------------------------------------------------------------------
// Request interceptor: attach Authorization
// -----------------------------------------------------------------------------
api.interceptors.request.use((config)=>{
    if (!config.headers) {
        config.headers = {};
    }
    const token = getStoredToken();
    if (token) {
        config.headers["Authorization"] = "Bearer ".concat(token);
    }
    return config;
}, (error)=>Promise.reject(error));
// -----------------------------------------------------------------------------
// Response interceptor: refresh-on-401 with queueing
// -----------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue = [];
function processQueue(error) {
    let token = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
    failedQueue.forEach((queued)=>{
        if (error) {
            queued.reject(error);
        } else {
            if (token && queued.config.headers) {
                queued.config.headers["Authorization"] = "Bearer ".concat(token);
            }
            queued.resolve(api(queued.config));
        }
    });
    failedQueue = [];
}
api.interceptors.response.use((resp)=>resp, async (err)=>{
    var _err_response;
    const originalRequest = err.config;
    if (!originalRequest) return Promise.reject(err);
    if (((_err_response = err.response) === null || _err_response === void 0 ? void 0 : _err_response.status) === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            return new Promise((resolve, reject)=>{
                failedQueue.push({
                    resolve,
                    reject,
                    config: originalRequest
                });
            });
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
            var _refreshData_data;
            const refreshResp = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("".concat(API_BASE, "/api/admin/refresh"), {}, {
                withCredentials: true
            });
            const refreshData = refreshResp.data;
            const newToken = (refreshData === null || refreshData === void 0 ? void 0 : (_refreshData_data = refreshData.data) === null || _refreshData_data === void 0 ? void 0 : _refreshData_data.token) || (refreshData === null || refreshData === void 0 ? void 0 : refreshData.token) || null;
            if (newToken && typeof newToken === "string") {
                storeToken(newToken);
            } else {
                storeToken(null);
                if ("TURBOPACK compile-time truthy", 1) {
                    window.location.href = "/admin/login";
                }
                return Promise.reject(err);
            }
            const tokenToUse = getStoredToken();
            processQueue(null, tokenToUse || null);
            if (tokenToUse && originalRequest.headers) {
                originalRequest.headers["Authorization"] = "Bearer ".concat(tokenToUse);
            }
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            storeToken(null);
            if ("TURBOPACK compile-time truthy", 1) {
                window.location.href = "/admin/login";
            }
            return Promise.reject(refreshError);
        } finally{
            isRefreshing = false;
        }
    }
    return Promise.reject(err);
});
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/admin/blogs/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/src/app/admin/blogs/page.tsx
__turbopack_context__.s([
    "default",
    ()=>AdminBlogsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
// -----------------------------
// Helpers
// -----------------------------
function makeSlug(s) {
    return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
function getErrorMessage(e) {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    try {
        return JSON.stringify(e).slice(0, 200);
    } catch (e1) {
        return String(e);
    }
}
function AdminBlogsPage() {
    _s();
    const [blogs, setBlogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const initialForm = {
        _id: undefined,
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image: "",
        category: "",
        tags: "",
        isPublished: true
    };
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialForm);
    const [isEditing, setIsEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [successMsg, setSuccessMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Abort controller ref for requests
    const controllerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const clearMessages = ()=>{
        setError(null);
        setSuccessMsg(null);
    };
    const resetForm = ()=>{
        setForm({
            ...initialForm
        });
        setIsEditing(false);
    };
    // Fetch blogs (admin view). Use axios instance (api) which already has withCredentials
    const fetchBlogs = async ()=>{
        setLoading(true);
        setError(null);
        // cancel previous request
        if (controllerRef.current) {
            try {
                controllerRef.current.abort();
            } catch (e) {
            /* ignore */ }
        }
        const controller = new AbortController();
        controllerRef.current = controller;
        try {
            var _res_data;
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("/api/blogs", {
                params: {
                    admin: true,
                    limit: 1000
                },
                signal: controller.signal
            });
            setBlogs(Array.isArray((_res_data = res.data) === null || _res_data === void 0 ? void 0 : _res_data.data) ? res.data.data : []);
        } catch (err) {
            // handle axios-specific canceled error separately
            if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isCancel(err)) {
            // request canceled intentionally — ignore
            } else {
                var _axiosErr_response;
                const axiosErr = err;
                const status = axiosErr === null || axiosErr === void 0 ? void 0 : (_axiosErr_response = axiosErr.response) === null || _axiosErr_response === void 0 ? void 0 : _axiosErr_response.status;
                if (status === 401 || status === 403) {
                    setError("Unauthorized. Please sign in as an admin.");
                    setBlogs([]);
                    setLoading(false);
                    return;
                }
                console.error("Admin fetch blogs error:", err);
                setError(getErrorMessage(err) || "Failed to fetch blogs");
                setBlogs([]);
            }
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminBlogsPage.useEffect": ()=>{
            fetchBlogs();
            return ({
                "AdminBlogsPage.useEffect": ()=>{
                    if (controllerRef.current) {
                        try {
                            controllerRef.current.abort();
                        } catch (e) {
                        // ignore
                        }
                    }
                }
            })["AdminBlogsPage.useEffect"];
        }
    }["AdminBlogsPage.useEffect"], []);
    // Create blog
    const handleCreate = async (evt)=>{
        evt.preventDefault();
        clearMessages();
        if (!form.title.trim() || !form.content.trim() || !form.category.trim()) {
            setError("Title, content and category are required.");
            return;
        }
        setBusy(true);
        try {
            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim() || makeSlug(form.title),
                excerpt: form.excerpt.trim() || undefined,
                content: form.content,
                image: form.image.trim() || undefined,
                category: form.category.trim(),
                tags: form.tags ? form.tags.split(",").map((t)=>t.trim()).filter((t)=>t.length > 0) : [],
                isPublished: Boolean(form.isPublished)
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/api/blogs", payload);
            setSuccessMsg("Blog created successfully.");
            await fetchBlogs();
            resetForm();
        } catch (err) {
            console.error("Create blog error:", err);
            setError(getErrorMessage(err) || "Failed to create blog.");
        } finally{
            setBusy(false);
        }
    };
    // Start editing
    const startEdit = (b)=>{
        clearMessages();
        setIsEditing(true);
        var _b_title, _b_title1, _b_slug, _b_excerpt, _b_content, _b_image, _b_category, _b_tags;
        setForm({
            _id: b._id,
            title: (_b_title = b.title) !== null && _b_title !== void 0 ? _b_title : "",
            slug: (_b_slug = b.slug) !== null && _b_slug !== void 0 ? _b_slug : makeSlug((_b_title1 = b.title) !== null && _b_title1 !== void 0 ? _b_title1 : ""),
            excerpt: (_b_excerpt = b.excerpt) !== null && _b_excerpt !== void 0 ? _b_excerpt : "",
            content: (_b_content = b.content) !== null && _b_content !== void 0 ? _b_content : "",
            image: (_b_image = b.image) !== null && _b_image !== void 0 ? _b_image : "",
            category: (_b_category = b.category) !== null && _b_category !== void 0 ? _b_category : "",
            tags: ((_b_tags = b.tags) !== null && _b_tags !== void 0 ? _b_tags : []).join(", "),
            isPublished: Boolean(b.isPublished)
        });
    };
    // Update blog
    const handleUpdate = async (evt)=>{
        evt.preventDefault();
        clearMessages();
        if (!form._id) {
            setError("No blog selected for update.");
            return;
        }
        if (!form.title.trim() || !form.content.trim() || !form.category.trim()) {
            setError("Title, content and category are required.");
            return;
        }
        setBusy(true);
        try {
            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim() || makeSlug(form.title),
                excerpt: form.excerpt.trim() || undefined,
                content: form.content,
                image: form.image.trim() || undefined,
                category: form.category.trim(),
                tags: form.tags ? form.tags.split(",").map((t)=>t.trim()).filter((t)=>t.length > 0) : [],
                isPublished: Boolean(form.isPublished)
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("/api/blogs/".concat(form._id), payload);
            setSuccessMsg("Blog updated successfully.");
            await fetchBlogs();
            resetForm();
        } catch (err) {
            console.error("Update blog error:", err);
            setError(getErrorMessage(err) || "Failed to update blog.");
        } finally{
            setBusy(false);
        }
    };
    // Delete blog
    const handleDelete = async (id)=>{
        clearMessages();
        if (!id) return;
        if (!confirm("Are you sure you want to delete this blog post? This cannot be undone.")) return;
        setBusy(true);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete("/api/blogs/".concat(id));
            setSuccessMsg("Blog deleted.");
            await fetchBlogs();
        } catch (err) {
            console.error("Delete blog error:", err);
            setError(getErrorMessage(err) || "Failed to delete blog.");
        } finally{
            setBusy(false);
        }
    };
    // Toggle publish/unpublish
    const togglePublish = async (b)=>{
        clearMessages();
        setBusy(true);
        try {
            const payload = {
                isPublished: !Boolean(b.isPublished)
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("/api/blogs/".concat(b._id), payload);
            setSuccessMsg("Blog ".concat(payload.isPublished ? "published" : "unpublished", "."));
            await fetchBlogs();
        } catch (err) {
            console.error("Toggle publish error:", err);
            setError(getErrorMessage(err) || "Failed to update publish state.");
        } finally{
            setBusy(false);
        }
    };
    // ---------------------------------
    // Render
    // ---------------------------------
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "flex items-center justify-between mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl font-bold text-gray-900",
                                    children: "Manage Blog Posts"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                    lineNumber: 312,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-600",
                                    children: "Create, edit, publish or delete articles."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                    lineNumber: 313,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 311,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/admin",
                                    className: "text-sm text-gray-700 hover:underline",
                                    children: "← Admin dashboard"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                    lineNumber: 317,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        resetForm();
                                        clearMessages();
                                    },
                                    className: "rounded-md bg-white border px-3 py-1 text-sm shadow-sm hover:shadow",
                                    children: "New post"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                    lineNumber: 320,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 316,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                    lineNumber: 310,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-800",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            className: "block font-medium",
                            children: "Error"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 334,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mt-1",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 335,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                    lineNumber: 333,
                    columnNumber: 11
                }, this),
                successMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-green-800",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm",
                        children: successMsg
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                        lineNumber: 341,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                    lineNumber: 340,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-span-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white border rounded-2xl p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-lg font-semibold",
                                                children: "Posts"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 350,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-500",
                                                children: [
                                                    "Showing ",
                                                    blogs.length
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 351,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 349,
                                        columnNumber: 15
                                    }, this),
                                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "py-12 text-center text-gray-500",
                                        children: "Loading..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 355,
                                        columnNumber: 17
                                    }, this) : blogs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "py-12 text-center text-gray-500",
                                        children: "No posts yet."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 357,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "space-y-3",
                                        children: blogs.map((b)=>{
                                            var _b_category;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-start justify-between gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-sm text-gray-500",
                                                                            children: [
                                                                                "ID: ",
                                                                                b._id
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 365,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-lg font-semibold text-gray-900",
                                                                            children: b.title
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 366,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-sm text-gray-500 mt-1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    children: [
                                                                                        "Slug: ",
                                                                                        b.slug
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                                    lineNumber: 368,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "mx-2",
                                                                                    children: "•"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                                    lineNumber: 369,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    children: (_b_category = b.category) !== null && _b_category !== void 0 ? _b_category : "Uncategorized"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                                    lineNumber: 370,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "mx-2",
                                                                                    children: "•"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                                    lineNumber: 371,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    children: b.isPublished ? "Published" : "Draft"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                                    lineNumber: 372,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 367,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        b.createdAt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-xs text-gray-400 mt-1",
                                                                            children: [
                                                                                "Created: ",
                                                                                new Date(b.createdAt).toLocaleString()
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 375,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                    lineNumber: 364,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex-shrink-0 flex flex-col items-end gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>startEdit(b),
                                                                            className: "text-sm px-3 py-1 rounded-md bg-white border hover:bg-gray-50",
                                                                            children: "Edit"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 380,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>togglePublish(b),
                                                                            className: "text-sm px-3 py-1 rounded-md border bg-white hover:bg-gray-50",
                                                                            children: b.isPublished ? "Unpublish" : "Publish"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 384,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>handleDelete(b._id),
                                                                            className: "text-sm px-3 py-1 rounded-md bg-red-50 text-red-700 border hover:bg-red-100",
                                                                            children: "Delete"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 388,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                    lineNumber: 379,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                            lineNumber: 363,
                                                            columnNumber: 25
                                                        }, this),
                                                        b.excerpt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-2 text-sm text-gray-600 line-clamp-2",
                                                            children: b.excerpt
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                            lineNumber: 394,
                                                            columnNumber: 39
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                    lineNumber: 362,
                                                    columnNumber: 23
                                                }, this)
                                            }, b._id, false, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 361,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 359,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                lineNumber: 348,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 347,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                            className: "col-span-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white border rounded-2xl p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold mb-3",
                                        children: isEditing ? "Edit post" : "New post"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 406,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        onSubmit: isEditing ? handleUpdate : handleCreate,
                                        className: "space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium text-gray-700",
                                                        children: "Title"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 410,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: form.title,
                                                        onChange: (e)=>setForm((s)=>({
                                                                    ...s,
                                                                    title: e.target.value
                                                                })),
                                                        placeholder: "Enter post title",
                                                        className: "mt-1 block w-full rounded-md border px-3 py-2",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 411,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 409,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium text-gray-700",
                                                        children: "Slug (URL)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 422,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: form.slug,
                                                        onChange: (e)=>setForm((s)=>({
                                                                    ...s,
                                                                    slug: makeSlug(e.target.value)
                                                                })),
                                                        placeholder: "post-slug (auto-generated)",
                                                        className: "mt-1 block w-full rounded-md border px-3 py-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 423,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 421,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium text-gray-700",
                                                        children: "Category"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 433,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: form.category,
                                                        onChange: (e)=>setForm((s)=>({
                                                                    ...s,
                                                                    category: e.target.value
                                                                })),
                                                        placeholder: "e.g. Recipes, Health",
                                                        className: "mt-1 block w-full rounded-md border px-3 py-2",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 434,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 432,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium text-gray-700",
                                                        children: "Image URL"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 445,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: form.image,
                                                        onChange: (e)=>setForm((s)=>({
                                                                    ...s,
                                                                    image: e.target.value
                                                                })),
                                                        placeholder: "https://... (or leave blank)",
                                                        className: "mt-1 block w-full rounded-md border px-3 py-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 446,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 444,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium text-gray-700",
                                                        children: "Excerpt"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 456,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: form.excerpt,
                                                        onChange: (e)=>setForm((s)=>({
                                                                    ...s,
                                                                    excerpt: e.target.value
                                                                })),
                                                        placeholder: "Short summary for list view (optional)",
                                                        className: "mt-1 block w-full rounded-md border px-3 py-2",
                                                        maxLength: 300
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 457,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 455,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium text-gray-700",
                                                        children: "Tags (comma separated)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 468,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: form.tags,
                                                        onChange: (e)=>setForm((s)=>({
                                                                    ...s,
                                                                    tags: e.target.value
                                                                })),
                                                        placeholder: "e.g. yoghurt,recipes,healthy",
                                                        className: "mt-1 block w-full rounded-md border px-3 py-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 469,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 467,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium text-gray-700",
                                                        children: "Content (HTML or Markdown)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 479,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        value: form.content,
                                                        onChange: (e)=>setForm((s)=>({
                                                                    ...s,
                                                                    content: e.target.value
                                                                })),
                                                        placeholder: "Full article content",
                                                        className: "mt-1 block w-full rounded-md border px-3 py-2 min-h-[120px]",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 480,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 478,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: form.isPublished,
                                                        onChange: (e)=>setForm((s)=>({
                                                                    ...s,
                                                                    isPublished: e.target.checked
                                                                }))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 490,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm text-gray-700",
                                                        children: "Published"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 491,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 489,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "submit",
                                                        disabled: busy,
                                                        className: "rounded-md bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-60",
                                                        children: busy ? "Saving..." : isEditing ? "Save changes" : "Create post"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 495,
                                                        columnNumber: 19
                                                    }, this),
                                                    isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>{
                                                            resetForm();
                                                            clearMessages();
                                                        },
                                                        className: "rounded-md bg-white border px-3 py-2",
                                                        children: "Cancel"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 500,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 494,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 408,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                lineNumber: 405,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 404,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                    lineNumber: 345,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin/blogs/page.tsx",
            lineNumber: 309,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/admin/blogs/page.tsx",
        lineNumber: 308,
        columnNumber: 5
    }, this);
}
_s(AdminBlogsPage, "m6mTM1+KF8AjQSGnosLpEGf7Lpc=");
_c = AdminBlogsPage;
var _c;
__turbopack_context__.k.register(_c, "AdminBlogsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0e022499._.js.map