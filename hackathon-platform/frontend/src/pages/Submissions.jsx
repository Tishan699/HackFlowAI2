import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  GitBranch,
  ExternalLink,
  Sparkles,
  Video,
  CheckCircle2,
  X,
  Code,
  UploadCloud,
  Paperclip,
  Download,
  AlertCircle,
  Trash2,
  FolderArchive,
  Image as ImageIcon,
  FileCheck
} from "lucide-react";
import { hackathonService } from "../services/api";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 Megabytes in bytes

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    teamName: "NeuralNinjas",
    description: "",
    githubUrl: "",
    demoUrl: "",
    videoUrl: "",
    techStack: "React, Python, FastAPI, TailwindCSS",
  });

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const list = await hackathonService.getSubmissions();
    setSubmissions(list);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const validateAndAddFiles = (fileList) => {
    setFileError("");
    const newFiles = Array.from(fileList || []);
    const validToAdd = [];

    for (const file of newFiles) {
      // 20MB Max File Size validation
      if (file.size > MAX_FILE_SIZE) {
        setFileError(
          `"${file.name}" exceeds the 20MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 20MB.`
        );
        continue;
      }

      // Check for duplicate names in current selection
      const isDuplicate = attachedFiles.some((f) => f.name === file.name && f.size === file.size);
      if (isDuplicate) {
        continue;
      }

      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isZip = file.name.toLowerCase().endsWith(".zip") || file.name.toLowerCase().endsWith(".tar") || file.name.toLowerCase().endsWith(".gz") || file.name.toLowerCase().endsWith(".rar");
      const isImage = file.type.startsWith("image/");

      validToAdd.push({
        rawFile: file,
        name: file.name,
        size: file.size,
        sizeFormatted: formatBytes(file.size),
        isPdf,
        isZip,
        isImage,
        type: file.type || "application/octet-stream",
      });
    }

    if (validToAdd.length > 0) {
      setAttachedFiles((prev) => [...prev, ...validToAdd]);
    }
  };

  const handleFileChange = (e) => {
    validateAndAddFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setFileError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setUploadStatus("Uploading project deliverables and PDF documentation...");

    try {
      let uploadedFileRecords = [];

      // If files are attached, upload them to the server
      if (attachedFiles.length > 0) {
        const uploadData = new FormData();
        attachedFiles.forEach((f) => {
          if (f.rawFile) {
            uploadData.append("files", f.rawFile);
          }
        });

        try {
          const res = await hackathonService.uploadFiles(uploadData);
          if (res?.files) {
            uploadedFileRecords = res.files;
          }
        } catch (uploadErr) {
          console.warn("Server upload failed or offline; using local attachment state:", uploadErr);
          // Fallback to local representation for offline demonstration
          uploadedFileRecords = attachedFiles.map((f, i) => ({
            id: `f_local_${Date.now()}_${i}`,
            originalName: f.name,
            size: f.size,
            sizeFormatted: f.sizeFormatted,
            isPdf: f.isPdf,
            url: "#",
          }));
        }
      }

      setUploadStatus("Running automated AI evaluation on code & deliverables...");

      await hackathonService.submitProject({
        ...formData,
        techStack: formData.techStack.split(",").map((s) => s.trim()),
        files: uploadedFileRecords,
      });

      setAnalyzing(false);
      setUploadStatus("");
      setShowModal(false);
      setAttachedFiles([]);
      setFileError("");
      setFormData({
        title: "",
        teamName: "NeuralNinjas",
        description: "",
        githubUrl: "",
        demoUrl: "",
        videoUrl: "",
        techStack: "React, Python, FastAPI, TailwindCSS",
      });
      loadSubmissions();
    } catch (err) {
      console.error("Submission failed:", err);
      setAnalyzing(false);
      setUploadStatus("");
    }
  };

  const getFileIcon = (file) => {
    if (file.isPdf || file.originalName?.toLowerCase().endsWith(".pdf") || file.name?.toLowerCase().endsWith(".pdf")) {
      return <FileText size={18} className="text-red-400 shrink-0" />;
    }
    if (file.isZip || file.originalName?.toLowerCase().endsWith(".zip") || file.name?.toLowerCase().endsWith(".zip")) {
      return <FolderArchive size={18} className="text-amber-400 shrink-0" />;
    }
    if (file.isImage || file.originalName?.match(/\.(png|jpg|jpeg|webp)$/i)) {
      return <ImageIcon size={18} className="text-orange-400 shrink-0" />;
    }
    return <Paperclip size={18} className="text-amber-300 shrink-0" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Project Submissions
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Review submitted projects, inspect code repositories, download PDF pitch decks, and view automated AI rubric evaluations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={18} />
          Submit Project
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-6">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="bg-[#120c0b] border border-red-950/80 hover:border-orange-500/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Left Column: Project details */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-xl text-white">{sub.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-950/80 text-orange-300 border border-red-900/40">
                    Team: {sub.teamName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                    {sub.status || "Evaluated"}
                  </span>
                  {sub.files && sub.files.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Paperclip size={12} /> {sub.files.length} File{sub.files.length > 1 ? "s" : ""} Attached
                    </span>
                  )}
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
                  {sub.description}
                </p>

                {/* Tech Stack badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {sub.techStack?.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#1c1211] text-zinc-300 border border-red-950/60 text-xs font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Attached Files & PDFs Deliverables Section */}
                {sub.files && sub.files.length > 0 && (
                  <div className="pt-2">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Attached Documentation & Deliverables (Max 20MB):
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {sub.files.map((file, idx) => {
                        const displayName = file.originalName || file.name || file.filename || "Attached Deliverable";
                        const sizeText = file.sizeFormatted || (file.size ? formatBytes(file.size) : "");
                        const isPdf = file.isPdf || displayName.toLowerCase().endsWith(".pdf");

                        return (
                          <a
                            key={file.id || idx}
                            href={file.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#170e0d] hover:bg-[#1c1211] border border-red-950/80 hover:border-orange-500/40 rounded-xl text-xs font-semibold text-zinc-200 hover:text-orange-400 transition shadow-md group cursor-pointer"
                            title={`Download / View ${displayName} (${sizeText})`}
                          >
                            {getFileIcon(file)}
                            <span className="truncate max-w-[200px]">{displayName}</span>
                            {sizeText && (
                              <span className="text-[10px] text-zinc-500 font-normal">
                                ({sizeText})
                              </span>
                            )}
                            <Download size={13} className="text-zinc-500 group-hover:text-orange-400 shrink-0 ml-0.5" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Links */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-2">
                  {sub.githubUrl && (
                    <a
                      href={sub.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-zinc-300 hover:text-orange-400 transition font-bold"
                    >
                      <GitBranch size={15} /> GitHub Repo
                    </a>
                  )}
                  {sub.demoUrl && (
                    <a
                      href={sub.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-bold hover:underline"
                    >
                      <ExternalLink size={15} /> Live Demo
                    </a>
                  )}
                  {sub.videoUrl && (
                    <a
                      href={sub.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 font-medium"
                    >
                      <Video size={15} /> Video Demo
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: AI Evaluation Scorecard */}
              <div className="w-full lg:w-80 bg-[#170e0d] border border-red-950/80 rounded-2xl p-5 shrink-0">
                <div className="flex items-center justify-between pb-3 border-b border-red-950/60">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-orange-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      AI Evaluation
                    </span>
                  </div>

                  <span className="text-xl font-black text-amber-300 font-heading">
                    {sub.aiScore || 90}/100
                  </span>
                </div>

                {/* Rubrics breakdown */}
                {sub.judgeScores && (
                  <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                    <div className="bg-[#120c0b] p-2.5 rounded-lg border border-red-950/60">
                      <span className="text-[10px] text-zinc-400 block font-medium">Innovation</span>
                      <strong className="text-amber-300">{sub.judgeScores.innovation || "9.0"} / 10</strong>
                    </div>
                    <div className="bg-[#120c0b] p-2.5 rounded-lg border border-red-950/60">
                      <span className="text-[10px] text-zinc-400 block font-medium">Architecture</span>
                      <strong className="text-orange-400">{sub.judgeScores.technicalExecution || "9.0"} / 10</strong>
                    </div>
                    <div className="bg-[#120c0b] p-2.5 rounded-lg border border-red-950/60">
                      <span className="text-[10px] text-zinc-400 block font-medium">UI/UX Design</span>
                      <strong className="text-amber-300">{sub.judgeScores.design || "9.0"} / 10</strong>
                    </div>
                    <div className="bg-[#120c0b] p-2.5 rounded-lg border border-red-950/60">
                      <span className="text-[10px] text-zinc-400 block font-medium">Impact</span>
                      <strong className="text-red-400">{sub.judgeScores.impact || "9.0"} / 10</strong>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-zinc-300 leading-snug mt-2 italic bg-[#120c0b] p-2.5 rounded-lg border border-red-950/60">
                  "{sub.aiFeedback || "Clean modular codebase and functional deliverable."}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* SUBMIT PROJECT MODAL WITH PDF & FILES UPLOAD SECTION (MAX 20MB)       */}
      {/* ==================================================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#120c0b] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-red-900/60 relative max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-red-950/60">
              <div>
                <h3 className="text-xl font-extrabold text-white font-heading">
                  Submit Your Project
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Submit repository links, live demos, and upload project PDFs/files up to 20MB.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full hover:bg-[#1c1211] transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {analyzing ? (
              <div className="py-14 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="font-bold text-white text-base">Running Automated AI Evaluation...</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {uploadStatus || "Parsing uploaded deliverables, repository architecture, and computing multi-factor rubric scores."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Project Title *
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. MedVision AI Diagnostics"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Team Name *
                  </label>
                  <input
                    required
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    placeholder="e.g. NeuralNinjas"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    GitHub Repository URL *
                  </label>
                  <input
                    required
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/your-team/repo"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                      placeholder="https://your-demo.app"
                      className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Video Demo URL
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    placeholder="e.g. React, Node.js, PyTorch, MongoDB"
                    className="w-full px-4 py-2.5 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                {/* ============================================================== */}
                {/* PDF & FILES UPLOAD SECTION (MAX 20MB)                          */}
                {/* ============================================================== */}
                <div className="p-4 bg-[#170e0d] rounded-2xl border border-red-950/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={15} className="text-orange-500" />
                        PDF Documentation & Deliverable Files
                      </span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Attach Pitch Deck (PDF), Architecture diagrams, or Source ZIP.
                      </p>
                    </div>

                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-red-950/80 text-orange-300 border border-orange-500/30">
                      Max 20MB
                    </span>
                  </div>

                  {/* Dropzone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isDragging
                        ? "border-orange-500 bg-red-950/40"
                        : "border-red-900/40 hover:border-orange-500/60 bg-[#120c0b] hover:bg-[#1c1211]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.zip,.tar,.gz,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-10 h-10 rounded-full bg-red-950/60 text-orange-400 border border-red-900/60 flex items-center justify-center mb-2 shadow-sm">
                      <UploadCloud size={20} />
                    </div>

                    <p className="text-xs font-semibold text-zinc-300">
                      <span className="text-orange-400 underline">Click to upload</span> or drag and drop files here
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      PDF, ZIP, PPTX, PNG, JPG • Maximum file size: <strong>20MB</strong>
                    </p>
                  </div>

                  {/* Error Notification if file exceeds 20MB */}
                  {fileError && (
                    <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-300 text-xs font-medium">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{fileError}</span>
                    </div>
                  )}

                  {/* Attached Files List */}
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                        <span>Selected Deliverables ({attachedFiles.length}):</span>
                        <span>Max 20MB / file</span>
                      </div>

                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {attachedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 bg-[#120c0b] border border-red-950/60 rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                              {getFileIcon(file)}
                              <div className="truncate">
                                <span className="font-semibold text-zinc-200 block truncate">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                  {file.sizeFormatted} • {file.isPdf ? "PDF Document" : file.isZip ? "ZIP Archive" : "File"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FileCheck size={11} /> Ready
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(idx);
                                }}
                                className="text-zinc-500 hover:text-red-400 p-1 rounded-md hover:bg-red-950/40 transition cursor-pointer"
                                title="Remove file"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Summary Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Explain the problem solved, tech architecture, and key innovations..."
                    className="w-full px-4 py-2 text-sm bg-[#1c1211] border border-red-900/40 text-zinc-100 placeholder-zinc-500 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-red-950/60">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 border border-orange-400/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} />
                    <span>Submit & Run AI Eval</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
