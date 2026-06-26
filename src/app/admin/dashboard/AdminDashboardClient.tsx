"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  logoutAdmin,
  updateInquiryStatus,
  deleteInquiry,
  addNotice,
  updateNoticeAction,
  deleteNotice,
  addGalleryItemAction,
  deleteGalleryItemAction,
  updateAchievement,
  updateHomepageContentAction,
  updateSettingsAction,
  updateContactAction,
  updateAdmissionsConfigAction,
  addUserAction,
  deleteUserAction,
  resetUserPasswordAction,
  restoreDatabaseAction,
  sendTestNotification,
  addAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  getPopupsAction,
  addPopupAction,
  updatePopupAction,
  deletePopupAction,
} from "../../actions";
import { uploadFileAction, uploadPopupFileAction } from "@/lib/upload";
import {
  Inquiry,
  Notice,
  Achievement,
  GalleryItem,
  HomepageContent,
  SystemSettings,
  AdmissionsConfig,
  SystemContactInfo,
  AuditLog,
  NotificationLog,
  User,
  Popup,
} from "@/lib/db";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Image as ImageIcon,
  FileText,
  Settings,
  UserCog,
  History,
  LogOut,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  ExternalLink,
  PlusCircle,
  MinusCircle,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  Edit2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Layers,
  Copy,
  Eye,
  Trophy,
  X,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Bell,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AdminDashboardClientProps {
  userRole: "owner" | "principal";
  userName: string;
  userUsername: string;
  initialInquiries: Inquiry[];
  initialNotices: Notice[];
  initialAnnouncements: Notice[];
  initialAchievements: Achievement[];
  initialGallery: GalleryItem[];
  initialHomepageContent: HomepageContent;
  initialAnalytics: {
    totalInquiries: number;
    statusCounts: Record<string, number>;
    gradeCounts: Record<string, number>;
    chartData: { name: string; count: number }[];
  };
  initialSettings: SystemSettings;
  initialAdmissionsConfig: AdmissionsConfig;
  initialContactInfo: SystemContactInfo;
  initialLogs: AuditLog[];
  initialNotificationLogs: NotificationLog[];
  initialUsers: User[];
  initialPopups: Popup[];
}

