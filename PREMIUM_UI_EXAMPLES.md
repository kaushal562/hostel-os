# 🎨 Premium UI - Integration Examples

Real-world examples of how to integrate premium components into your existing pages.

---

## 📊 Example 1: Admin Dashboard Transformation

### Before (Old)
```tsx
export function AdminDashboard() {
  return (
    <div className="p-6">
      <h1>Admin Dashboard</h1>
      {/* basic cards */}
      {/* basic table */}
    </div>
  );
}
```

### After (Premium)
```tsx
import { PremiumDashboardLayout, PremiumStatsSection, PremiumKPICard, PremiumDataGrid } from "@/components/shared/PremiumDashboardComponents";
import { PremiumActivityFeed } from "@/components/shared/PremiumDashboardComponents";
import { Users, AlertCircle, MessageSquare, Home } from "lucide-react";

export function AdminDashboard() {
  return (
    <PremiumDashboardLayout
      title="Admin Console"
      subtitle="Real-time hostel management intelligence"
    >
      {/* KPI Section */}
      <PremiumStatsSection className="mb-12">
        <PremiumKPICard 
          icon={Users}
          label="Total Students"
          value="420"
          trend="↑ 12% from last month"
          accentColor="cyan"
        />
        <PremiumKPICard 
          icon={Home}
          label="Occupied Rooms"
          value="78/120"
          trend="↑ 5% occupancy"
          accentColor="purple"
        />
        <PremiumKPICard 
          icon={AlertCircle}
          label="Pending Issues"
          value="8"
          trend="↓ 3% from last month"
          accentColor="pink"
        />
        <PremiumKPICard 
          icon={MessageSquare}
          label="Unread Messages"
          value="12"
          trend="↑ 4 new today"
          accentColor="emerald"
        />
      </PremiumStatsSection>

      {/* Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <div className="lg:col-span-2">
          <PremiumDataGrid title="Recent Complaints">
            {/* Your existing table component */}
          </PremiumDataGrid>
        </div>

        {/* Activity Feed */}
        <div>
          <PremiumActivityFeed 
            activities={recentActivities}
          />
        </div>
      </div>
    </PremiumDashboardLayout>
  );
}
```

---

## 🧭 Example 2: Navigation Implementation

### Sidebar + Top Nav
```tsx
import { PremiumSidebar, PremiumTopNav } from "@/components/shared/PremiumNavigation";
import { LayoutDashboard, Users, MessageSquare, AlertCircle, LogOut } from "lucide-react";
import { useState } from "react";

export function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin",
      isActive: true,
    },
    {
      icon: Users,
      label: "Students",
      href: "/admin/students",
      badge: 24,
    },
    {
      icon: AlertCircle,
      label: "Complaints",
      href: "/admin/complaints",
      badge: 8,
    },
    {
      icon: MessageSquare,
      label: "Notifications",
      href: "/admin/notifications",
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <PremiumSidebar 
        items={navItems}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content */}
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-80'} transition-all duration-300`}>
        <PremiumTopNav 
          title="Admin Panel"
          actions={
            <button className="text-slate-400 hover:text-slate-300">
              <LogOut className="w-5 h-5" />
            </button>
          }
        />

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 Example 3: Form Transformation

### Student Registration Form
```tsx
import { PremiumForm, PremiumFormField, PremiumModal, PremiumToast } from "@/components/shared/PremiumFormsAndModals";
import { PremiumButton } from "@/components/shared/PremiumComponents";
import { useState } from "react";

export function StudentRegistrationForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  return (
    <>
      <PremiumButton onClick={() => setIsOpen(true)}>
        Register Student
      </PremiumButton>

      <PremiumModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Register New Student"
        subtitle="Add a new student to the system"
        size="lg"
      >
        <PremiumForm title="Student Details">
          <PremiumFormField label="Full Name" hint="Enter the student's full name">
            <input 
              className="input-premium"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </PremiumFormField>

          <PremiumFormField label="Email Address">
            <input 
              className="input-premium"
              type="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </PremiumFormField>

          <PremiumFormField label="Password">
            <input 
              className="input-premium"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </PremiumFormField>

          <div className="flex gap-3 justify-end pt-4">
            <PremiumButton variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton variant="primary" onClick={() => {
              // Submit form
              setShowToast(true);
              setIsOpen(false);
            }}>
              Create Student
            </PremiumButton>
          </div>
        </PremiumForm>
      </PremiumModal>

      <PremiumToast 
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        type="success"
        message="Student registered successfully!"
        duration={3000}
      />
    </>
  );
}
```

---

## 🗂️ Example 4: Data Grid with Premium Styling

