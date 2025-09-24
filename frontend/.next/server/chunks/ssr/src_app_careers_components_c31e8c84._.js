module.exports = [
"[project]/src/app/careers/components/ApplicationForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/src/app/careers/components/ApplicationForm.tsx
__turbopack_context__.s([
    "default",
    ()=>ApplicationForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const API = ("TURBOPACK compile-time value", "http://localhost:5000") || "http://localhost:5000";
function ApplicationForm({ job, onSuccess }) {
    const [fullName, setFullName] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState("");
    const [email, setEmail] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState("");
    const [phone, setPhone] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState("");
    const [coverLetter, setCoverLetter] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState("");
    const [file, setFile] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [loading, setLoading] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [progress, setProgress] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [error, setError] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [success, setSuccess] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const xhrRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null);
    const maxFileMB = 5;
    const allowedExt = [
        "pdf",
        "doc",
        "docx"
    ];
    function validate() {
        if (!fullName.trim()) return "Full name is required";
        if (!email.trim()) return "Email is required";
        // simple email sanity check
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Please enter a valid email";
        if (!phone.trim()) return "Phone is required";
        if (!file) return "Please attach your CV (PDF/DOC/DOCX)";
        const parts = file.name.split(".");
        const ext = (parts.length > 1 ? parts.pop() || "" : "").toLowerCase();
        if (!allowedExt.includes(ext)) return "CV must be a PDF, DOC or DOCX file";
        if (file.size > maxFileMB * 1024 * 1024) return `CV must be smaller than ${maxFileMB} MB`;
        return null;
    }
    const handleFile = (e)=>{
        setError(null);
        const f = e.target.files?.[0] ?? null;
        setFile(f);
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        // cleanup: abort XHR if component unmounts while uploading
        return ()=>{
            if (xhrRef.current && xhrRef.current.readyState !== 4) {
                try {
                    xhrRef.current.abort();
                } catch  {
                // ignore
                }
            }
        };
    }, []);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError(null);
        setSuccess(null);
        const v = validate();
        if (v) {
            setError(v);
            return;
        }
        // Determine job id (support _id or id)
        const jobWithId = job;
        const jobId = jobWithId._id ?? jobWithId.id ?? "";
        if (!jobId) {
            setError("Invalid job selected");
            return;
        }
        setLoading(true);
        setProgress(0);
        try {
            const form = new FormData();
            form.append("jobId", jobId);
            form.append("fullName", fullName.trim());
            form.append("email", email.trim());
            form.append("phone", phone.trim());
            if (coverLetter) form.append("coverLetter", coverLetter.trim());
            if (file) form.append("cv", file, file.name);
            await new Promise((resolve, reject)=>{
                const xhr = new XMLHttpRequest();
                xhrRef.current = xhr;
                xhr.open("POST", `${API}/api/careers/apply`, true);
                xhr.upload.onprogress = (evt)=>{
                    if (evt.lengthComputable) {
                        setProgress(Math.round(evt.loaded / evt.total * 100));
                    }
                };
                xhr.onload = ()=>{
                    setLoading(false);
                    setProgress(null);
                    const raw = xhr.responseText || "";
                    let parsed = null;
                    try {
                        parsed = raw ? JSON.parse(raw) : null;
                    } catch (parseErr) {
                        // Keep parsed null and log parse error
                        console.error("Failed to parse server response JSON:", parseErr, "raw:", raw);
                    }
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const msg = parsed?.message || "Application submitted successfully";
                        setSuccess(msg);
                        setFullName("");
                        setEmail("");
                        setPhone("");
                        setCoverLetter("");
                        setFile(null);
                        if (onSuccess) onSuccess();
                        resolve();
                        return;
                    }
                    // Non-2xx -> derive message
                    let msg = `Submission failed (${xhr.status})`;
                    if (parsed) {
                        if (parsed.message) msg = parsed.message;
                        else if (parsed.errors && parsed.errors.length) {
                            msg = parsed.errors.map((er)=>er.msg).join("; ");
                        }
                    }
                    console.error("Application submission failed:", xhr.status, raw || parsed);
                    setError(msg);
                    reject(new Error(msg));
                };
                xhr.onerror = ()=>{
                    setLoading(false);
                    setProgress(null);
                    setError("Network error. Please try again.");
                    console.error("XHR network error while submitting application");
                    reject(new Error("Network error"));
                };
                // helpful for APIs that return JSON
                xhr.setRequestHeader("Accept", "application/json");
                xhr.send(form);
            });
        } catch (err) {
            if (err instanceof Error) setError(err.message || "Failed to submit application");
            else setError("Failed to submit application");
            setLoading(false);
            setProgress(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        className: "bg-emerald-50 rounded-2xl p-6",
        "aria-live": "polite",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-lg font-semibold",
                children: [
                    "Apply for ",
                    job?.title
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                lineNumber: 190,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-600 mt-1",
                children: "Fill this form and attach your CV."
            }, void 0, false, {
                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: fullName,
                        onChange: (e)=>setFullName(e.target.value),
                        placeholder: "Full name",
                        name: "fullName",
                        className: "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200",
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: email,
                        onChange: (e)=>setEmail(e.target.value),
                        placeholder: "Email address",
                        type: "email",
                        name: "email",
                        className: "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200",
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                        lineNumber: 202,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: phone,
                        onChange: (e)=>setPhone(e.target.value),
                        placeholder: "Phone number",
                        name: "phone",
                        className: "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200",
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: coverLetter,
                        onChange: (e)=>setCoverLetter(e.target.value),
                        placeholder: "Cover letter (optional, max 3000 characters)",
                        className: "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200 min-h-[120px]"
                    }, void 0, false, {
                        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-slate-700",
                                children: [
                                    "Attach CV (PDF, DOC, DOCX, max ",
                                    maxFileMB,
                                    "MB)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                                lineNumber: 226,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "file",
                                accept: ".pdf,.doc,.docx,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                onChange: handleFile,
                                className: "mt-2",
                                "aria-label": "Upload CV",
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                                lineNumber: 227,
                                columnNumber: 11
                            }, this),
                            file && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-slate-600 mt-1",
                                children: [
                                    file.name,
                                    " • ",
                                    (file.size / 1024 / 1024).toFixed(2),
                                    " MB"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                                lineNumber: 236,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                        lineNumber: 225,
                        columnNumber: 9
                    }, this),
                    progress !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full bg-slate-200 rounded-full h-2 mt-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: `${progress}%`
                                },
                                className: "h-2 rounded-full bg-emerald-600"
                            }, void 0, false, {
                                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                                lineNumber: 244,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-slate-500 mt-1",
                                children: [
                                    progress,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                                lineNumber: 245,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                        lineNumber: 243,
                        columnNumber: 11
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "alert",
                        className: "text-sm text-red-600",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                        lineNumber: 250,
                        columnNumber: 11
                    }, this),
                    success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "status",
                        className: "text-sm text-emerald-700",
                        children: success
                    }, void 0, false, {
                        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                        lineNumber: 255,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: loading,
                                className: "px-4 py-2 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60",
                                children: loading ? "Submitting…" : "Submit Application"
                            }, void 0, false, {
                                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                                lineNumber: 261,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setFullName("");
                                    setEmail("");
                                    setPhone("");
                                    setCoverLetter("");
                                    setFile(null);
                                    setError(null);
                                    setSuccess(null);
                                },
                                className: "px-4 py-2 rounded-2xl border text-sm",
                                children: "Reset"
                            }, void 0, false, {
                                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                                lineNumber: 269,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                        lineNumber: 260,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
                lineNumber: 193,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/careers/components/ApplicationForm.tsx",
        lineNumber: 189,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/careers/components/JobList.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//frontend\src\app\careers\components\JobList.tsx
__turbopack_context__.s([
    "default",
    ()=>JobList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$careers$2f$components$2f$ApplicationForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/careers/components/ApplicationForm.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function JobList({ jobs }) {
    const [selectedJob, setSelectedJob] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                children: [
                    jobs.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8 bg-white rounded-2xl shadow text-center col-span-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-semibold",
                                children: "No vacancies right now"
                            }, void 0, false, {
                                fileName: "[project]/src/app/careers/components/JobList.tsx",
                                lineNumber: 17,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500 mt-2",
                                children: "Check back later — new roles are posted frequently."
                            }, void 0, false, {
                                fileName: "[project]/src/app/careers/components/JobList.tsx",
                                lineNumber: 18,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/careers/components/JobList.tsx",
                        lineNumber: 16,
                        columnNumber: 11
                    }, this),
                    jobs.map((job)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].article, {
                            layout: true,
                            initial: {
                                opacity: 0,
                                y: 10
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "bg-white p-6 rounded-2xl shadow hover:shadow-lg transition",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-bold",
                                    children: job.title
                                }, void 0, false, {
                                    fileName: "[project]/src/app/careers/components/JobList.tsx",
                                    lineNumber: 31,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-600 mt-1",
                                    children: [
                                        job.location,
                                        " • ",
                                        job.type
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/careers/components/JobList.tsx",
                                    lineNumber: 32,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-slate-700 line-clamp-3",
                                    children: job.description
                                }, void 0, false, {
                                    fileName: "[project]/src/app/careers/components/JobList.tsx",
                                    lineNumber: 33,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedJob(job),
                                    className: "mt-3 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-sm hover:bg-emerald-700",
                                    children: "Apply Now"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/careers/components/JobList.tsx",
                                    lineNumber: 34,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, job._id, true, {
                            fileName: "[project]/src/app/careers/components/JobList.tsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/careers/components/JobList.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            selectedJob && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl p-6 max-w-xl w-full relative overflow-y-auto max-h-[90vh]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setSelectedJob(null),
                            className: "absolute top-4 right-4 text-slate-500 hover:text-slate-900",
                            children: "✕"
                        }, void 0, false, {
                            fileName: "[project]/src/app/careers/components/JobList.tsx",
                            lineNumber: 47,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$careers$2f$components$2f$ApplicationForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            job: selectedJob,
                            onSuccess: ()=>setSelectedJob(null)
                        }, void 0, false, {
                            fileName: "[project]/src/app/careers/components/JobList.tsx",
                            lineNumber: 53,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/careers/components/JobList.tsx",
                    lineNumber: 46,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/careers/components/JobList.tsx",
                lineNumber: 45,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=src_app_careers_components_c31e8c84._.js.map