export default function AdminDashboardClient({
  userRole,
  userName,
  userUsername,
  initialInquiries,
  initialNotices,
  initialAnnouncements,
  initialAchievements,
  initialGallery,
  initialHomepageContent,
  initialAnalytics,
  initialSettings,
  initialAdmissionsConfig,
  initialContactInfo,
  initialLogs,
  initialNotificationLogs,
  initialUsers,
  initialPopups,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "inquiries" | "announcements" | "gallery" | "homepage" | "settings" | "users" | "logs" | "popups"
  >("overview");

  // Router for updates
  const router = useRouter();

  // Local collection states
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [popups, setPopups] = useState<Popup[]>(initialPopups);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [announcements, setAnnouncements] = useState<Notice[]>(initialAnnouncements);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(initialHomepageContent);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [admissionsConfig, setAdmissionsConfig] = useState<AdmissionsConfig>(initialAdmissionsConfig);
  const [contactInfo, setContactInfo] = useState<SystemContactInfo>(initialContactInfo);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialLogs);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(initialNotificationLogs);
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Common UI State
  const [loading, setLoading] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const triggerAlert = (text: string, success = true) => {
    setAlertMsg({ success, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4500);
  };

  // ----------------------------------------------------
  // UTILITIES: Compression, CSV export, YouTube parser
  // ----------------------------------------------------
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1600;

          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.75 // 75% quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const exportInquiriesToCSV = () => {
    const headers = [
      "Inquiry ID",
      "Student Name",
      "Parent Name",
      "Email Address",
      "Phone Number",
      "Grade Applied",
      "Query Message",
      "Status",
      "Submission Date",
      "SMS Status",
      "WhatsApp Status",
    ];

    const rows = inquiries.map((inq) => [
      inq.id,
      inq.name,
      inq.parentName || "",
      inq.email,
      inq.phone,
      inq.grade,
      inq.message.replace(/\r?\n/g, " ").replace(/"/g, '""'),
      inq.status,
      inq.createdAt,
      inq.smsStatus || "Pending",
      inq.waStatus || "Pending",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    // Add UTF-8 BOM so Excel decodes it correctly
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bosco_School_Inquiries_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert("CSV export complete with Excel-compatibility formatting.");
  };

  const getYouTubeEmbedUrl = (urlStr: string): string => {
    try {
      const url = new URL(urlStr);
      let videoId = "";
      if (url.hostname === "youtu.be") {
        videoId = url.pathname.slice(1);
      } else if (url.hostname.includes("youtube.com")) {
        videoId = url.searchParams.get("v") || "";
        if (!videoId && url.pathname.startsWith("/embed/")) {
          videoId = url.pathname.split("/")[2];
        }
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return urlStr;
    } catch {
      return urlStr;
    }
  };

  // ----------------------------------------------------
  // TAB 1: LOGOUT
  // ----------------------------------------------------
  const handleLogout = async () => {
    await logoutAdmin();
    router.refresh();
    router.push("/admin");
  };

  // ----------------------------------------------------
  // TAB 2: INQUIRIES CONTROL
  // ----------------------------------------------------
  const [inqSearch, setInqSearch] = useState("");
  const [inqStatusFilter, setInqStatusFilter] = useState("all");

  const handleInqStatusChange = async (id: string, newStatus: Inquiry["status"]) => {
    setLoading(`status-${id}`);
    const res = await updateInquiryStatus(id, newStatus);
    setLoading(null);
    if (res.success && res.inquiry) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      triggerAlert("Inquiry status updated successfully.");
      router.refresh();
    } else {
      triggerAlert("Failed to update status.", false);
    }
  };

  const handleInqDelete = async (id: string) => {
    if (userRole !== "owner") {
      triggerAlert("Unauthorized: Only owners can delete records.", false);
      return;
    }
    if (!confirm("Are you absolutely sure you want to permanently delete this inquiry record?")) return;

    setLoading(`delete-${id}`);
    const res = await deleteInquiry(id);
    setLoading(null);
    if (res.success) {
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      triggerAlert("Inquiry record deleted permanently.");
      router.refresh();
    } else {
      triggerAlert("Failed to delete record.", false);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(inqSearch.toLowerCase()) ||
      inq.parentName?.toLowerCase().includes(inqSearch.toLowerCase()) ||
      inq.phone.includes(inqSearch) ||
      inq.email.toLowerCase().includes(inqSearch.toLowerCase()) ||
      inq.grade.toLowerCase().includes(inqSearch.toLowerCase());
    const matchesFilter = inqStatusFilter === "all" || inq.status === inqStatusFilter;
    return matchesSearch && matchesFilter;
  });

  // ----------------------------------------------------
  // TAB 3: ANNOUNCEMENT/NOTICE CONTROL
  // ----------------------------------------------------
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    type: "general" as Notice["type"],
    isActive: true,
    isPinned: false,
    expiryDate: "",
    pdfUrl: "",
  });
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [noticesMode, setNoticesMode] = useState<"notices" | "announcements">("notices");

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadFileAction(formData);
    setPdfUploading(false);

    if (res.success && res.url) {
      setNoticeForm((prev) => ({ ...prev, pdfUrl: res.url! }));
      triggerAlert("Notice PDF file uploaded successfully.");
    } else {
      triggerAlert(res.error || "Failed to upload PDF.", false);
    }
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      triggerAlert("Title and content are required.", false);
      return;
    }

    setLoading("notice-submit");
    if (editingNoticeId) {
      const isAnn = editingNoticeId.startsWith("ann_");
      if (isAnn) {
        const res = await updateAnnouncementAction(editingNoticeId, noticeForm);
        setLoading(null);
        if (res.success && res.announcement) {
          setAnnouncements((prev) => prev.map((n) => (n.id === editingNoticeId ? res.announcement! : n)));
          triggerAlert("Announcement updated successfully.");
          setEditingNoticeId(null);
          setNoticeForm({
            title: "",
            content: "",
            type: "general",
            isActive: true,
            isPinned: false,
            expiryDate: "",
            pdfUrl: "",
          });
          router.refresh();
        } else {
          triggerAlert(res.error || "Failed to update announcement.", false);
        }
      } else {
        const res = await updateNoticeAction(editingNoticeId, noticeForm);
        setLoading(null);
        if (res.success && res.notice) {
          setNotices((prev) => prev.map((n) => (n.id === editingNoticeId ? res.notice! : n)));
          triggerAlert("Notice updated successfully.");
          setEditingNoticeId(null);
          setNoticeForm({
            title: "",
            content: "",
            type: "general",
            isActive: true,
            isPinned: false,
            expiryDate: "",
            pdfUrl: "",
          });
          router.refresh();
        } else {
          triggerAlert("Failed to update notice.", false);
        }
      }
    } else {
      if (noticesMode === "announcements") {
        const res = await addAnnouncementAction(noticeForm);
        setLoading(null);
        if (res.success && res.announcement) {
          setAnnouncements((prev) => [res.announcement!, ...prev]);
          triggerAlert("New announcement published successfully.");
          setNoticeForm({
            title: "",
            content: "",
            type: "general",
            isActive: true,
            isPinned: false,
            expiryDate: "",
            pdfUrl: "",
          });
          router.refresh();
        } else {
          triggerAlert("Failed to publish announcement.", false);
        }
      } else {
        const res = await addNotice(noticeForm);
        setLoading(null);
        if (res.success && res.notice) {
          setNotices((prev) => [res.notice!, ...prev]);
          triggerAlert("New notice published successfully.");
          setNoticeForm({
            title: "",
            content: "",
            type: "general",
            isActive: true,
            isPinned: false,
            expiryDate: "",
            pdfUrl: "",
          });
          router.refresh();
        } else {
          triggerAlert("Failed to publish notice.", false);
        }
      }
    }
  };

  const startEditNotice = (n: Notice) => {
    setEditingNoticeId(n.id);
    setNoticesMode(n.id.startsWith("ann_") ? "announcements" : "notices");
    setNoticeForm({
      title: n.title,
      content: n.content,
      type: n.type,
      isActive: n.isActive,
      isPinned: n.isPinned || false,
      expiryDate: n.expiryDate || "",
      pdfUrl: n.pdfUrl || "",
    });
  };

  const handleNoticeDelete = async (id: string) => {
    const isAnn = id.startsWith("ann_");
    const label = isAnn ? "announcement" : "notice";
    if (!confirm(`Are you sure you want to delete this ${label}?`)) return;
    setLoading(`notice-del-${id}`);
    const res = isAnn ? await deleteAnnouncementAction(id) : await deleteNotice(id);
    setLoading(null);
    if (res.success) {
      if (isAnn) {
        setAnnouncements((prev) => prev.filter((n) => n.id !== id));
      } else {
        setNotices((prev) => prev.filter((n) => n.id !== id));
      }
      triggerAlert(`${label.charAt(0).toUpperCase() + label.slice(1)} deleted successfully.`);
      router.refresh();
    } else {
      triggerAlert(`Failed to delete ${label}.`, false);
    }
  };

  const toggleNoticeActive = async (n: Notice) => {
    const isAnn = n.id.startsWith("ann_");
    const label = isAnn ? "announcement" : "notice";
    setLoading(`notice-active-${n.id}`);
    
    if (isAnn) {
      const res = await updateAnnouncementAction(n.id, { isActive: !n.isActive });
      setLoading(null);
      if (res.success && res.announcement) {
        setAnnouncements((prev) => prev.map((item) => (item.id === n.id ? res.announcement! : item)));
        triggerAlert(`Announcement ${!n.isActive ? "Activated" : "Deactivated"} successfully.`);
        router.refresh();
      }
    } else {
      const res = await updateNoticeAction(n.id, { isActive: !n.isActive });
      setLoading(null);
      if (res.success && res.notice) {
        setNotices((prev) => prev.map((item) => (item.id === n.id ? res.notice! : item)));
        triggerAlert(`Notice ${!n.isActive ? "Activated" : "Deactivated"} successfully.`);
        router.refresh();
      }
    }
  };

  // ----------------------------------------------------
  // TAB: POPUP CONTROL
  // ----------------------------------------------------
  const [popupForm, setPopupForm] = useState({
    type: "image" as Popup["type"],
    imageUrl: "",
    buttonLink: "",
    heading: "",
    message: "",
    isActive: true,
  });
  const [editingPopupId, setEditingPopupId] = useState<string | null>(null);
  const [isPopupFormOpen, setIsPopupFormOpen] = useState(false);
  const [previewPopup, setPreviewPopup] = useState<Popup | null>(null);
  const [popupUploadLoading, setPopupUploadLoading] = useState<"image" | null>(null);

  const handlePopupFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerAlert("File size exceeds the 5MB limit.", false);
      return;
    }

    setPopupUploadLoading("image");
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadPopupFileAction(formData);
    setPopupUploadLoading(null);

    if (res.success && res.url) {
      setPopupForm((prev) => ({ ...prev, imageUrl: res.url! }));
      triggerAlert("Image uploaded successfully.");
    } else {
      triggerAlert(res.error || "Failed to upload file.", false);
    }
  };

  const handlePopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (popupForm.type === "image" && !popupForm.imageUrl) {
      triggerAlert("Popup image is required.", false);
      return;
    }
    if (popupForm.type === "emergency" && (!popupForm.heading || !popupForm.message)) {
      triggerAlert("Heading and message are required for emergency notices.", false);
      return;
    }

    setLoading("popup-submit");
    if (editingPopupId) {
      const res = await updatePopupAction(editingPopupId, popupForm);
      setLoading(null);
      if (res.success && res.popup) {
        if (res.popup.isActive) {
          setPopups((prev) =>
            prev.map((p) =>
              p.id === editingPopupId ? res.popup! : { ...p, isActive: false }
            )
          );
        } else {
          setPopups((prev) =>
            prev.map((p) => (p.id === editingPopupId ? res.popup! : p))
          );
        }
        triggerAlert("Popup updated successfully.");
        setIsPopupFormOpen(false);
        setEditingPopupId(null);
        resetPopupForm();
        router.refresh();
      } else {
        triggerAlert(res.error || "Failed to update popup.", false);
      }
    } else {
      const res = await addPopupAction(popupForm);
      setLoading(null);
      if (res.success && res.popup) {
        if (res.popup.isActive) {
          setPopups((prev) => [
            res.popup!,
            ...prev.map((p) => ({ ...p, isActive: false })),
          ]);
        } else {
          setPopups((prev) => [res.popup!, ...prev]);
        }
        triggerAlert("Popup created successfully.");
        setIsPopupFormOpen(false);
        resetPopupForm();
        router.refresh();
      } else {
        triggerAlert(res.error || "Failed to create popup.", false);
      }
    }
  };

  const resetPopupForm = () => {
    setPopupForm({
      type: "image",
      imageUrl: "",
      buttonLink: "",
      heading: "",
      message: "",
      isActive: true,
    });
  };

  const handlePopupEdit = (p: Popup) => {
    setEditingPopupId(p.id);
    setPopupForm({
      type: p.type || "image",
      imageUrl: p.imageUrl || "",
      buttonLink: p.buttonLink || "",
      heading: p.heading || "",
      message: p.message || "",
      isActive: p.isActive,
    });
    setIsPopupFormOpen(true);
  };

  const handlePopupDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this popup?")) return;
    setLoading(`delete-popup-${id}`);
    const res = await deletePopupAction(id);
    setLoading(null);
    if (res.success) {
      setPopups((prev) => prev.filter((p) => p.id !== id));
      triggerAlert("Popup deleted successfully.");
      router.refresh();
    } else {
      triggerAlert("Failed to delete popup.", false);
    }
  };

  const handlePopupToggleActive = async (id: string, currentVal: boolean) => {
    setLoading(`toggle-popup-${id}`);
    const res = await updatePopupAction(id, { isActive: !currentVal });
    setLoading(null);
    if (res.success && res.popup) {
      if (res.popup.isActive) {
        setPopups((prev) =>
          prev.map((p) =>
            p.id === id ? res.popup! : { ...p, isActive: false }
          )
        );
      } else {
        setPopups((prev) =>
          prev.map((p) => (p.id === id ? res.popup! : p))
        );
      }
      triggerAlert(`Popup ${!currentVal ? "enabled" : "disabled"} successfully.`);
      router.refresh();
    } else {
      triggerAlert("Failed to toggle status.", false);
    }
  };

  // ----------------------------------------------------
  // TAB 4: GALLERY CONTROL
  // ----------------------------------------------------
  const [galleryCategory, setGalleryCategory] = useState<GalleryItem["category"]>("Campus");
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: "",
    type: "image" as "image" | "video",
    url: "",
    description: "",
  });
  const [imageCompressing, setImageCompressing] = useState(false);

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageCompressing(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await uploadFileAction(formData);
      if (res.success && res.url) {
        setNewGalleryItem((prev) => ({ ...prev, url: res.url! }));
        triggerAlert("Compressed gallery image uploaded.");
      } else {
        triggerAlert(res.error || "Failed to upload image.", false);
      }
    } catch (err) {
      triggerAlert("Image compression error.", false);
    } finally {
      setImageCompressing(false);
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.title || !newGalleryItem.url) {
      triggerAlert("Title and URL or file upload are required.", false);
      return;
    }

    setLoading("gallery-add");
    const itemData = {
      category: galleryCategory,
      title: newGalleryItem.title,
      type: newGalleryItem.type,
      url: newGalleryItem.type === "video" ? getYouTubeEmbedUrl(newGalleryItem.url) : newGalleryItem.url,
      description: newGalleryItem.description,
    };

    const res = await addGalleryItemAction(itemData);
    setLoading(null);
    if (res.success && res.item) {
      setGallery((prev) => [...prev, res.item!]);
      triggerAlert("Gallery item added successfully.");
      setNewGalleryItem({ title: "", type: "image", url: "", description: "" });
      router.refresh();
    } else {
      triggerAlert("Failed to add gallery item.", false);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Delete this gallery item?")) return;
    setLoading(`gallery-del-${id}`);
    const res = await deleteGalleryItemAction(id);
    setLoading(null);
    if (res.success) {
      setGallery((prev) => prev.filter((item) => item.id !== id));
      triggerAlert("Gallery item deleted successfully.");
      router.refresh();
    } else {
      triggerAlert("Failed to delete gallery item.", false);
    }
  };

  // ----------------------------------------------------
  // TAB 5: HOMEPAGE CONTENT CONTROL
  // ----------------------------------------------------
  const [heroForm, setHeroForm] = useState({
    heroTitle: homepageContent.heroTitle,
    heroSubtitle: homepageContent.heroSubtitle,
    heroDescription: homepageContent.heroDescription,
    admissionsBtnText: homepageContent.admissionsBtnText,
  });

  const [directorForm, setDirectorForm] = useState({
    name: homepageContent.directorsMessage.name,
    designation: homepageContent.directorsMessage.designation,
    message: homepageContent.directorsMessage.message,
    signature: homepageContent.directorsMessage.signature,
    photo: homepageContent.directorsMessage.photo,
  });

  const [statsForm, setStatsForm] = useState<Record<string, string>>(
    achievements.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>)
  );

  const handleDirectorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading("director-photo-upload");
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await uploadFileAction(formData);
      if (res.success && res.url) {
        setDirectorForm((prev) => ({ ...prev, photo: res.url! }));
        triggerAlert("Director's compressed photo uploaded.");
      } else {
        triggerAlert(res.error || "Failed to upload photo.", false);
      }
    } catch {
      triggerAlert("Compression failed.", false);
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateHomepageContent = async () => {
    setLoading("homepage-save");
    const updatedContent: HomepageContent = {
      heroTitle: heroForm.heroTitle,
      heroSubtitle: heroForm.heroSubtitle,
      heroDescription: heroForm.heroDescription,
      admissionsBtnText: heroForm.admissionsBtnText,
      directorsMessage: {
        name: directorForm.name,
        designation: directorForm.designation,
        message: directorForm.message,
        signature: directorForm.signature,
        photo: directorForm.photo,
      },
    };

    const res = await updateHomepageContentAction(updatedContent);
    setLoading(null);
    if (res.success && res.content) {
      setHomepageContent(res.content);
      triggerAlert("Homepage hero and Director details updated.");
      router.refresh();
    } else {
      triggerAlert("Failed to update homepage details.", false);
    }
  };

  const handleAchievementUpdateSubmit = async (key: string) => {
    setLoading(`stat-${key}`);
    const res = await updateAchievement(key, statsForm[key]);
    setLoading(null);
    if (res.success && res.achievement) {
      setAchievements((prev) => prev.map((a) => (a.key === key ? res.achievement! : a)));
      triggerAlert("Statistic counter updated successfully.");
      router.refresh();
    } else {
      triggerAlert("Failed to update statistic counter.", false);
    }
  };

  // ----------------------------------------------------
  // TAB 6: SETTINGS (Owner only)
  // ----------------------------------------------------
  const [admissionsForm, setAdmissionsForm] = useState({
    isAdmissionsEnabled: admissionsConfig.isAdmissionsEnabled,
    openDate: admissionsConfig.openDate,
    closeDate: admissionsConfig.closeDate,
    academicYear: admissionsConfig.academicYear || "",
  });

  const [notificationPhone, setNotificationPhone] = useState(settings.smsNotificationPhone);

  const [contactForm, setContactForm] = useState({
    address: contactInfo.address,
    whatsappNumber: contactInfo.whatsappNumber,
    googleMapsLink: contactInfo.googleMapsLink,
    mapEmbedSrc: contactInfo.mapEmbedSrc || "",
    officeTimings: contactInfo.officeTimings,
  });

  const [contactPhones, setContactPhones] = useState<string[]>(contactInfo.phoneNumbers);
  const [contactEmails, setContactEmails] = useState<string[]>(contactInfo.emails);

  const [brandingForm, setBrandingForm] = useState({
    schoolName: settings.schoolName,
    schoolSubName: settings.schoolSubName,
    schoolLogo: settings.schoolLogo,
    faviconUrl: settings.faviconUrl,
    copyrightText: settings.copyrightText,
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    youtubeUrl: settings.youtubeUrl,
  });

  const handleBrandingLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading("logo-upload");
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await uploadFileAction(formData);
      if (res.success && res.url) {
        setBrandingForm((prev) => ({ ...prev, schoolLogo: res.url! }));
        triggerAlert("School Logo uploaded.");
      }
    } catch {
      triggerAlert("Logo compression error.", false);
    } finally {
      setLoading(null);
    }
  };

  const handleBrandingFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading("favicon-upload");
    const formData = new FormData();
    formData.append("file", file); // do not compress favicons
    const res = await uploadFileAction(formData);
    setLoading(null);
    if (res.success && res.url) {
      setBrandingForm((prev) => ({ ...prev, faviconUrl: res.url! }));
      triggerAlert("Favicon uploaded successfully.");
    }
  };

  const handleSaveSystemSettings = async () => {
    setLoading("settings-save");
    // Update Admissions Config
    const admRes = await updateAdmissionsConfigAction({
      isAdmissionsEnabled: admissionsForm.isAdmissionsEnabled,
      openDate: admissionsForm.openDate,
      closeDate: admissionsForm.closeDate,
      academicYear: admissionsForm.academicYear,
    });

    // Update Contact Details
    const contactRes = await updateContactAction({
      address: contactForm.address,
      whatsappNumber: contactForm.whatsappNumber,
      googleMapsLink: contactForm.googleMapsLink,
      mapEmbedSrc: contactForm.mapEmbedSrc,
      officeTimings: contactForm.officeTimings,
      phoneNumbers: contactPhones.filter(Boolean),
      emails: contactEmails.filter(Boolean),
    });

    // Update Branding details
    const brandRes = await updateSettingsAction({
      smsNotificationPhone: notificationPhone,
      schoolName: brandingForm.schoolName,
      schoolSubName: brandingForm.schoolSubName,
      schoolLogo: brandingForm.schoolLogo,
      faviconUrl: brandingForm.faviconUrl,
      copyrightText: brandingForm.copyrightText,
      facebookUrl: brandingForm.facebookUrl,
      instagramUrl: brandingForm.instagramUrl,
      youtubeUrl: brandingForm.youtubeUrl,
    });

    setLoading(null);
    if (admRes.success && contactRes.success && brandRes.success) {
      setAdmissionsConfig(admRes.admissionsConfig!);
      setContactInfo(contactRes.contactInfo!);
      setSettings(brandRes.settings!);
      triggerAlert("All system configuration, contact info, and branding settings saved successfully!");
      router.refresh();
    } else {
      triggerAlert("One or more updates failed. Check inputs.", false);
    }
  };

  const handleTestNotificationSubmit = async () => {
    if (!notificationPhone) {
      triggerAlert("Notification phone number is required.", false);
      return;
    }

    setLoading("test-notification");
    const res = await sendTestNotification(notificationPhone);
    setLoading(null);
    if (res.success) {
      triggerAlert(res.message || "Test notifications dispatched successfully.");
      // Refresh audit logs
      router.refresh();
    } else {
      triggerAlert(res.error || "Failed to dispatch test notification.", false);
    }
  };

  // Backup & Restore
  const backupDatabase = () => {
    // We construct a backup by creating a copy of the database values
    const backupData = {
      inquiries,
      notices,
      achievements,
      settings,
      contactInfo,
      homepageContent,
      admissionsConfig,
      gallery,
    };
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bosco_School_CMS_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert("Database backup JSON downloaded successfully.");
  };

  const handleRestoreBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Are you sure you want to completely restore the database? This will overwrite all current settings.")) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      setLoading("db-restore");
      const res = await restoreDatabaseAction(content);
      setLoading(null);
      if (res.success) {
        triggerAlert("Database restored successfully! Reloading page...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        triggerAlert(res.error || "Failed to restore database backup file.", false);
      }
    };
    reader.readAsText(file);
  };

  // ----------------------------------------------------
  // TAB 7: USERS MANAGEMENT (Owner only)
  // ----------------------------------------------------
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"owner" | "principal">("principal");
  const [newUserPass, setNewUserPass] = useState("");

  const [resetUserSel, setResetUserSel] = useState("principal");
  const [resetUserPass, setResetUserPass] = useState("");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newName || !newUserPass) {
      triggerAlert("Please fill out all user fields.", false);
      return;
    }

    setLoading("user-create");
    const res = await addUserAction(newUsername, newName, newUserRole, newUserPass);
    setLoading(null);
    if (res.success) {
      triggerAlert("User created successfully!");
      setNewUsername("");
      setNewName("");
      setNewUserPass("");
      // Update list
      window.location.reload();
    } else {
      triggerAlert(res.error || "Failed to create user.", false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserPass || resetUserPass.length < 4) {
      triggerAlert("Password must be at least 4 characters.", false);
      return;
    }

    setLoading("user-reset");
    const res = await resetUserPasswordAction(resetUserSel, resetUserPass);
    setLoading(null);
    if (res.success) {
      triggerAlert(`Passcode for ${resetUserSel} reset successfully!`);
      setResetUserPass("");
    } else {
      triggerAlert(res.error || "Failed to reset password.", false);
    }
  };

  // ----------------------------------------------------
  // TAB 8: AUDIT LOGS SEARCH (Owner only)
  // ----------------------------------------------------
  const [logSearch, setLogSearch] = useState("");
  const filteredLogs = auditLogs.filter(
    (log) =>
      log.username.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.role.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase())
  );

  // ----------------------------------------------------
  // CHART DATA & ANALYTICS PREPARATION
  // ----------------------------------------------------
  const COLORS = ["#d4af37", "#f2ba4d", "#f7d584", "#b8912a", "#573f17"];
  const pieData = Object.entries(initialAnalytics.gradeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const activeNoticeCount = notices.filter(n => n.isActive).length;
  const pendingInquiryCount = inquiries.filter(i => i.status === "Pending").length;

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-navy-900 flex flex-col md:flex-row">
      
      {/* Sidebar (Left royal blue sidebar) */}
      <aside className="w-full md:w-64 bg-navy-950 border-b md:border-b-0 md:border-r border-navy-900/10 flex flex-col justify-between shrink-0 p-6 text-white font-sans">
        <div>
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
            <div className="w-9 h-9 rounded-full border border-gold-500/30 bg-gold-500/10 flex items-center justify-center overflow-hidden">
              <img src={settings.schoolLogo} alt="School Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-black text-xs uppercase tracking-widest text-gold-500 truncate max-w-[150px]">
                {settings.schoolName}
              </span>
              <span className="text-[9px] uppercase text-white/40 tracking-wider font-semibold">
                User: {userName} ({userRole === "owner" ? "Owner" : "Principal"})
              </span>
            </div>
          </div>

          <nav className="space-y-1.5 text-left">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all ${
                activeTab === "inquiries"
                  ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Users size={16} />
              Inquiries
              {pendingInquiryCount > 0 && (
                <span className="ml-auto bg-brand-red-700 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {pendingInquiryCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all ${
                activeTab === "announcements"
                  ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Megaphone size={16} />
              Announcements
            </button>

            <button
              onClick={() => setActiveTab("popups")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all ${
                activeTab === "popups"
                  ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Layers size={16} />
              Popup Manager
            </button>

            <button
              onClick={() => setActiveTab("gallery")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all ${
                activeTab === "gallery"
                  ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <ImageIcon size={16} />
              Gallery
            </button>

            <button
              onClick={() => setActiveTab("homepage")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all ${
                activeTab === "homepage"
                  ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <FileText size={16} />
              Homepage
            </button>

            {userRole === "owner" && (
              <>
                <div className="h-px bg-white/5 my-4" />

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all ${
                    activeTab === "settings"
                      ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Settings size={16} />
                  Settings
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all ${
                    activeTab === "users"
                      ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <UserCog size={16} />
                  Users
                </button>

                <button
                  onClick={() => setActiveTab("logs")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold transition-all ${
                    activeTab === "logs"
                      ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <History size={16} />
                  Audit Logs
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 mt-8 md:mt-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-red-800/10 border border-brand-red-800/20 hover:bg-brand-red-700 hover:text-white text-brand-red-400 font-bold uppercase tracking-wider text-xs rounded-xl transition-all duration-300"
          >
            <LogOut size={14} />
            Logout Securely
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 text-left font-sans">
        
        {/* Floating Action/Alert Banners */}
        {alertMsg && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border transition-all ${
              alertMsg.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {alertMsg.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs sm:text-sm font-semibold">{alertMsg.text}</span>
          </div>
        )}

        {/* Dynamic Headers */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif font-black text-2xl md:text-3xl text-navy-900 uppercase tracking-tight">
              School CMS Portal
            </h1>
            <p className="text-navy-900/40 text-xs font-semibold uppercase tracking-wider mt-1">
              Currently Managing: {activeTab} • Active Session: {userName} ({userRole})
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
              admissionsConfig.isAdmissionsEnabled
                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                : "bg-red-500/10 text-red-700 border border-red-500/20"
            }`}>
              Admissions: {admissionsConfig.isAdmissionsEnabled ? "Active & Open" : "Closed"}
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------
            TAB SECTION: OVERVIEW
            ---------------------------------------------------- */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold text-navy-900/40 uppercase tracking-widest">
                  Total Leads
                </span>
                <span className="font-serif font-black text-3xl md:text-4xl text-navy-900 mt-2">
                  {inquiries.length}
                </span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold text-navy-900/40 uppercase tracking-widest">
                  Pending Review
                </span>
                <span className="font-serif font-black text-3xl md:text-4xl text-brand-red-700 mt-2">
                  {pendingInquiryCount}
                </span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold text-navy-900/40 uppercase tracking-widest">
                  Notices Live
                </span>
                <span className="font-serif font-black text-3xl md:text-4xl text-navy-900 mt-2">
                  {activeNoticeCount}
                </span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold text-navy-900/40 uppercase tracking-widest">
                  Gallery Size
                </span>
                <span className="font-serif font-black text-3xl md:text-4xl text-gold-600 mt-2">
                  {gallery.length}
                </span>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-8">
                <h3 className="text-xs uppercase tracking-widest font-extrabold text-navy-900/50 mb-6">
                  Inquiry Volume Over Time
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={initialAnalytics.chartData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-4">
                <h3 className="text-xs uppercase tracking-widest font-extrabold text-navy-900/50 mb-6">
                  Grade Breakdown
                </h3>
                <div className="h-[250px] w-full flex items-center justify-center">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-navy-900/30 font-semibold">No Grade Data Recorded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB SECTION: INQUIRIES
            ---------------------------------------------------- */}
        {activeTab === "inquiries" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            
            {/* Filters panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={inqSearch}
                  onChange={(e) => setInqSearch(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-gold-500 w-full sm:w-64"
                />

                <select
                  value={inqStatusFilter}
                  onChange={(e) => setInqStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Admitted">Admitted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={exportInquiriesToCSV}
                className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-2 transition-all"
              >
                <Download size={14} />
                Export CSV (Excel Compatible)
              </button>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-navy-900/50 font-extrabold bg-slate-50/50">
                    <th className="py-4 px-4">Student & Parent</th>
                    <th className="py-4 px-4">Contact Info</th>
                    <th className="py-4 px-4">Grade</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Delivery Logs</th>
                    <th className="py-4 px-4">Status Action</th>
                    <th className="py-4 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 font-light">
                          <div className="font-semibold text-navy-900">{inq.name}</div>
                          {inq.parentName && <div className="text-[10px] text-navy-900/40 font-semibold mt-0.5">Parent: {inq.parentName}</div>}
                          {inq.message && (
                            <div className="mt-1 text-[11px] text-navy-900/50 max-w-xs italic line-clamp-2" title={inq.message}>
                              "{inq.message}"
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-navy-900/60 leading-relaxed font-light">
                          <div>{inq.phone}</div>
                          <div>{inq.email}</div>
                        </td>
                        <td className="py-4 px-4 font-bold text-gold-600">{inq.grade}</td>
                        <td className="py-4 px-4 text-navy-900/40 text-[11px] font-semibold">
                          {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-4 leading-relaxed text-[10px] font-bold">
                          <div className="flex items-center gap-1.5">
                            <span>SMS:</span>
                            <span className={inq.smsStatus === "success" ? "text-emerald-600" : "text-red-500"}>
                              {inq.smsStatus === "success" ? "Sent" : inq.smsError ? "Failed" : "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>WA:</span>
                            <span className={inq.waStatus === "success" ? "text-emerald-600" : "text-red-500"}>
                              {inq.waStatus === "success" ? "Sent" : inq.waError ? "Failed" : "Pending"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={inq.status}
                            disabled={loading === `status-${inq.id}`}
                            onChange={(e) => handleInqStatusChange(inq.id, e.target.value as Inquiry["status"])}
                            className="px-2 py-1.5 bg-slate-50 border border-navy-900/10 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Admitted">Admitted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {userRole === "owner" ? (
                            <button
                              onClick={() => handleInqDelete(inq.id)}
                              disabled={loading === `delete-${inq.id}`}
                              className="text-red-600 hover:text-red-800 disabled:opacity-30 transition-colors p-1"
                              title="Delete Record"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <span className="text-[10px] text-navy-900/20 font-bold uppercase tracking-wider">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-navy-900/30 font-semibold italic">
                        No inquiries matches search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB SECTION: ANNOUNCEMENTS
            ---------------------------------------------------- */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            {/* Premium Toggler for Notices vs Announcements */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                  School Bulletins
                </h3>
                <p className="text-xs text-navy-900/60 font-medium mt-0.5">
                  Manage official notices and community announcements published on the website.
                </p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => {
                    setNoticesMode("notices");
                    setEditingNoticeId(null);
                    setNoticeForm({
                      title: "",
                      content: "",
                      type: "general",
                      isActive: true,
                      isPinned: false,
                      expiryDate: "",
                      pdfUrl: "",
                    });
                  }}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs uppercase tracking-wider font-bold transition-all ${
                    noticesMode === "notices"
                      ? "bg-white text-navy-900 shadow-sm"
                      : "text-navy-900/50 hover:text-navy-900"
                  }`}
                >
                  Manage Notices ({notices.length})
                </button>
                <button
                  onClick={() => {
                    setNoticesMode("announcements");
                    setEditingNoticeId(null);
                    setNoticeForm({
                      title: "",
                      content: "",
                      type: "general",
                      isActive: true,
                      isPinned: false,
                      expiryDate: "",
                      pdfUrl: "",
                    });
                  }}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs uppercase tracking-wider font-bold transition-all ${
                    noticesMode === "announcements"
                      ? "bg-white text-navy-900 shadow-sm"
                      : "text-navy-900/50 hover:text-navy-900"
                  }`}
                >
                  Manage Announcements ({announcements.length})
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Column */}
              <form onSubmit={handleNoticeSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 lg:col-span-5">
                <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                  {editingNoticeId 
                    ? (noticesMode === "announcements" ? "Edit Announcement" : "Edit Notice") 
                    : (noticesMode === "announcements" ? "Create Announcement" : "Create Notice")}
                </h3>
                
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">
                    {noticesMode === "announcements" ? "Announcement Title" : "Notice Title"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={noticesMode === "announcements" ? "e.g. Annual Sports Meet Schedule" : "e.g. Board Registration Fee Last Date"}
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-gold-500 w-full font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Content Detail</label>
                  <textarea
                    required
                    rows={4}
                    placeholder={noticesMode === "announcements" ? "Type the announcement detail here..." : "Type the notice detail here..."}
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm((prev) => ({ ...prev, content: e.target.value }))}
                    className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-gold-500 w-full font-light"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Category</label>
                    <select
                      value={noticeForm.type}
                      onChange={(e) => setNoticeForm((prev) => ({ ...prev, type: e.target.value as Notice["type"] }))}
                      className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="general">General Info</option>
                      <option value="academic">Academic Notices</option>
                      <option value="event">Campus Events</option>
                      <option value="admission">Admissions Info</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Expiry Date</label>
                    <input
                      type="date"
                      value={noticeForm.expiryDate}
                      onChange={(e) => setNoticeForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                      className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Upload PDF Attachment */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">PDF Attachment (Optional)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      id="notice-pdf-input"
                    />
                    <label
                      htmlFor="notice-pdf-input"
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-navy-900/10 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer inline-flex items-center gap-2"
                    >
                      {pdfUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Choose PDF
                    </label>
                    {noticeForm.pdfUrl && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check size={12} /> PDF Attached
                        </span>
                        <button
                          type="button"
                          onClick={() => setNoticeForm((prev) => ({ ...prev, pdfUrl: "" }))}
                          className="text-[10px] text-brand-red-700 hover:text-brand-red-800 font-extrabold uppercase tracking-wider underline cursor-pointer"
                          title="Remove attached PDF"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  {noticeForm.pdfUrl && (
                    <div className="text-[10px] text-slate-500 truncate max-w-xs mt-1 font-mono">
                      {noticeForm.pdfUrl}
                    </div>
                  )}
                </div>

                {/* Pin & Active Flags */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={noticeForm.isPinned}
                      onChange={(e) => setNoticeForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
                      className="rounded text-gold-500 focus:ring-gold-500"
                    />
                    Pin {noticesMode === "announcements" ? "Announcement" : "Notice"}
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={noticeForm.isActive}
                      onChange={(e) => setNoticeForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded text-gold-500 focus:ring-gold-500"
                    />
                    Publish Instantly
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading === "notice-submit"}
                    className="flex-1 py-3 bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {loading === "notice-submit" && <Loader2 size={12} className="animate-spin" />}
                    {editingNoticeId 
                      ? (noticesMode === "announcements" ? "Update Announcement" : "Update Notice") 
                      : (noticesMode === "announcements" ? "Publish Announcement" : "Publish Notice")}
                  </button>
                  {editingNoticeId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoticeId(null);
                        setNoticeForm({
                          title: "",
                          content: "",
                          type: "general",
                          isActive: true,
                          isPinned: false,
                          expiryDate: "",
                          pdfUrl: "",
                        });
                      }}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-navy-900 font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* List Column */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 lg:col-span-7">
                <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                  Live {noticesMode === "announcements" ? "Announcements" : "Notices"} ({noticesMode === "announcements" ? announcements.length : notices.length})
                </h3>
                
                <div className="space-y-4">
                  {(noticesMode === "announcements" ? announcements : notices).map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-xl border transition-all ${
                        n.isPinned
                          ? "border-gold-500/30 bg-gold-500/[0.02]"
                          : "border-slate-100 bg-slate-50/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 text-navy-900/60`}>
                              {n.type}
                            </span>
                            {n.isPinned && (
                              <span className="bg-gold-500/10 text-gold-700 text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-widest">
                                Pinned
                              </span>
                            )}
                            {!n.isActive && (
                              <span className="bg-red-500/10 text-red-700 text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-widest">
                                Inactive
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-sm text-navy-900 mt-2 tracking-wide leading-relaxed">
                            {n.title}
                          </h4>
                          <p className="text-xs text-navy-900/70 leading-relaxed mt-1 font-normal">
                            {n.content}
                          </p>
                          {n.pdfUrl && (
                            <a
                              href={n.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] text-brand-red-700 hover:text-brand-red-800 font-bold uppercase tracking-wider mt-3"
                            >
                              <ExternalLink size={10} />
                              View PDF Attachment
                            </a>
                          )}
                          {n.expiryDate && (
                            <div className="text-[10px] text-navy-900/30 font-semibold mt-2">
                              Expires: {n.expiryDate}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleNoticeActive(n)}
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
                              n.isActive
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-slate-100 text-navy-900/40 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {n.isActive ? "Hide" : "Publish"}
                          </button>
                          <button
                            onClick={() => startEditNotice(n)}
                            className="text-navy-900/50 hover:text-navy-900 p-1"
                            title={noticesMode === "announcements" ? "Edit Announcement" : "Edit Notice"}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleNoticeDelete(n.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title={noticesMode === "announcements" ? "Delete Announcement" : "Delete Notice"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(noticesMode === "announcements" ? announcements : notices).length === 0 && (
                    <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2">
                      <Megaphone className="text-slate-400" size={24} />
                      <p className="text-xs font-bold uppercase tracking-wider">No {noticesMode === "announcements" ? "announcements" : "notices"} found</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB SECTION: GALLERY
            ---------------------------------------------------- */}
        {activeTab === "gallery" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Config */}
              <form onSubmit={handleAddGalleryItem} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 lg:col-span-5">
                <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                  Add Gallery Item
                </h3>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Album Category</label>
                  <select
                    value={galleryCategory}
                    onChange={(e) => setGalleryCategory(e.target.value as GalleryItem["category"])}
                    className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="Campus">Campus & Infrastructure</option>
                    <option value="Classrooms">Classrooms & Labs</option>
                    <option value="Events">Annual Events & Celebrations</option>
                    <option value="Sports">Sports Meet & Activities</option>
                    <option value="Students">Student Achievements</option>
                    <option value="Activities">Extra-Curricular Clubs</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Content Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="galleryType"
                        checked={newGalleryItem.type === "image"}
                        onChange={() => setNewGalleryItem((prev) => ({ ...prev, type: "image", url: "" }))}
                        className="text-gold-500 focus:ring-gold-500"
                      />
                      Photo Image
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="galleryType"
                        checked={newGalleryItem.type === "video"}
                        onChange={() => setNewGalleryItem((prev) => ({ ...prev, type: "video", url: "" }))}
                        className="text-gold-500 focus:ring-gold-500"
                      />
                      YouTube Video
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Exhibition Labs"
                    value={newGalleryItem.title}
                    onChange={(e) => setNewGalleryItem((prev) => ({ ...prev, title: e.target.value }))}
                    className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full"
                  />
                </div>

                {newGalleryItem.type === "image" ? (
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Upload Local Image (Compressed)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryImageUpload}
                        className="hidden"
                        id="gallery-file-input"
                      />
                      <label
                        htmlFor="gallery-file-input"
                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-navy-900/10 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer inline-flex items-center gap-2"
                      >
                        {imageCompressing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        Select & Compress
                      </label>
                      {newGalleryItem.url && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check size={12} /> Ready
                        </span>
                      )}
                    </div>
                    {newGalleryItem.url && (
                      <div className="text-[10px] text-navy-900/40 truncate max-w-xs mt-1">
                        URL: {newGalleryItem.url}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">YouTube Video URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newGalleryItem.url}
                      onChange={(e) => setNewGalleryItem((prev) => ({ ...prev, url: e.target.value }))}
                      className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Description</label>
                  <input
                    type="text"
                    placeholder="Short detail caption..."
                    value={newGalleryItem.description}
                    onChange={(e) => setNewGalleryItem((prev) => ({ ...prev, description: e.target.value }))}
                    className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading === "gallery-add" || imageCompressing}
                  className="w-full py-3 bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading === "gallery-add" && <Loader2 size={12} className="animate-spin" />}
                  Add Gallery Item
                </button>
              </form>

              {/* Grid Column */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                    Album Assets ({gallery.length})
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {gallery.map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col justify-between">
                      {item.type === "image" ? (
                        <div className="h-32 bg-slate-200 overflow-hidden relative">
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-32 bg-navy-900 flex items-center justify-center relative text-white text-[10px] uppercase tracking-widest font-bold">
                          YouTube Video Frame
                        </div>
                      )}
                      
                      <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-extrabold uppercase text-gold-600 bg-gold-500/5 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-navy-900/40 font-semibold">{item.type}</span>
                          </div>
                          <h4 className="text-xs font-bold text-navy-900 mt-2 truncate">{item.title}</h4>
                          <p className="text-[10px] text-navy-900/50 line-clamp-2 leading-relaxed mt-0.5 font-light">{item.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                          <span className="text-[9px] font-mono text-navy-900/30 truncate max-w-[120px]">{item.url}</span>
                          <button
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB SECTION: HOMEPAGE CONTENT
            ---------------------------------------------------- */}
        {activeTab === "homepage" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Hero & Message Panels */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Hero Config Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                  <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                    Landing Page Hero Section
                  </h3>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Hero Title (Primary school name)</label>
                    <input
                      type="text"
                      value={heroForm.heroTitle}
                      onChange={(e) => setHeroForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                      className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Hero Sub-title</label>
                    <input
                      type="text"
                      value={heroForm.heroSubtitle}
                      onChange={(e) => setHeroForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                      className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Hero Description Quote</label>
                      <input
                        type="text"
                        value={heroForm.heroDescription}
                        onChange={(e) => setHeroForm((prev) => ({ ...prev, heroDescription: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full font-light"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Admissions Button Label</label>
                      <input
                        type="text"
                        value={heroForm.admissionsBtnText}
                        onChange={(e) => setHeroForm((prev) => ({ ...prev, admissionsBtnText: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Director's message Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                  <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                    Principal & Director message Settings
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Director Name</label>
                      <input
                        type="text"
                        value={directorForm.name}
                        onChange={(e) => setDirectorForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Designation</label>
                      <input
                        type="text"
                        value={directorForm.designation}
                        onChange={(e) => setDirectorForm((prev) => ({ ...prev, designation: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">
                      Message Body (Use double enters to create separate paragraphs)
                    </label>
                    <textarea
                      rows={8}
                      value={directorForm.message}
                      onChange={(e) => setDirectorForm((prev) => ({ ...prev, message: e.target.value }))}
                      className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full leading-relaxed font-light"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Signature Text</label>
                      <input
                        type="text"
                        value={directorForm.signature}
                        onChange={(e) => setDirectorForm((prev) => ({ ...prev, signature: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none w-full font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Director Photo (Compressed)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDirectorPhotoUpload}
                          className="hidden"
                          id="director-photo-input"
                        />
                        <label
                          htmlFor="director-photo-input"
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-navy-900/10 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer inline-flex items-center gap-2"
                        >
                          <Upload size={12} />
                          Upload & Compress Photo
                        </label>
                        {directorForm.photo && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check size={12} /> Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {directorForm.photo && (
                    <div className="text-[10px] text-navy-900/40 truncate max-w-xs text-left">
                      Photo Path: {directorForm.photo}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleUpdateHomepageContent}
                      disabled={loading === "homepage-save"}
                      className="px-6 py-3 bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      {loading === "homepage-save" && <Loader2 size={12} className="animate-spin" />}
                      Save Homepage details
                    </button>
                  </div>
                </div>

              </div>

              {/* Achievements Column */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-left">
                <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                  School Statistics Counters
                </h3>
                
                <div className="space-y-5">
                  {achievements.map((ach) => (
                    <div key={ach.key} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-3">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-navy-900/40">
                        {ach.label} ({ach.key})
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={statsForm[ach.key] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStatsForm((prev) => ({ ...prev, [ach.key]: val }));
                          }}
                          className="px-3 py-1.5 bg-white border border-navy-900/10 rounded-lg text-xs font-bold flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleAchievementUpdateSubmit(ach.key)}
                          disabled={loading === `stat-${ach.key}`}
                          className="px-3 py-1.5 bg-navy-900 text-white hover:bg-navy-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          {loading === `stat-${ach.key}` && <Loader2 size={10} className="animate-spin" />}
                          Update
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB SECTION: SETTINGS (Owner only)
            ---------------------------------------------------- */}
        {activeTab === "settings" && userRole === "owner" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Config Columns */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Admissions Toggle Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                  <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                    Admissions Configuration
                  </h3>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setAdmissionsForm((prev) => ({
                          ...prev,
                          isAdmissionsEnabled: !prev.isAdmissionsEnabled,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        admissionsForm.isAdmissionsEnabled ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          admissionsForm.isAdmissionsEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                      Admissions {admissionsForm.isAdmissionsEnabled ? "Enabled & Open" : "Closed"}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Open Date</label>
                      <input
                        type="date"
                        value={admissionsForm.openDate}
                        onChange={(e) => setAdmissionsForm((prev) => ({ ...prev, openDate: e.target.value }))}
                        className="px-4 py-2 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Close Date</label>
                      <input
                        type="date"
                        value={admissionsForm.closeDate}
                        onChange={(e) => setAdmissionsForm((prev) => ({ ...prev, closeDate: e.target.value }))}
                        className="px-4 py-2 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Enrollment Session / Academic Year (e.g. 2026-27)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-27"
                      value={admissionsForm.academicYear}
                      onChange={(e) => setAdmissionsForm((prev) => ({ ...prev, academicYear: e.target.value }))}
                      className="px-4 py-2 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Notifications credentials phone config */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                  <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                    Admissions SMS & WhatsApp Notifications
                  </h3>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">
                      Notification Phone Number (E.164 format, e.g. +91XXXXXXXXXX)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="+91 8738882912"
                        value={notificationPhone}
                        onChange={(e) => setNotificationPhone(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none flex-1 font-bold font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleTestNotificationSubmit}
                        disabled={loading === "test-notification"}
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-1.5"
                      >
                        {loading === "test-notification" && <Loader2 size={12} className="animate-spin" />}
                        Send Test Notification
                      </button>
                    </div>
                    <p className="text-[10px] text-navy-900/40 leading-relaxed font-semibold mt-1">
                      This number receives instant notifications when inquiries are submitted online. Both SMS & WhatsApp alerts will be dispatched.
                    </p>
                  </div>
                </div>

                {/* Quick Edit Branding Config */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                  <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                    Branding & Logo Quick Edit
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">School Name</label>
                      <input
                        type="text"
                        value={brandingForm.schoolName}
                        onChange={(e) => setBrandingForm((prev) => ({ ...prev, schoolName: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">School Sub-name</label>
                      <input
                        type="text"
                        value={brandingForm.schoolSubName}
                        onChange={(e) => setBrandingForm((prev) => ({ ...prev, schoolSubName: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Logo Upload (Compressed)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBrandingLogoUpload}
                          className="hidden"
                          id="school-logo-input"
                        />
                        <label
                          htmlFor="school-logo-input"
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-navy-900/10 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer inline-flex items-center gap-2"
                        >
                          <Upload size={12} /> Logo Upload
                        </label>
                        {brandingForm.schoolLogo && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check size={12} /> Ready
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Favicon File Upload</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept=".ico,image/png"
                          onChange={handleBrandingFaviconUpload}
                          className="hidden"
                          id="school-favicon-input"
                        />
                        <label
                          htmlFor="school-favicon-input"
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-navy-900/10 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer inline-flex items-center gap-2"
                        >
                          <Upload size={12} /> Favicon Upload
                        </label>
                        {brandingForm.faviconUrl && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check size={12} /> Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Facebook Link</label>
                      <input
                        type="text"
                        value={brandingForm.facebookUrl}
                        onChange={(e) => setBrandingForm((prev) => ({ ...prev, facebookUrl: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Instagram Link</label>
                      <input
                        type="text"
                        value={brandingForm.instagramUrl}
                        onChange={(e) => setBrandingForm((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">YouTube Link</label>
                      <input
                        type="text"
                        value={brandingForm.youtubeUrl}
                        onChange={(e) => setBrandingForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Footer Copyright Text</label>
                    <input
                      type="text"
                      value={brandingForm.copyrightText}
                      onChange={(e) => setBrandingForm((prev) => ({ ...prev, copyrightText: e.target.value }))}
                      className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Save settings CTA */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveSystemSettings}
                    disabled={loading === "settings-save"}
                    className="px-6 py-3 bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md flex items-center gap-2"
                  >
                    {loading === "settings-save" && <Loader2 size={12} className="animate-spin" />}
                    Save All Configurations
                  </button>
                </div>

              </div>

              {/* Side Cards: Contact Info & Backup/Restore */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Contact Settings Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 text-left">
                  <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                    Contact Details
                  </h3>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Campus Address</label>
                    <textarea
                      rows={3}
                      value={contactForm.address}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, address: e.target.value }))}
                      className="px-3 py-2 bg-slate-50 border border-navy-900/10 rounded-lg text-xs leading-relaxed font-light"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">WhatsApp Helpline</label>
                    <input
                      type="text"
                      value={contactForm.whatsappNumber}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                      className="px-3 py-1.5 bg-slate-50 border border-navy-900/10 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Google Maps Coordinates Link</label>
                    <input
                      type="text"
                      value={contactForm.googleMapsLink}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, googleMapsLink: e.target.value }))}
                      className="px-3 py-1.5 bg-slate-50 border border-navy-900/10 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Google Maps Embed URL</label>
                    <input
                      type="text"
                      value={contactForm.mapEmbedSrc}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, mapEmbedSrc: e.target.value }))}
                      className="px-3 py-1.5 bg-slate-50 border border-navy-900/10 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Office Timings</label>
                    <textarea
                      rows={2}
                      value={contactForm.officeTimings}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, officeTimings: e.target.value }))}
                      className="px-3 py-2 bg-slate-50 border border-navy-900/10 rounded-lg text-xs font-light"
                    />
                  </div>

                  {/* Multi-line Helpline lists */}
                  <div className="space-y-3 pt-2">
                    <div className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold flex items-center justify-between">
                      <span>Phone Helplines</span>
                      <button
                        type="button"
                        onClick={() => setContactPhones((prev) => [...prev, ""])}
                        className="text-gold-600 hover:text-gold-700"
                      >
                        <PlusCircle size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {contactPhones.map((phone, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setContactPhones((prev) => prev.map((p, i) => (i === idx ? val : p)));
                            }}
                            className="px-2 py-1 bg-slate-50 border border-navy-900/10 rounded text-xs flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => setContactPhones((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MinusCircle size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold flex items-center justify-between">
                      <span>Email Addresses</span>
                      <button
                        type="button"
                        onClick={() => setContactEmails((prev) => [...prev, ""])}
                        className="text-gold-600 hover:text-gold-700"
                      >
                        <PlusCircle size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {contactEmails.map((email, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={email}
                            onChange={(e) => {
                              const val = e.target.value;
                              setContactEmails((prev) => prev.map((em, i) => (i === idx ? val : em)));
                            }}
                            className="px-2 py-1 bg-slate-50 border border-navy-900/10 rounded text-xs flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => setContactEmails((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MinusCircle size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Backup & Restore database state JSON */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                  <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                    Backup & Restore
                  </h3>

                  <button
                    onClick={backupDatabase}
                    className="w-full py-2.5 bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={14} />
                    Download JSON Backup
                  </button>

                  <div className="h-px bg-slate-100 my-2" />

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold block">Restore Backup (.json)</label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreBackupFile}
                      className="hidden"
                      id="db-restore-input"
                    />
                    <label
                      htmlFor="db-restore-input"
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-navy-900/10 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer inline-flex items-center justify-center gap-2 text-navy-900"
                    >
                      <Upload size={14} />
                      Upload JSON Backup
                    </label>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB SECTION: USERS (Owner only)
            ---------------------------------------------------- */}
        {activeTab === "users" && userRole === "owner" && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Create user Form */}
            <form onSubmit={handleCreateUser} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 lg:col-span-4">
              <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                Create User Account
              </h3>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. principal_new"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Role Privilege</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as "owner" | "principal")}
                  className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none cursor-pointer"
                >
                  <option value="principal">School Principal (Admin)</option>
                  <option value="owner">School Owner (Super Admin)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Account Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading === "user-create"}
                className="w-full py-3 bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading === "user-create" && <Loader2 size={12} className="animate-spin" />}
                Create User
              </button>
            </form>

            {/* User List Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 lg:col-span-5 text-left">
              <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                Active System Users
              </h3>

              <div className="divide-y divide-slate-100">
                {users.map((user) => (
                  <div key={user.username} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-navy-900 text-sm">{user.name}</div>
                      <div className="text-[10px] text-navy-900/40 font-semibold uppercase tracking-wider mt-0.5">
                        Username: {user.username} • Role: {user.role}
                      </div>
                    </div>
                    {user.username !== userUsername && user.username !== "admin" && (
                      <button
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to delete user ${user.username}?`)) return;
                          setLoading(`del-${user.username}`);
                          const res = await deleteUserAction(user.username);
                          setLoading(null);
                          if (res.success) {
                            triggerAlert(`User ${user.username} deleted.`);
                            window.location.reload();
                          } else {
                            triggerAlert(res.error || "Failed to delete user.", false);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete User"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reset password Panel */}
            <form onSubmit={handleResetPassword} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 lg:col-span-3 text-left">
              <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                Reset User passcode
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Select Account</label>
                <select
                  value={resetUserSel}
                  onChange={(e) => setResetUserSel(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-navy-900/10 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.name} ({u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">New Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 4 chars"
                  value={resetUserPass}
                  onChange={(e) => setResetUserPass(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-navy-900/10 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading === "user-reset"}
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-950 text-white font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                {loading === "user-reset" && <Loader2 size={12} className="animate-spin" />}
                Reset passcode
              </button>
            </form>

          </div>
        )}

        {/* ----------------------------------------------------
            TAB SECTION: AUDIT LOGS
            ---------------------------------------------------- */}
        {activeTab === "logs" && userRole === "owner" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Search audit trail logs..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-gold-500 w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto text-left">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-navy-900/50 font-extrabold bg-slate-50/50">
                    <th className="py-4 px-4">Timestamp</th>
                    <th className="py-4 px-4">Operator</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4">Action</th>
                    <th className="py-4 px-4">Details Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-light">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-navy-900/40 text-[11px] font-semibold">
                          {new Date(log.timestamp).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-navy-900">{log.username}</td>
                        <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-navy-900/50">{log.role}</td>
                        <td className="py-3.5 px-4 font-bold text-gold-600">{log.action}</td>
                        <td className="py-3.5 px-4 text-navy-900/60 leading-relaxed max-w-sm font-light">{log.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-navy-900/30 font-semibold italic">
                        No audit events recorded or matched search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB SECTION: POPUPS MANAGER
            ---------------------------------------------------- */}
        {activeTab === "popups" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="font-serif font-black text-lg text-navy-900 uppercase tracking-wide">
                  Popup Manager
                </h3>
                <p className="text-xs text-navy-900/60 font-medium mt-0.5">
                  Create, edit, preview, and delete custom entry popups on the website homepage.
                </p>
              </div>
              <button
                onClick={() => {
                  resetPopupForm();
                  setIsPopupFormOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-950 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus size={14} />
                Create New Popup
              </button>
            </div>

            {/* Popups Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="overflow-x-auto text-left">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-navy-900/50 font-extrabold bg-slate-50/50">
                      <th className="py-4 px-4">Preview</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Heading / Link</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-light">
                    {popups.length > 0 ? (
                      popups.map((p) => {
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              {p.type === "image" && p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt="Preview"
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                                />
                              ) : p.type === "emergency" ? (
                                <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-600">
                                  <AlertTriangle size={16} />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 font-mono text-[9px] uppercase font-bold">
                                  No img
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-medium capitalize text-navy-900/70">
                              {p.type}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-navy-950 max-w-xs truncate">
                              {p.type === "image" ? p.buttonLink || "(No link)" : p.heading}
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handlePopupToggleActive(p.id, p.isActive)}
                                disabled={loading === `toggle-popup-${p.id}`}
                                className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border transition-all ${
                                  p.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-700/25 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                {p.isActive ? "Active" : "Disabled"}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setPreviewPopup(p)}
                                  className="p-1.5 text-navy-900/50 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  title="Live Preview"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => handlePopupEdit(p)}
                                  className="p-1.5 text-navy-900/50 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handlePopupDelete(p.id)}
                                  disabled={loading === `delete-popup-${p.id}`}
                                  className="p-1.5 text-brand-red-700/60 hover:text-brand-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-navy-900/30 font-semibold italic">
                          No popup campaigns created yet. Click "Create New Popup" to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODAL DIALOG: POPUP CREATE / EDIT FORM
            ---------------------------------------------------- */}
        {isPopupFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/65 backdrop-blur-sm overflow-y-auto animate-fadeIn">
            <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6 relative my-8 max-h-[90vh] overflow-y-auto text-left font-sans">
              <button
                onClick={() => {
                  setIsPopupFormOpen(false);
                  setEditingPopupId(null);
                  resetPopupForm();
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-navy-950 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div>
                <h3 className="font-serif font-black text-xl text-navy-900 uppercase tracking-wide">
                  {editingPopupId ? "Edit Popup Campaign" : "Create New Popup"}
                </h3>
                <p className="text-xs text-navy-900/50 mt-1 font-semibold">
                  Configure visual templates. All fields are sanitized automatically.
                </p>
              </div>

              <form onSubmit={handlePopupSubmit} className="space-y-5">
                {/* Popup Type */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Popup Type</label>
                    <select
                      value={popupForm.type}
                      onChange={(e) => setPopupForm((prev) => ({ ...prev, type: e.target.value as Popup["type"] }))}
                      className="px-4 py-2.5 bg-slate-55 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="image">Image Popup</option>
                      <option value="emergency">Emergency Notice</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left justify-center pt-4 pl-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy-900">
                      <input
                        type="checkbox"
                        checked={popupForm.isActive}
                        onChange={(e) => setPopupForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded text-gold-500 focus:ring-gold-500 h-4 w-4 cursor-pointer"
                      />
                      Active Toggle
                    </label>
                  </div>
                </div>

                {/* Conditional Fields based on Type */}
                {popupForm.type === "image" ? (
                  <div className="space-y-5">
                    {/* Image Upload */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Banner Image Upload * (Max 5MB)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePopupFileUpload}
                          className="hidden"
                          id="popup-image-input"
                        />
                        <label
                          htmlFor="popup-image-input"
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-navy-900/10 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer inline-flex items-center gap-2"
                        >
                          {popupUploadLoading === "image" ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          Upload Image
                        </label>
                        {popupForm.imageUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <Check size={12} /> Uploaded
                            </span>
                            <button
                              type="button"
                              onClick={() => setPopupForm((prev) => ({ ...prev, imageUrl: "" }))}
                              className="text-[10px] text-brand-red-700 hover:text-brand-red-800 font-extrabold uppercase tracking-wider underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                      {popupForm.imageUrl && (
                        <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                          <img src={popupForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* CTA Link */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Button / Image Link URL (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. /admissions or https://example.com"
                        value={popupForm.buttonLink}
                        onChange={(e) => setPopupForm((prev) => ({ ...prev, buttonLink: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-gold-500 w-full font-semibold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Heading */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Heading *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. School Closed Tomorrow"
                        value={popupForm.heading}
                        onChange={(e) => setPopupForm((prev) => ({ ...prev, heading: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-gold-500 w-full font-semibold"
                      />
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">Message *</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Enter the emergency notice details..."
                        value={popupForm.message}
                        onChange={(e) => setPopupForm((prev) => ({ ...prev, message: e.target.value }))}
                        className="px-4 py-2.5 bg-slate-50 border border-navy-900/10 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-gold-500 w-full font-light"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPopupFormOpen(false);
                      setEditingPopupId(null);
                      resetPopupForm();
                    }}
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading === "popup-submit"}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-navy-900 hover:bg-navy-950 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading === "popup-submit" ? <Loader2 size={12} className="animate-spin" /> : null}
                    {editingPopupId ? "Save Changes" : "Publish Popup"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODAL DIALOG: POPUP LIVE HOMEPAGE PREVIEW MOCKUP
            ---------------------------------------------------- */}
        {previewPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-md">
            <div className={`relative z-10 w-full shadow-2xl ${
              previewPopup.type === "image" ? "max-w-[1000px] w-[92%] md:w-[85%]" : "max-w-[550px] w-[92%]"
            }`}>
              {/* Close Button */}
              <button
                onClick={() => setPreviewPopup(null)}
                className={`absolute top-4 right-4 z-20 p-2 rounded-full border shadow-md transition-all duration-300 ${
                  previewPopup.type === "image"
                    ? "bg-black/40 hover:bg-black/60 border-white/20 text-white"
                    : "bg-white hover:bg-slate-50 border-slate-100 text-slate-500 hover:text-navy-950"
                }`}
              >
                <X size={20} />
              </button>

              {/* Exact Popup layout representation */}
              {previewPopup.type === "image" && (
                <div className="flex flex-col items-center">
                  {previewPopup.imageUrl ? (
                    <div className="w-full rounded-[20px] overflow-hidden border border-white/10 shadow-2xl bg-black/20">
                      {previewPopup.buttonLink ? (
                        <a
                          href={previewPopup.buttonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block cursor-pointer w-full h-full text-left"
                        >
                          <img
                            src={previewPopup.imageUrl}
                            alt="Special Update"
                            className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                          />
                        </a>
                      ) : (
                        <img
                          src={previewPopup.imageUrl}
                          alt="Special Update"
                          className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/80 p-8 rounded-[20px] text-center w-full text-left">
                      <p className="text-slate-500 text-xs">No image configured.</p>
                    </div>
                  )}

                  {/* Mock Overlay footer options */}
                  <div className="mt-3.5 flex items-center justify-center gap-2 text-white/95 text-xs select-none">
                    <label className="flex items-center gap-2 bg-navy-950/75 border border-white/10 px-4.5 py-2.5 rounded-full backdrop-blur-md cursor-pointer hover:bg-navy-950 transition-colors shadow-md">
                      <input type="checkbox" disabled className="rounded border-slate-300 text-gold-500 h-3.5 w-3.5 bg-white/5 cursor-not-allowed" />
                      <span className="font-semibold uppercase tracking-wider text-[10px]">Don't show again today</span>
                    </label>
                  </div>
                </div>
              )}

              {previewPopup.type === "emergency" && (
                <div className="flex flex-col items-center">
                  <div className="relative w-full rounded-[20px] overflow-hidden bg-white shadow-2xl border-2 border-brand-red-700/30 p-6 md:p-8 text-left">
                    <div className="flex items-center gap-2 text-brand-red-700 font-extrabold uppercase text-xs tracking-wider mb-4.5">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red-700"></span>
                      </div>
                      <AlertTriangle size={16} /> Emergency Notice
                    </div>
                    <h3 className="font-serif text-2xl text-navy-950 leading-tight mb-3">{previewPopup.heading}</h3>
                    <p className="text-slate-700 text-xs leading-relaxed font-medium bg-red-50/50 p-4 rounded-xl border border-red-100/30 whitespace-pre-line">{previewPopup.message}</p>
                  </div>

                  {/* Mock Overlay footer options */}
                  <div className="mt-3.5 flex items-center justify-center gap-2 text-white/95 text-xs select-none">
                    <label className="flex items-center gap-2 bg-navy-950/75 border border-white/10 px-4.5 py-2.5 rounded-full backdrop-blur-md cursor-pointer hover:bg-navy-950 transition-colors shadow-md">
                      <input type="checkbox" disabled className="rounded border-slate-300 text-gold-500 h-3.5 w-3.5 bg-white/5 cursor-not-allowed" />
                      <span className="font-semibold uppercase tracking-wider text-[10px]">Don't show again today</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
