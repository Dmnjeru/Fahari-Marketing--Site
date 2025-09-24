(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/admin/blogs/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/src/app/admin/blogs/page.tsx
__turbopack_context__.s([
    "default",
    ()=>AdminBlogsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
/** Helper: build API url */ function buildApiUrl() {
    let path = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "/api/blogs", query = arguments.length > 1 ? arguments[1] : void 0;
    var _process_env_NEXT_PUBLIC_API_URL;
    var _process_env_NEXT_PUBLIC_API_URL_replace;
    const base = (_process_env_NEXT_PUBLIC_API_URL_replace = (_process_env_NEXT_PUBLIC_API_URL = ("TURBOPACK compile-time value", "http://localhost:5000")) === null || _process_env_NEXT_PUBLIC_API_URL === void 0 ? void 0 : _process_env_NEXT_PUBLIC_API_URL.replace(/\/$/, "")) !== null && _process_env_NEXT_PUBLIC_API_URL_replace !== void 0 ? _process_env_NEXT_PUBLIC_API_URL_replace : "";
    let url = "".concat(base).concat(path);
    if (query && Object.keys(query).length) {
        const qs = Object.entries(query).map((param)=>{
            let [k, v] = param;
            return "".concat(encodeURIComponent(k), "=").concat(encodeURIComponent(String(v)));
        }).join("&");
        url += "?".concat(qs);
    }
    return url;
}
/** Simple client-side slug generator */ function makeSlug(s) {
    return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
/**
 * Safely extract 'message' from a Response body.
 * Tries JSON parse, falls back to text.
 */ async function extractMessageFromResponse(res) {
    try {
        const txt = await res.text();
        try {
            const parsed = JSON.parse(txt);
            if (parsed && typeof parsed === "object" && "message" in parsed) {
                const maybeMsg = parsed.message;
                if (typeof maybeMsg === "string") return maybeMsg;
            }
        } catch (e) {
        // not JSON — continue to return raw text
        }
        return txt ? txt : undefined;
    } catch (e) {
        return undefined;
    }
}
/** Build fetch options to use cookie-based auth (HttpOnly cookie) */ function fetchOptsJson() {
    let method = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "GET", body = arguments.length > 1 ? arguments[1] : void 0;
    const headers = {
        "Content-Type": "application/json"
    };
    const opts = {
        method,
        headers,
        credentials: "include"
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    return opts;
}
/** Minimal helper to guard against running in SSR */ const isBrowser = "object" !== "undefined";
/** Type guard for AbortError-like objects without using `any` */ function isAbortError(e) {
    if (typeof e === "object" && e !== null && "name" in e) {
        // property exists — check value
        const maybeName = e.name;
        return maybeName === "AbortError";
    }
    return false;
}
/** Safe error message extractor */ function getErrorMessage(e) {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    try {
        return JSON.stringify(e);
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
    // Form state (used for create & edit)
    const initialForm = {
        _id: "",
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
    // Abort controller for fetches
    const fetchControllerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const clearMessages = ()=>{
        setError(null);
        setSuccessMsg(null);
    };
    const resetForm = ()=>{
        setForm(initialForm);
        setIsEditing(false);
    };
    // Fetch blogs (admin view). Sends cookies so backend can auth user.
    const fetchBlogs = async ()=>{
        setLoading(true);
        setError(null);
        // cancel previous
        if (fetchControllerRef.current) {
            try {
                fetchControllerRef.current.abort();
            } catch (e) {
            /* ignore */ }
        }
        const controller = new AbortController();
        fetchControllerRef.current = controller;
        try {
            const url = buildApiUrl("/api/blogs", {
                admin: true,
                limit: 1000
            });
            const res = await fetch(url, {
                credentials: "include",
                signal: controller.signal
            });
            if (res.status === 401 || res.status === 403) {
                setError("Unauthorized. Please sign in as an admin.");
                setBlogs([]);
                setLoading(false);
                return;
            }
            if (!res.ok) {
                // fallback: public listing
                const fallback = await fetch(buildApiUrl("/api/blogs", {
                    limit: 1000
                }), {
                    credentials: "include",
                    signal: controller.signal
                });
                if (!fallback.ok) {
                    var _ref;
                    const errMsg = (_ref = await extractMessageFromResponse(res)) !== null && _ref !== void 0 ? _ref : "Failed to fetch blogs: ".concat(res.status, " ").concat(res.statusText);
                    throw new Error(errMsg);
                }
                const fbJson = await fallback.json();
                setBlogs(Array.isArray(fbJson.data) ? fbJson.data : []);
                setLoading(false);
                return;
            }
            const json = await res.json();
            setBlogs(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            if (isAbortError(err)) {
            // aborted — ignore
            } else {
                console.error("Admin fetch blogs error:", err);
                const message = getErrorMessage(err);
                setError(message !== null && message !== void 0 ? message : "Failed to fetch blogs");
                setBlogs([]);
            }
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminBlogsPage.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            fetchBlogs();
            return ({
                "AdminBlogsPage.useEffect": ()=>{
                    if (fetchControllerRef.current) {
                        try {
                            fetchControllerRef.current.abort();
                        } catch (e) {
                        /* ignore */ }
                    }
                }
            })["AdminBlogsPage.useEffect"];
        }
    }["AdminBlogsPage.useEffect"], []);
    // Create blog
    const handleCreate = async (e)=>{
        var _form_content;
        e.preventDefault();
        clearMessages();
        if (!form.title.trim() || !((_form_content = form.content) === null || _form_content === void 0 ? void 0 : _form_content.trim()) || !form.category.trim()) {
            setError("Title, content and category are required.");
            return;
        }
        setBusy(true);
        try {
            var _form_slug, _form_excerpt, _form_image;
            const payload = {
                title: form.title.trim(),
                slug: ((_form_slug = form.slug) === null || _form_slug === void 0 ? void 0 : _form_slug.trim()) || makeSlug(form.title),
                excerpt: (_form_excerpt = form.excerpt) === null || _form_excerpt === void 0 ? void 0 : _form_excerpt.trim(),
                content: form.content,
                image: (_form_image = form.image) === null || _form_image === void 0 ? void 0 : _form_image.trim(),
                category: form.category.trim(),
                tags: form.tags ? form.tags.split(",").map((t)=>t.trim()).filter(Boolean) : [],
                isPublished: Boolean(form.isPublished)
            };
            const res = await fetch(buildApiUrl("/api/blogs"), fetchOptsJson("POST", payload));
            if (res.status === 401 || res.status === 403) {
                throw new Error("Not authorized. Please log in as an admin.");
            }
            if (!res.ok) {
                const bodyMessage = await extractMessageFromResponse(res);
                throw new Error(bodyMessage || "Create failed: ".concat(res.status));
            }
            await res.json();
            setSuccessMsg("Blog created successfully.");
            await fetchBlogs();
            resetForm();
        } catch (err) {
            console.error("Create blog error:", err);
            var _getErrorMessage;
            setError((_getErrorMessage = getErrorMessage(err)) !== null && _getErrorMessage !== void 0 ? _getErrorMessage : "Failed to create blog.");
        } finally{
            setBusy(false);
        }
    };
    // Start editing: populate form
    const startEdit = (b)=>{
        setError(null);
        setSuccessMsg(null);
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
    const handleUpdate = async (e)=>{
        var _form_content;
        e.preventDefault();
        clearMessages();
        if (!form._id) {
            setError("No blog selected for update.");
            return;
        }
        if (!form.title.trim() || !((_form_content = form.content) === null || _form_content === void 0 ? void 0 : _form_content.trim()) || !form.category.trim()) {
            setError("Title, content and category are required.");
            return;
        }
        setBusy(true);
        try {
            var _form_slug, _form_excerpt, _form_image;
            const payload = {
                title: form.title.trim(),
                slug: ((_form_slug = form.slug) === null || _form_slug === void 0 ? void 0 : _form_slug.trim()) || makeSlug(form.title),
                excerpt: (_form_excerpt = form.excerpt) === null || _form_excerpt === void 0 ? void 0 : _form_excerpt.trim(),
                content: form.content,
                image: (_form_image = form.image) === null || _form_image === void 0 ? void 0 : _form_image.trim(),
                category: form.category.trim(),
                tags: form.tags ? form.tags.split(",").map((t)=>t.trim()).filter(Boolean) : [],
                isPublished: Boolean(form.isPublished)
            };
            const res = await fetch(buildApiUrl("/api/blogs/".concat(form._id)), fetchOptsJson("PUT", payload));
            if (res.status === 401 || res.status === 403) {
                throw new Error("Not authorized. Please log in as an admin.");
            }
            if (!res.ok) {
                const bodyMessage = await extractMessageFromResponse(res);
                throw new Error(bodyMessage || "Update failed: ".concat(res.status));
            }
            await res.json();
            setSuccessMsg("Blog updated successfully.");
            await fetchBlogs();
            resetForm();
        } catch (err) {
            console.error("Update blog error:", err);
            var _getErrorMessage;
            setError((_getErrorMessage = getErrorMessage(err)) !== null && _getErrorMessage !== void 0 ? _getErrorMessage : "Failed to update blog.");
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
            const res = await fetch(buildApiUrl("/api/blogs/".concat(id)), {
                method: "DELETE",
                credentials: "include"
            });
            if (res.status === 401 || res.status === 403) {
                throw new Error("Not authorized. Please log in as an admin.");
            }
            if (!res.ok) {
                const bodyMessage = await extractMessageFromResponse(res);
                throw new Error(bodyMessage || "Delete failed: ".concat(res.status));
            }
            await res.json();
            setSuccessMsg("Blog deleted.");
            await fetchBlogs();
        } catch (err) {
            console.error("Delete blog error:", err);
            var _getErrorMessage;
            setError((_getErrorMessage = getErrorMessage(err)) !== null && _getErrorMessage !== void 0 ? _getErrorMessage : "Failed to delete blog.");
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
            const res = await fetch(buildApiUrl("/api/blogs/".concat(b._id)), fetchOptsJson("PUT", payload));
            if (res.status === 401 || res.status === 403) {
                throw new Error("Not authorized. Please log in as an admin.");
            }
            if (!res.ok) {
                const bodyMessage = await extractMessageFromResponse(res);
                throw new Error(bodyMessage || "Failed to update publish state: ".concat(res.status));
            }
            await res.json();
            setSuccessMsg("Blog ".concat(payload.isPublished ? "published" : "unpublished", "."));
            await fetchBlogs();
        } catch (err) {
            console.error("Toggle publish error:", err);
            var _getErrorMessage;
            setError((_getErrorMessage = getErrorMessage(err)) !== null && _getErrorMessage !== void 0 ? _getErrorMessage : "Failed to update publish state.");
        } finally{
            setBusy(false);
        }
    };
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
                                    lineNumber: 399,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-600",
                                    children: "Create, edit, publish or delete articles."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                    lineNumber: 400,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 398,
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
                                    lineNumber: 404,
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
                                    lineNumber: 407,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 403,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                    lineNumber: 397,
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
                            lineNumber: 422,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mt-1",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 423,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                    lineNumber: 421,
                    columnNumber: 11
                }, this),
                successMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-green-800",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm",
                        children: successMsg
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                        lineNumber: 429,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                    lineNumber: 428,
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
                                                lineNumber: 438,
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
                                                lineNumber: 439,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 437,
                                        columnNumber: 15
                                    }, this),
                                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "py-12 text-center text-gray-500",
                                        children: "Loading..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 443,
                                        columnNumber: 17
                                    }, this) : blogs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "py-12 text-center text-gray-500",
                                        children: "No posts yet."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 445,
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
                                                                            lineNumber: 453,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-lg font-semibold text-gray-900",
                                                                            children: b.title
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 454,
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
                                                                                    lineNumber: 456,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "mx-2",
                                                                                    children: "•"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                                    lineNumber: 457,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    children: (_b_category = b.category) !== null && _b_category !== void 0 ? _b_category : "Uncategorized"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                                    lineNumber: 458,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "mx-2",
                                                                                    children: "•"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                                    lineNumber: 459,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    children: b.isPublished ? "Published" : "Draft"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                                    lineNumber: 460,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 455,
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
                                                                            lineNumber: 463,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                    lineNumber: 452,
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
                                                                            lineNumber: 468,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>togglePublish(b),
                                                                            className: "text-sm px-3 py-1 rounded-md border bg-white hover:bg-gray-50",
                                                                            children: b.isPublished ? "Unpublish" : "Publish"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 472,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>handleDelete(b._id),
                                                                            className: "text-sm px-3 py-1 rounded-md bg-red-50 text-red-700 border hover:bg-red-100",
                                                                            children: "Delete"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                            lineNumber: 476,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                                    lineNumber: 467,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                            lineNumber: 451,
                                                            columnNumber: 25
                                                        }, this),
                                                        b.excerpt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-2 text-sm text-gray-600 line-clamp-2",
                                                            children: b.excerpt
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                            lineNumber: 482,
                                                            columnNumber: 39
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                    lineNumber: 450,
                                                    columnNumber: 23
                                                }, this)
                                            }, b._id, false, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 449,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 447,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                lineNumber: 436,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 435,
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
                                        lineNumber: 494,
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
                                                        lineNumber: 498,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: form.title,
                                                        onChange: (e)=>{
                                                            setForm((s)=>({
                                                                    ...s,
                                                                    title: e.target.value
                                                                }));
                                                            if (!isEditing && !form.slug) {
                                                                setForm((s)=>({
                                                                        ...s,
                                                                        slug: makeSlug(e.target.value)
                                                                    }));
                                                            }
                                                        },
                                                        placeholder: "Enter post title",
                                                        className: "mt-1 block w-full rounded-md border px-3 py-2",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 499,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 497,
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
                                                        lineNumber: 515,
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
                                                        lineNumber: 516,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 514,
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
                                                        lineNumber: 526,
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
                                                        lineNumber: 527,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 525,
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
                                                        lineNumber: 538,
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
                                                        lineNumber: 539,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 537,
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
                                                        lineNumber: 549,
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
                                                        lineNumber: 550,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 548,
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
                                                        lineNumber: 561,
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
                                                        lineNumber: 562,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 560,
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
                                                        lineNumber: 572,
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
                                                        lineNumber: 573,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 571,
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
                                                        lineNumber: 583,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm text-gray-700",
                                                        children: "Published"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                        lineNumber: 588,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 582,
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
                                                        lineNumber: 592,
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
                                                        lineNumber: 597,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                                lineNumber: 591,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/blogs/page.tsx",
                                        lineNumber: 496,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/blogs/page.tsx",
                                lineNumber: 493,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/blogs/page.tsx",
                            lineNumber: 492,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/blogs/page.tsx",
                    lineNumber: 433,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin/blogs/page.tsx",
            lineNumber: 396,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/admin/blogs/page.tsx",
        lineNumber: 395,
        columnNumber: 5
    }, this);
}
_s(AdminBlogsPage, "G/l/QcUc3TvcLlk0+d1k0XLwkIc=");
_c = AdminBlogsPage;
var _c;
__turbopack_context__.k.register(_c, "AdminBlogsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_admin_blogs_page_tsx_daa049a9._.js.map