```tsx
import { PremiumDataGrid, PremiumAlert } from "@/components/shared/PremiumDashboardComponents";
import { motion } from "framer-motion";
import { TRANSITIONS } from "@/lib/premium-motion";

export function ComplaintsTable() {
  const complaints = [
    { id: 1, title: "Noisy neighbors", room: "A-204", status: "pending", date: "2024-05-10" },
    { id: 2, title: "Water leak", room: "B-105", status: "in-progress", date: "2024-05-09" },
    { id: 3, title: "AC not working", room: "C-301", status: "resolved", date: "2024-05-08" },
  ];

  const statusColors = {
    pending: "bg-amber-500/20 text-amber-300",
    "in-progress": "bg-blue-500/20 text-blue-300",
    resolved: "bg-emerald-500/20 text-emerald-300",
  };

  return (
    <>
      <PremiumAlert 
        type="info"
        title="Recent Complaints"
        message="Showing 8 pending complaints that need attention"
      />

      <PremiumDataGrid title="All Complaints">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 text-left font-semibold text-slate-300">Title</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-300">Room</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-300">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-300">Date</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint, index) => (
              <motion.tr
                key={complaint.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...TRANSITIONS.smooth, delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4">{complaint.title}</td>
                <td className="px-6 py-4">{complaint.room}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[complaint.status]}`}>
                    {complaint.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{complaint.date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </PremiumDataGrid>
    </>
  );
}
```

---

## 🎯 Example 5: Interactive Dashboard Card

```tsx
import { PremiumCard } from "@/components/shared/PremiumComponents";
import { motion } from "framer-motion";
import { TRANSITIONS } from "@/lib/premium-motion";
import { TrendingUp } from "lucide-react";

export function DashboardCard({ title, data, icon: Icon }) {
  return (
    <PremiumCard hoverable glow="cyan">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-4xl font-bold text-slate-100">{data.value}</h3>
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="p-3 rounded-lg bg-gradient-to-br from-cyan-600/20 to-blue-600/20"
        >
          <Icon className="w-6 h-6 text-cyan-400" />
        </motion.div>
      </div>

      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${data.percentage}%` }}
        transition={TRANSITIONS.slower}
        className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-3"
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{data.label}</span>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-emerald-400 font-semibold"
        >
          ↑ {data.change}%
        </motion.span>
      </div>
    </PremiumCard>
  );
}
```

---

## 🎬 Example 6: Loading States

```tsx
import { PremiumLoadingSpinner, PremiumSkeletonCard } from "@/components/shared/PremiumFormsAndModals";

export function LoadingExample() {
  return (
    <div className="space-y-6">
      {/* Full page loading */}
      <PremiumLoadingSpinner 
        message="Loading your dashboard..." 
        size="lg"
      />

      {/* Card loading skeleton */}
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <PremiumSkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🔔 Example 7: Notifications System

```tsx
import { PremiumToast, PremiumAlert } from "@/components/shared/PremiumFormsAndModals";
import { PremiumDashboardComponents } from "@/components/shared/PremiumDashboardComponents";
import { useState } from "react";

export function NotificationsExample() {
  const [toasts, setToasts] = useState([
    { id: 1, type: "success", message: "Student profile updated" },
    { id: 2, type: "warning", message: "Low room availability" },
    { id: 3, type: "error", message: "Payment processing failed" },
  ]);

  const alerts = [
    {
      type: "warning" as const,
      title: "System Maintenance",
      message: "Scheduled maintenance on Friday, 2 AM - 4 AM UTC",
    },
    {
      type: "success" as const,
      title: "All Systems Operational",
      message: "No issues detected in the last 24 hours",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.map((alert, i) => (
        <PremiumAlert 
          key={i}
          type={alert.type}
          title={alert.title}
          message={alert.message}
        />
      ))}

      {/* Toasts would appear in bottom-right */}
      {toasts.map((toast, i) => (
        <PremiumToast 
          key={toast.id}
          isOpen={true}
          onClose={() => setToasts(toasts.filter((_, idx) => idx !== i))}
          type={toast.type as any}
          message={toast.message}
          duration={0} // Don't auto-close for demo
        />
      ))}
    </div>
  );
}
```

---

## 🎭 Example 8: Tabs & Switching Content

```tsx
import { PremiumTabs } from "@/components/shared/PremiumNavigation";
import { motion } from "framer-motion";
import { TRANSITIONS } from "@/lib/premium-motion";
import { LayoutGrid, List, BarChart3 } from "lucide-react";
import { useState } from "react";

export function TabsExample() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "list", label: "List View", icon: List },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div>
      <PremiumTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITIONS.smooth}
        className="mt-6"
      >
        {activeTab === "overview" && <OverviewContent />}
        {activeTab === "list" && <ListContent />}
        {activeTab === "analytics" && <AnalyticsContent />}
      </motion.div>
    </div>
  );
}

function OverviewContent() { return <div className="glass rounded-lg p-6">Overview content</div>; }
function ListContent() { return <div className="glass rounded-lg p-6">List content</div>; }
function AnalyticsContent() { return <div className="glass rounded-lg p-6">Analytics content</div>; }
```

---

## ✅ Integration Tips

1. **Start with Dashboard** - Highest visual impact
2. **Add Navigation** - Creates unified experience
3. **Update Forms** - Improves user interaction
4. **Add Animations** - Between pages for smoothness
5. **Test on Mobile** - Responsive adjustments
6. **Gather Feedback** - Refine based on usage

---

**Use these examples as templates for your specific use cases!** 🚀
